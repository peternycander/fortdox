const db = require('app/models');
const {
  tempEncryptPrivatekey,
  createNewMasterPassword,
  decryptMasterPassword
} = require('app/encryption/keys/cryptMasterPassword');
const logger = require('app/logger');
const mailer = require('app/mailer');
const users = require('app/users');
const userUtil = require('app/users/User');
const {
  decryptPrivateKey
} = require('app/encryption/authentication/privateKeyEncryption');
const config = require('app/config.json');

module.exports = {
  add,
  createDevice,
  findDeviceFromUserUUID,
  listDevices,
  deleteDevice,
  verify,
  confirm,
  updateName
};

async function updateName(req, res) {
  let deviceIdToUpdate = req.body.deviceId;
  let deviceName = req.body.deviceName;
  logger.info(
    '/devices update name',
    'update name of',
    deviceIdToUpdate,
    'to',
    deviceName
  );
  try {
    let user = await userUtil.getUser(req.session.email);

    await db.Devices.update(
      { deviceName: deviceName },
      {
        where: {
          deviceId: deviceIdToUpdate,
          userid: user.id
        }
      }
    );
  } catch (error) {
    logger.error('/devices update name', error);
    res.status(500).send({ error: 'Could not update name of device' });
  }
  res.status(200).send();
}

async function deleteDevice(req, res) {
  const deviceIdToDelete = req.params.deviceId;
  logger.info('/devices delete', 'Try to delete device:', deviceIdToDelete);

  try {
    let user = await userUtil.getUser(req.session.email);
    await db.Devices.destroy({
      where: {
        userid: user.id,
        deviceId: deviceIdToDelete
      }
    });

    await db.TempKeys.destroy({
      where: {
        uuid: deviceIdToDelete
      }
    });
  } catch (error) {
    logger.error('/devices delete', error);
    return res.status(500).send({
      error: 'Could not delete device'
    });
  }

  res.send();
}

//TODO: Move this to User.js?
async function findDeviceFromUserUUID(uuid) {
  let user = await db.User.findOne({
    where: {
      uuid: uuid
    }
  });
  if (!user) throw new Error(`${uuid} does not match any user.`);
  return await db.Devices.findOne({ where: { userid: user.id } });
}

async function createDevice(forUserId, password, name = 'master-device') {
  return await db.Devices.create({
    userid: forUserId,
    deviceName: name,
    password: password
  });
}

async function add(req, res) {
  let userid = req.session.userid;
  logger.info('/devices add', 'Add new device for', userid);

  let privatekey = req.session.privateKey;
  let encryptedMasterPassword = req.session.mp;
  let { keypair, newEncryptedMasterPassword } = await createNewMasterPassword(
    privatekey,
    encryptedMasterPassword
  );

  let tempPassword, encryptedPrivateKey;
  try {
    ({ tempPassword, encryptedPrivateKey } = await tempEncryptPrivatekey(
      keypair.privateKey
    ));
  } catch (error) {
    logger.error('/devices add', error);
    return res.status(500).send({ error: 'Nah, we cant do that today..' });
  }

  let newDevice;
  try {
    newDevice = await createDevice(userid, newEncryptedMasterPassword);
    await db.TempKeys.create({
      uuid: newDevice.deviceId,
      privateKey: encryptedPrivateKey
    });
  } catch (error) {
    if (error.original && error.original.sqlState === '45000') {
      logger.warn(
        `${req.session.email} tried to exceed the device limit of ${
          config.deviceLimit
        }`
      );
      return res.status(403).send();
    }

    logger.error('/devices add', 'Could not create tempkeys', error);
    return res.status(500).send();
  }

  const inviteCode = '@' + newDevice.deviceId;
  tempPassword = tempPassword.toString('base64');

  logger.info('/devices add', 'Invitecode', inviteCode, '\npwd', tempPassword);
  res.send({
    uuid: inviteCode,
    tempPassword: tempPassword
  });

  if (req.body.email) {
    const mail = mailer.newDeviceRegistration({
      to: req.session.email,
      uuid: inviteCode,
      tempPassword: tempPassword
    });

    mailer.send(mail);
    logger.log('verbose', '/devices add', 'Sent mail to', req.body.email);
  }
}

