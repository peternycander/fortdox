const users = require('app/users');
const devices = require('app/devices');
const keygen = require('app/encryption/keys/keygen');
const {
  encryptPrivateKey
} = require('app/encryption/authentication/privateKeyEncryption');
const {
  decryptPrivateKey
} = require('app/encryption/authentication/privateKeyEncryption');

const {
  decryptMasterPassword,
  encryptMasterPassword,
  tempEncryptPrivatekey,
  createNewMasterPassword
} = require('app/encryption/keys/cryptMasterPassword');
const mailer = require('app/mailer');
const uuidv1 = require('uuid/v1');
const logger = require('app/logger');

module.exports = {
  user,
  confirm,
  verify
};

async function user(req, res) {
  let privateKey = req.session.privateKey;
  let email = req.session.email;
  let organizationId = req.session.organizationId;
  let newUserEmail = req.body.newUserEmail;
  let encryptedMasterPassword = req.session.mp;
  let sender;
  try {
    sender = await users.getUser(email);
  } catch (error) {
    logger.log('silly', `Could not find sender ${email} @ /invite`);
    return res.status(409).send();
  }

  let { keypair, newEncryptedMasterPassword } = await createNewMasterPassword(
    privateKey,
    encryptedMasterPassword
  );

  let { tempPassword, encryptedPrivateKey } = await tempEncryptPrivatekey(
    keypair.privateKey
  ).catch(error => {
    console.error(error);
    return res.status(500).send({ error: 'Nah, we cant do that today..' });
  });

  //create user

  let uuid = uuidv1();
  let newUser = {
    email: newUserEmail,
    organizationId,
    uuid
  };

  //create device
  try {
    newUser = await users.createUser(newUser);
    devices.createDevice(newUser.id, newEncryptedMasterPassword);

    await users.TempKeys.store(uuid, encryptedPrivateKey);
    logger.log(
      'info',
      `User ${newUser.email} was created and given the UUID ${uuid}`
    );
  } catch (error) {
    return res.status(error).send();
  }

  //mail
  let mail = mailer.newUserRegistration({
    to: newUserEmail,
    organization: sender.Organization.name,
    from: sender.email,
    uuid,
    tempPassword: tempPassword.toString('base64')
  });

  logger.log(
    'silly',
    'Invite mail code:\n',
    uuid,
    '\npwd\n',
    tempPassword.toString('base64')
  );
  try {
    mailer.send(mail);
    logger.log(
      'info',
      `User ${req.body.email} invited ${newUserEmail} to join ${
        sender.Organization.name
      }`
    );
  } catch (error) {
    console.error(error);
    return res.status(400).send('mail');
  }

  //TODO: Chnage so we send pw and uuid to client
  res.send({
    uuid: uuid,
    tempPassword: tempPassword
  });
}

async function verify(req, res) {
  let uuid = req.body.uuid;
  let tempPassword = Buffer.from(
    decodeURIComponent(req.body.temporaryPassword),
    'base64'
  );
  let encryptedPrivateKey;
  let privateKey;
  try {
    encryptedPrivateKey = new Buffer(
      await users.getEncryptedPrivateKey(uuid),
      'base64'
    );
    privateKey = (await decryptPrivateKey(
      tempPassword,
      encryptedPrivateKey
    )).toString('base64');

    let device = await devices.findDeviceFromUserUUID(uuid);
    res.send({
      privateKey,
      deviceId: device.deviceId
    });

    logger.log(
      'silly',
      `Keypair generated and private key was sent to user with UUID ${uuid}`
    );

    return;
  } catch (error) {
    logger.log('error', `Could not find user with UUID ${uuid}`);
    return res.status(500).send();
  }
}

async function confirm(req, res) {
  let uuid = req.body.uuid;
  const deviceId = req.body.deviceId;

  if (!req.body.privateKey) {
    logger.log(
      'silly',
      `Missing private key for ${uuid} when confirming uuid @ /invite/confirm`
    );
    return res.status(400).send();
  }

  let privateKey = Buffer.from(req.body.privateKey, 'base64');

  let metadata;
  try {
    //TODO: Fix here
    metadata = await users.verifyNewUser(deviceId, uuid, privateKey);
    await users.TempKeys.remove(uuid);
    res.send(metadata);
    logger.log(
      'info',
      `User ${metadata.email} was added to ${metadata.organization}`
    );
  } catch (error) {
    logger.log(
      'error',
      `Cannot verify User with uuid ${uuid} @ /invite/confirm`
    );
    return res.status(500).send();
  }
}
