const db = require('app/models');

module.exports = (organization, indexName) => {
  return new Promise(async (resolve, reject) => {
    let org;
    try {
      org = await db.Organization.findOne({
        where: {
          name: organization,
          activated: false
        }
      });

      if (!org) {
        return reject(409);
      }
    } catch (error) {
      console.error(error);
      return reject(500);
    }

    try {
      await org.updateAttributes({ activated: true, indexName });
      return resolve();
    } catch (error) {
      console.error(error);
      return reject(500);
    }
  });
};