async function verify(req, res) {
  if (
    req.body.uuid === undefined ||
    req.body.uuid == null ||
    req.body.temporaryPassword === undefined ||
    req.body.temporaryPassword === null
  ) {
    res.status(400).send({ error: 'Malformed request' });
  }

  const inviteCode = req.body.uuid;
  const uuid = inviteCode.slice(1);
  logger.info('/devices/verify', 'Try to verify device', uuid);

  let tempPassword = req.body.temporaryPassword;
  tempPassword = Buffer.from(decodeURIComponent(tempPassword), 'base64');

  let privateKey;
  try {
    const encryptedPrivateKey = new Buffer(
      await users.getEncryptedPrivateKey(uuid),
      'base64'
    );
    privateKey = (await decryptPrivateKey(
      tempPassword,
      encryptedPrivateKey
    )).toString('base64');
  } catch (error) {
    logger.error(
      '/devices/verify',
      'Could not find encryptedPrivatekey in TempKeys',
      error
    );
    return res.status(error).send();
  }

  let newDevice;
  try {
    newDevice = await db.Devices.findOne({
      where: { deviceId: uuid }
    });
    if (!newDevice) throw new Error(`No device with uuid: ${uuid}`);
  } catch (error) {
    logger.error(
      '/devices/verify',
      'Trying verify deviceid with invitation code',
      error
    );
    return res.status(error).send();
  }

  res.send({
    privateKey,
    deviceId: newDevice.deviceId
  });
}

async function confirm(req, res) {
  if (
    req.body.uuid === undefined ||
    req.body.uuid == null ||
    req.body.deviceId === undefined ||
    req.body.deviceId === null ||
    req.body.privateKey === undefined ||
    req.body.privateKey === null
  ) {
    return res.status(400).send({ error: 'Malformed request' });
  }

  const deviceId = req.body.deviceId;
  logger.info('/devices/confirm', 'Trying to confirm device', deviceId);

  const privateKey = Buffer.from(req.body.privateKey, 'base64');

  let deviceJoinUser;
  let device;
  let org;
  try {
    deviceJoinUser = await db.Devices.findOne({
      where: { deviceId: deviceId },
      include: [{ model: db.User }]
    });
    if (!deviceJoinUser) throw new Error('Could not find such devices');
    device = await db.Devices.findOne({
      where: { deviceId: deviceId, userid: deviceJoinUser.User.id }
    });
    if (!device) throw new Error('Could not find device for that user');

    org = await db.Organization.findOne({
      where: { id: deviceJoinUser.User.organizationId }
    });
    if (!org)
      throw new Error('Could not find the organization that user belongs to');
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send()
      .end();
  }
  const encryptedMasterPassword = device.password;
  decryptMasterPassword(privateKey, encryptedMasterPassword);

  try {
    await db.TempKeys.destroy({
      where: {
        uuid: deviceId
      }
    });
  } catch (error) {
    logger.error('/devices/confirm', error);
    return res.status(500).send({
      error: 'Something wentr terribly wrong, we are working hard to fix it'
    });
  }

  let deviceName = req.body.deviceName ? req.body.deviceName : 'Generic Device';

  db.Devices.update(
    {
      activated: true,
      deviceName: deviceName
    },
    { where: { deviceId: deviceId } }
  );

  res.status(200).send({
    email: deviceJoinUser.User.email,
    organization: org.name
  });
}

async function listDevices(req, res) {
  logger.info('/devices list', 'List devices of user', req.session.email);
  let devices = await db.Devices.findAll({
    include: [
      {
        model: db.User,
        where: { email: req.session.email }
      }
    ]
  });

  const result = {
    devices: devices.map(device => {
      return {
        activated: device.activated,
        name: device.deviceName,
        id: device.deviceId
      };
    })
  };

  result.limit = config.deviceLimit;
  res.send(result);
}
