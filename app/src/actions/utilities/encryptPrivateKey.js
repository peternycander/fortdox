const electron = window.require('electron');
const aes = electron.remote.require('./aes.js');

export const encryptPrivateKey = (privateKey, password) => {
  return new Promise(async (resolve, reject) => {
    let result;
    try {
      result = await aes.generatePaddedKey(password);
    } catch (error) {
      console.error(error);
      return reject(error);
    }
    let encryptedKey;
    try {
      encryptedKey = await aes.encrypt(
        new window.Buffer(result.key, 'base64'),
        new window.Buffer(privateKey, 'base64')
      );
    } catch (error) {
      console.error(error);
      return reject(error);
    }
    return resolve({
      privateKey: encryptedKey.toString('base64'),
      salt: result.salt.toString('base64')
    });
  });
};

export default encryptPrivateKey;
