const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      name: 'info-file',
      filename: __dirname + '/../../logs/filelog-info.log',
      level: 'info',
      timestamps: true
    }),
    new winston.transports.File({
      name: 'error-file',
      filename: __dirname + '/../../logs/filelog-error.log',
      level: 'error',
      timestamps: true
    }),
    new winston.transports.File({
      name: 'warn-file',
      filename: __dirname + '/../../logs/filelog-warn.log',
      level: 'warn',
      timestamps: true
    }),
    new winston.transports.File({
      name: 'silly-file',
      filename: __dirname + '/../../logs/filelog-silly.log',
      level: 'silly',
      timestamps: true
    }),
    new winston.transports.Console({
      level: 'info',
      colorize: true,
      timestamps: true
    })
  ]
});

module.exports = logger;
