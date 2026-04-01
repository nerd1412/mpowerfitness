const express = require('express');
const { protect } = require('../middleware/auth');
const { getConversations, sendMessage, getMessages } = require('../controllers/chatController');

const router = express.Router();
router.use(protect);

router.get('/conversations', getConversations);
router.post('/send', sendMessage);
router.get('/:conversationId/messages', getMessages);

module.exports = router;
