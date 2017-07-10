const cryptMP = require('../keys/cryptMasterPassword.js');
const aes = require('./aes');

const encryptDocument = (data, privateKey, encryptedMasterPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      let masterPassword = await cryptMP.decryptMasterPassword(privateKey, encryptedMasterPassword);
      let encryptedData = await aes.encrypt(masterPassword, data);
      return resolve(encryptedData);
    } catch (error) {
      console.error(error);
      return reject(409);
    }
  });
};

const decryptDocuments = (encryptedDataList, privateKey, encryptedMasterPassword) => {
  return new Promise(async (resolve, reject) => {
    let masterPassword;
    try {
      masterPassword = await cryptMP.decryptMasterPassword(privateKey, encryptedMasterPassword);
    } catch (error) {
      console.error(error);
      return reject(500);
    }
    encryptedDataList.map((entry) => {
      entry._source.text = aes.decrypt(masterPassword, new Buffer(entry._source.text, 'base64')).toString('base64');
    });

    return resolve(encryptedDataList);
  });
};

module.exports = {encryptDocument, decryptDocuments};
