const { AuditLog } = require('../models/index');

/**
 * auditLog — fire-and-forget audit record writer.
 * Call inside route handlers after the action succeeds.
 *
 * @param {object} req      - Express request (provides actor + IP)
 * @param {string} action   - Snake-case constant, e.g. 'TRAINER_APPROVED'
 * @param {object} target   - { model, id, name }
 * @param {object} detail   - Arbitrary extra info stored as JSON
 */
const auditLog = async (req, action, target = {}, detail = {}) => {
  try {
    const actor = req.user || req.admin || {};
    await AuditLog.create({
      actorId:    actor.id || actor._id,
      actorModel: actor.role === 'admin' || actor.role === 'superadmin' ? 'Admin' : 'User',
      actorName:  actor.name || actor.email,
      action,
      targetModel: target.model || null,
      targetId:    target.id   || null,
      targetName:  target.name || null,
      detail,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
    });
  } catch (_) {
    // Audit failures must never crash the main request
  }
};

module.exports = { auditLog };
