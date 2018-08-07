const expect = require('@edgeguideab/expect');
const logger = require('app/logger');
const db = require('app/models');
const acu = require('./accessControlUnit');

async function updateUserPermission(req, res) {
  const expectations = expect(
    { email: 'string', permission: 'number' },
    req.body
  );
  if (!expectations.wereMet()) {
    logger.error('/permissions POST', 'Client sent request that was invalid');
    return res
      .status(400)
      .send({
        message: 'Malformed request'
      })
      .end();
  }

  const newPermission = req.body.permission;
  const userEmail = req.body.email;

  if (!acu(req.session.permission).canSet(newPermission)) {
    logger.warn(
      '/permissions POST',
      `${
        req.session.email
      } tried to grant permission ${newPermission} to ${userEmail}`
    );
    return res.status(400).send();
  }

  try {
    const update = await db.User.update(
      { permission: newPermission },
      {
        where: { email: userEmail, organizationId: req.session.organizationId }
      }
    );

    if (!update[0]) {
      logger.info(
        '/permissions POST',
        `Could NOT grant permission ${newPermission} to ${userEmail}`
      );
      return res.status(400).send();
    }

    logger.info(
      '/permissions POST',
      `Permission ${newPermission} granted to ${userEmail}`
    );
    res.send();
  } catch (error) {
    res.status(500).send();
  }
}

module.exports = updateUserPermission;
