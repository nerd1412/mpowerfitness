const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { CommunityGroup, CommunityPost } = require('../models/index');
const { Op } = require('sequelize');

// ── GET all groups ──────────────────────────────────
router.get('/groups', async (req, res) => {
  try {
    const groups = await CommunityGroup.findAll({
      where: { isActive: true },
      order: [['isFeatured', 'DESC'], ['memberCount', 'DESC']],
    });
    res.json({ success: true, groups });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── GET posts in a group ────────────────────────────
router.get('/groups/:slug/posts', async (req, res) => {
  try {
    const group = await CommunityGroup.findOne({ where: { slug: req.params.slug } });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const { page = 1, limit = 20, type } = req.query;
    const where = { groupId: group.id, isApproved: true };
    if (type) where.type = type;
    const posts = await CommunityPost.findAll({
      where, order: [['isPinned', 'DESC'], ['createdAt', 'DESC']],
      limit: +limit, offset: (+page - 1) * +limit,
    });
    res.json({ success: true, group, posts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── POST: create post ───────────────────────────────
router.post('/groups/:slug/posts', protect, async (req, res) => {
  try {
    const group = await CommunityGroup.findOne({ where: { slug: req.params.slug } });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const { content, type = 'discussion', tags = [] } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required' });
    const post = await CommunityPost.create({
      groupId: group.id,
      authorId: req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role || 'user',
      content: content.trim(), type, tags,
    });
    await group.increment('memberCount', { by: 0 }); // keep memberCount updated via join tracking
    res.status(201).json({ success: true, post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── PATCH: toggle like ──────────────────────────────
router.patch('/posts/:id/like', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const likedBy = post.likedBy || [];
    const uid = req.user.id;
    const already = likedBy.includes(uid);
    post.likedBy = already ? likedBy.filter(id => id !== uid) : [...likedBy, uid];
    post.likes = post.likedBy.length;
    await post.save();
    res.json({ success: true, liked: !already, likes: post.likes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── DELETE post (author or admin) ───────────────────
router.delete('/posts/:id', protect, async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const isOwner = post.authorId === req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });
    await post.destroy();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
