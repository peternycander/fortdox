const config = require('app/config');
let request = require('request-promise').defaults({
  headers: { 'x-fortdox-version': config.clientVersion }
});

const uuidv4 = require('uuid/v4');
const fs = require('fs-extra');
const expect = require('@edgeguideab/expect');
const { login } = require('./login.it.js');

const steps = 8;
let success = 0;
const testName = 'Invite Flow Test';

function run() {
  console.log(`### ${testName} ###`);
  return test()
    .then(() => {
      return new Promise(resolve => {
        console.log('Sucess!');
        console.log();
        console.log(`TEST SUMMARY ${testName} ###`);
        console.log(`${success} steps passed of ${steps} of ${testName}`);

        console.log();
        resolve();
      });
    })
    .catch(error => {
      console.error(`Test of ${testName} failed: `);
      console.log();
      console.error('\t*  ', error.message);
      console.log();
      console.log('### TEST SUMMARY ###');
      console.log(`${success} steps passed of ${steps} of ${testName}`);
    });
}

async function test() {
  //read credentials files obtained from login.test.js
  let credentials = JSON.parse(
    fs.readFileSync(`${__dirname}/tmp/credentials-token.tmp.json`)
  );

  let inviteCode;
  try {
    inviteCode = await inviteUser(credentials);
    success++;
  } catch (error) {
    throw error;
  }

  let newUser;
  try {
    newUser = await verifyUser(inviteCode, credentials);
    success++;
  } catch (error) {
    throw error;
  }
  newUser.uuid = inviteCode.uuid;

  let confirm;
  try {
    confirm = await confirmUser(newUser);
    success++;
  } catch (error) {
    throw error;
  }

  newUser.email = confirm.email;

  try {
    await login(newUser);
    success++;
  } catch (error) {
    throw error;
  }

  //Testing reinvite flow down here..
  try {
    inviteCode = await reInviteUser(newUser, credentials);
    success++;
  } catch (error) {
    throw error;
  }

  try {
    newUser = await verifyUser(inviteCode, credentials);
    success++;
  } catch (error) {
    throw error;
  }
  newUser.uuid = inviteCode.uuid;

  try {
    confirm = await confirmUser(newUser);
    success++;
  } catch (error) {
    throw error;
  }

  newUser.email = confirm.email;

  try {
    await login(newUser);
    success++;
  } catch (error) {
    throw error;
  }
}

async function inviteUser(credentials) {
  try {
    let response = await request('http://localhost:8000/invite', {
      method: 'POST',
      auth: {
        bearer: credentials.token
      },
      body: {
        email: credentials.email,
        newUserEmail: `${uuidv4()}@example.org`
      },
      json: true
    });

    const expectations = expect(
      { uuid: 'string', tempPassword: 'string' },
      response
    );

    if (!expectations.wereMet()) {
      throw {
        message: `/invite did not return expected fields..
              Extra info ${expectations.errors().toString()}`
      };
    }

    return response;
  } catch (error) {
    throw {
      message: `/invite 
              :- Failed with statuscode ${error.statusCode}
              :- error message: ${error.message}`,
      orginalError: error
    };
  }
}

async function verifyUser(inviteCode) {
  try {
    let response = await request('http://localhost:8000/invite/verify', {
      method: 'POST',
      body: {
        uuid: inviteCode.uuid,
        temporaryPassword: inviteCode.tempPassword
      },
      json: true
    });

    const expectations = expect(
      { privateKey: 'string', deviceId: 'string' },
      response
    );

    if (!expectations.wereMet()) {
      throw {
        message: `/invite/verify did not return expected fields..
              Extra info ${expectations.errors().toString()}`
      };
    }

    return response;
  } catch (error) {
    throw {
      message: `/verify 
              :- Failed with statuscode ${error.statusCode}
              :- error message: ${error.message}`,
      orginalError: error
    };
  }
}

async function confirmUser(newUser) {
  try {
    let response = await request('http://localhost:8000/invite/confirm', {
      method: 'POST',
      body: {
        privateKey: newUser.privateKey,
        uuid: newUser.uuid,
        deviceId: newUser.deviceId,
        deviceName: 'Invited user device gurka'
      },
      json: true
    });

    const expectations = expect(
      { email: 'string', organization: 'string' },
      response
    );

    if (!expectations.wereMet()) {
      throw {
        message: `/invite/verify did not return expected fields..
              Extra info ${expectations.errors().toString()}`
      };
    }

    return response;
  } catch (error) {
    throw {
      message: `/verify 
              :- Failed with statuscode ${error.statusCode}
              :- error message: ${error.message}`,
      orginalError: error
    };
  }
}

async function reInviteUser(user, credentials) {
  try {
    let response = await request('http://localhost:8000/reinvite', {
      method: 'POST',
      body: {
        reinviteEmail: user.email
      },
      auth: {
        bearer: credentials.token
      },
      json: true
    });

    const expectations = expect(
      { uuid: 'string', tempPassword: 'string' },
      response
    );

    if (!expectations.wereMet()) {
      throw {
        message: `/reinvite did not return expected fields..
              Extra info ${expectations.errors().toString()}`
      };
    }

    return response;
  } catch (error) {
    throw {
      message: `/reinvite 
              :- Failed with statuscode ${error.statusCode}
              :- error message: ${error.message}`,
      orginalError: error
    };
  }
}

module.exports = { run };
