const { Op } = require('sequelize');
const { Message, Conversation, User, Trainer } = require('../models/index');

const enrichParticipant = async (p) => {
  const Model = p.participantModel === 'User' ? User : Trainer;
  const entity = await Model.findByPk(p.participantId, { attributes: ['id', 'name', 'avatar'] });
  return { ...p, name: entity?.name, avatar: entity?.avatar };
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: { participants: { [Op.like]: `%${userId}%` } },
      order: [['lastMessageAt', 'DESC']],
    });

    const enriched = await Promise.all(
      conversations.map(async (convo) => {
        const lastMessage = convo.lastMessageId
          ? await Message.findByPk(convo.lastMessageId)
          : null;
        const enrichedParts = await Promise.all((convo.participants || []).map(enrichParticipant));
        return { ...convo.toJSON(), participants: enrichedParts, lastMessage };
      })
    );

    res.json({ success: true, conversations: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, recipientModel, content } = req.body;
    if (!content?.trim())
      return res.status(400).json({ success: false, message: 'Message content required' });

    const senderModel =
      req.userRole === 'user' ? 'User' : req.userRole === 'trainer' ? 'Trainer' : 'Admin';

    let convo = conversationId ? await Conversation.findByPk(conversationId) : null;

    if (!convo && recipientId) {
      const all = await Conversation.findAll({
        where: { participants: { [Op.like]: `%${req.user.id}%` } },
      });
      convo =
        all.find((c) => {
          const parts = c.participants || [];
          return (
            parts.some((p) => p.participantId === req.user.id) &&
            parts.some((p) => p.participantId === recipientId)
          );
        }) || null;
    }

    if (!convo && recipientId) {
      convo = await Conversation.create({
        participants: [
          {
            participantId: req.user.id,
            participantModel: senderModel,
            name: req.user.name,
            avatar: req.user.avatar,
          },
          { participantId: recipientId, participantModel: recipientModel || 'User' },
        ],
        lastMessageAt: new Date(),
      });
    }

    if (!convo)
      return res
        .status(400)
        .json({ success: false, message: 'Could not find or create conversation' });

    const message = await Message.create({
      conversationId: convo.id,
      senderId: req.user.id,
      senderModel,
      content: content.trim(),
    });

    convo.lastMessageId = message.id;
    convo.lastMessageAt = new Date();
    const unreadCounts = { ...(convo.unreadCounts || {}) };
    if (recipientId) unreadCounts[recipientId] = (unreadCounts[recipientId] || 0) + 1;
    convo.unreadCounts = unreadCounts;
    await convo.save();

    const io = req.app.get('io');
    if (io && recipientId) {
      io.to(`user_${recipientId}`).emit('new_message', {
        message: message.toJSON(),
        conversationId: convo.id,
      });
      io.to(`trainer_${recipientId}`).emit('new_message', {
        message: message.toJSON(),
        conversationId: convo.id,
      });
    }

    res.status(201).json({ success: true, message: message.toJSON(), conversationId: convo.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { before, limit = 50 } = req.query;
    const where = { conversationId: req.params.conversationId };
    if (before) where.createdAt = { [Op.lt]: new Date(before) };

    const messages = await Message.findAll({
      where,
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
    });

    // Mark as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversationId: req.params.conversationId,
          senderId: { [Op.ne]: req.user.id },
          isRead: false,
        },
      }
    );

    // Reset unread count for this user
    const convo = await Conversation.findByPk(req.params.conversationId);
    if (convo) {
      const counts = { ...(convo.unreadCounts || {}) };
      delete counts[req.user.id];
      convo.unreadCounts = counts;
      await convo.save();
    }

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getConversations, sendMessage, getMessages };
