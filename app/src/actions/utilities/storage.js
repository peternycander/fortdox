const { spawn } = window.require('child_process');
const keyChainPath = '/usr/bin/security';
const fortdoxKey = 'fortdox';

const writeDeviceIdToStorage = (deviceId, organization, email) => {
  let fortdoxInfo = readStorage();
  fortdoxInfo[email][organization].deviceId = deviceId;
  window.localStorage.setItem(fortdoxKey, JSON.stringify(fortdoxInfo));
};

const writeStorage = (salt, organization, email, deviceId) => {
  let fortdoxInfo = readStorage();
  fortdoxInfo[email] = {
    [organization]: {
      salt,
      deviceId
    }
  };
  window.localStorage.setItem(fortdoxKey, JSON.stringify(fortdoxInfo));
};
const readStorage = () => {
  let storage;
  storage = window.localStorage.getItem(fortdoxKey);
  if (!storage) {
    window.localStorage.setItem(fortdoxKey, JSON.stringify({}));
    storage = window.localStorage.getItem(fortdoxKey);
  }
  return JSON.parse(storage);
};

const addKey = (privateKey, email, organization) =>
  new Promise((resolve, reject) =>
    spawn(keyChainPath, [
      'add-generic-password',
      '-a',
      `${email}?${organization}`,
      '-s',
      'fortdox',
      '-w',
      privateKey
      //'-T',
      //config.applicationPath
    ])
      .on('close', code => {
        Number(code) === 0 ? resolve(code) : reject(code);
      })
      .on('error', reject)
  );

const readKey = (email, organization) =>
  new Promise((resolve, reject) => {
    const pwd = [];
    spawn(keyChainPath, [
      'find-generic-password',
      '-a',
      `${email}?${organization}`,
      '-s',
      'fortdox',
      '-g'
    ])
      .on('error', e => reject(e))
      .stderr.on('data', d => pwd.push(d))
      .on('close', code => {
        Number(code) === 0 ? resolve(pwd.toString()) : reject(code);
      });
  });

module.exports = {
  writeStorage,
  writeDeviceIdToStorage,
  readStorage,
  addKey,
  readKey
};
