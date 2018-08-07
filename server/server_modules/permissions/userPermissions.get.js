const db = require('app/models');
const logger = require('app/logger');

async function userPermissions(req, res) {
  const email = req.session.email;
  logger.info('/permissions/me', `${email} checks for its permissions`);
  try {
    const user = await db.User.findOne({ where: { email: email } });
    if (!user) {
      logger.error('/permissions/me', `Did not finde user ${email}`);
      return res.status(500).send();
    }

    return res.send({ permission: user.permission });
  } catch (error) {
    logger.error('/permissions/me', `Could not query db for user ${email}`);
    return res.status(500).send();
  }
}

module.exports = userPermissions;
