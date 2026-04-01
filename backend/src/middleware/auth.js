const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Trainer, Admin } = require('../models/index');

const JWT_SECRET = process.env.JWT_SECRET || 'mpower_jwt_secret_dev_key_min_64_chars_long_enough';
const JWT_REFRESH = process.env.JWT_REFRESH_SECRET || 'mpower_refresh_secret_dev_key_min_64_chars_long';

const generateTokens = (id, role) => {
  const accessToken = jwt.sign({ id, role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '2h' });
  const refreshToken = jwt.sign({ id, role }, JWT_REFRESH, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' });
  return { accessToken, refreshToken };
};

const hashPassword = (pw) => bcrypt.hash(pw, parseInt(process.env.BCRYPT_ROUNDS) || 10);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    let user;
    if (decoded.role === 'user') user = await User.findByPk(decoded.id);
    else if (decoded.role === 'trainer') user = await Trainer.findByPk(decoded.id);
    else if (['admin','superadmin'].includes(decoded.role)) user = await Admin.findByPk(decoded.id);

    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'User not found or inactive' });
    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) return res.status(403).json({ success: false, message: `Role '${req.userRole}' is not authorized` });
  next();
};

const refreshTokenMiddleware = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, JWT_REFRESH);
    let user;
    if (decoded.role === 'user') user = await User.findByPk(decoded.id);
    else if (decoded.role === 'trainer') user = await Trainer.findByPk(decoded.id);
    else user = await Admin.findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    const tokens = generateTokens(user.id, decoded.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    res.json({ success: true, ...tokens });
  } catch { res.status(401).json({ success: false, message: 'Invalid or expired refresh token' }); }
};

module.exports = { generateTokens, hashPassword, comparePassword, protect, authorize, refreshTokenMiddleware };
