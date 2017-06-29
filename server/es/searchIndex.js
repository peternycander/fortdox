const encryptDocument = require('../authentication/cryptDocument');

module.exports = client => {
  const addIndex = async query => {
    let response;
    let privateKey = query.privateKey;
    let data = query.body.text;
    let encryptedData;
    try {
      encryptedData = await encryptDocument(data, privateKey);
    } catch (error) {
      console.error(error);
    }
    query.body.text = encryptedData;
    try {
      response = await client.index({
        index: query.index,
        type: query.type,
        body: query.body,
        refresh: true
      });
      return response;
    } catch (error) {
      console.error(error);
      return 500;
    }
  };

  return addIndex;
};