const db = require('app/models');

module.exports = organization => {
  return new Promise(async (resolve, reject) => {
    let org;
    try {
      org = await db.Organization.findOne({where: {name: organization}});
    } catch (error) {
      console.error(error);
      return reject(500);
    }
    if (org) {
      return reject(409);
    }
    let newOrganization;
    try {
      newOrganization = await db.Organization.create({name: organization});
      return resolve(newOrganization);
    } catch (error) {
      console.error(error);
      return reject(500);
    }
  });
};
