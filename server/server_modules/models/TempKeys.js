module.exports = function(sequelize, DataTypes) {
  var TempKeys = sequelize.define(
    'TempKeys',
    {
      uuid: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        unique: true,
        type: DataTypes.UUID
      },
      privateKey: {
        allowNull: false,
        type: DataTypes.BLOB
      }
    },
    {
      updatedAt: false
    }
  );
  return TempKeys;
};
