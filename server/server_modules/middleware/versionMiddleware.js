const logger = require('app/logger');
const config = require('app/config');

const whitelist = ['update', '-redirect'];

function inWhitelist(path) {
  return whitelist
    .map(e => {
      return path.includes(e);
    })
    .some(b => {
      return b === true;
    });
}

const checkVersion = function(req, res, next) {
  if (req.method.toUpperCase() === 'OPTIONS' || inWhitelist(req.path)) {
    logger.info('version', req.path, 'bypassed version check');
    next();
    return;
  }

  const version = req.get('x-fortdox-version');
  if (correctVersion(version)) {
    logger.log('verbose', 'Client\'s version is okay');
    next();
  } else {
    logger.info('version', 'Client with outdated version');
    res.set('x-fortdox-required-version', config.clientVersion);
    res.statusCode = 400;
    res.send({
      message: `Unsupported version, please use ${config.clientVersion}`
    });
    res.end();
  }
};

function correctVersion(version) {
  if (typeof version !== 'string') {
    return false;
  }

  const longest = Math.max(
    version.split('.').length,
    config.clientVersion.split('.').length
  );

  return numerify(version, longest) >= numerify(config.clientVersion, longest);

  function numerify(v, maxLength) {
    const num = parseInt(v.replace(/\./gi, '').padEnd(maxLength, '0'));
    if (isNaN(num)) {
      return -Infinity;
    }

    return num;
  }
}

module.exports = { checkVersion, correctVersion };
