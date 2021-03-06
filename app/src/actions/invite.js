import { encryptPrivateKey } from 'actions/utilities/encryptPrivateKey';
const requestor = require('@edgeguideab/client-request');
const passwordCheck = require('actions/utilities/passwordCheck');
const config = require('config');
const {
  addKey,
  writeStorage,
  readKey,
  deleteKey,
  writeStorageWindows
} = require('actions/utilities/storage');
const checkEmptyFields = require('actions/utilities/checkEmptyFields');
const deviceIdentifier = '@';
const { hostname } = require('actions/utilities/hostname');

export const inviteUser = existingUser => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'INVITE_USER_START'
    });

    let state = getState();
    let fields = state.invite.get('fields');
    let emptyFields = checkEmptyFields(fields);
    if (emptyFields.count() > 0 && !existingUser) {
      let errorField = {};
      errorField[emptyFields.get(0)[0]] = {
        error: 'Please enter an email'
      };
      return dispatch({
        type: 'INVITE_USER_FAIL',
        payload: errorField
      });
    }

    let newUserEmail = existingUser
      ? existingUser
      : fields.getIn(['email', 'value']);
    let email = state.user.get('email');

    try {
      if (existingUser) {
        await requestor.post(`${config.server}/reinvite`, {
          body: {
            reinviteEmail: newUserEmail
          }
        });
      } else {
        await requestor.post(`${config.server}/invite`, {
          body: {
            newUserEmail
          }
        });
      }
    } catch (error) {
      console.error(error);
      switch (error.status) {
        case 400:
          return dispatch({
            type: 'INVITE_USER_ERROR',
            payload:
              'Invitation could not be sent. Please check the email address.'
          });
        case 409:
          return dispatch({
            type: 'INVITE_USER_ERROR',
            payload: `${email} has already joined the team.`
          });
        case 408:
        case 500:
        default:
          return dispatch({
            type: 'INVITE_USER_ERROR',
            payload: 'Unable to connect to server. Please try again later.'
          });
      }
    }

    return dispatch({
      type: 'INVITE_USER_SUCCESS',
      payload: {
        text: 'Invitation has been sent to ',
        bold: newUserEmail,
        text2: '!'
      }
    });
  };
};

export const receivePrivateKey = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'RECEIVE_PRIVATE_KEY_START'
    });

    if (window.localStorage.getItem('activeUser')) {
      window.localStorage.removeItem('activeUser');
    }

    let state = getState();
    let uuid = state.verifyUser.getIn(['fields', 'uuid', 'value']);
    let temporaryPassword = state.verifyUser.getIn([
      'fields',
      'temporaryPassword',
      'value'
    ]);

    let errorFields = {};
    if (uuid === '') errorFields['uuid'] = { error: 'Please enter uuid.' };
    if (temporaryPassword === '')
      errorFields['temporaryPassword'] = {
        error: 'Please enter temporary password.'
      };
    if (Object.keys(errorFields).length !== 0)
      return dispatch({
        type: 'RECEIVE_PRIVATE_KEY_FAIL',
        payload: errorFields
      });

    let response;
    try {
      response = await requestor.post(
        uuid.charAt(0) === deviceIdentifier
          ? `${config.server}/devices/verify`
          : `${config.server}/invite/verify`,
        {
          body: {
            temporaryPassword,
            uuid
          }
        }
      );
    } catch (error) {
      console.error(error);
      switch (error.status) {
        case 408:
        case 500:
        default:
          return dispatch({
            type: 'RECEIVE_PRIVATE_KEY_ERROR',
            payload: 'Email is already verified or the link is broken.'
          });
      }
    }

    return dispatch({
      type: 'RECEIVE_PRIVATE_KEY_SUCCESS',
      payload: {
        privateKey: response.body.privateKey,
        deviceId: response.body.deviceId
      }
    });
  };
};

export const verifyUser = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'VERIFY_NEW_USER_START'
    });

    let state = getState();
    let fields = state.verifyUser.get('fields');
    let emptyFields = checkEmptyFields(fields);
    if (emptyFields.length > 0) {
      let newFields = {};
      emptyFields.forEach(entry => {
        let error;
        switch (entry[0]) {
          case 'password':
            error = 'Please enter a password.';
            break;
          case 'retypedPassword':
            error = 'Please re-enter your password.';
            break;
          default:
            console.error('Unexpected error');
            error = 'Something went terrible wrong';
            break;
        }
        newFields[entry[0]] = {
          error: {
            error
          }
        };
      });
      return dispatch({
        type: 'VERIFY_NEW_USER_FAIL',
        payload: newFields
      });
    }

    let password = fields.getIn(['password', 'value']);
    let retypedPassword = fields.getIn(['retypedPassword', 'value']);
    let privateKey = state.verifyUser.get('privateKey');
    let pwResult = passwordCheck(password, retypedPassword);
    if (!pwResult.valid) {
      if (pwResult.fault === 'password')
        return dispatch({
          type: 'VERIFY_NEW_USER_PASSWORD_FAIL',
          payload: pwResult.errorMsg
        });
      if (pwResult.fault === 'retypedPassword')
        return dispatch({
          type: 'VERIFY_NEW_USER_PASSWORD_MISSMATCH_FAIL',
          payload: pwResult.errorMsg
        });
    }

    let result;
    try {
      result = await encryptPrivateKey(privateKey, password);
    } catch (error) {
      console.error(error);
      return dispatch({
        type: 'VERIFY_NEW_USER_ERROR',
        payload: 'Something went wrong. Please try again.'
      });
    }

    let response;
    let uuid = state.verifyUser.getIn(['fields', 'uuid', 'value']);
    let deviceId = state.verifyUser.get('deviceId');
    let deviceName = hostname();
    deviceName = deviceName ? deviceName : 'Desktop Device';

    try {
      response = await requestor.post(
        uuid.charAt(0) === deviceIdentifier
          ? `${config.server}/devices/confirm`
          : `${config.server}/invite/confirm`,
        {
          body: {
            uuid,
            privateKey,
            deviceId,
            deviceName
          }
        }
      );
    } catch (error) {
      console.error(error);
      switch (error.status) {
        case 400:
          return dispatch({
            type: 'VERIFY_NEW_USER_ERROR',
            payload: 'Bad request. Please try again.'
          });
        case 408:
        case 500:
        default:
          return dispatch({
            type: 'VERIFY_NEW_USER_ERROR',
            payload: 'Unable to connect to server. Please try again later.'
          });
      }
    }

    const salt = result.salt;
    const organization = response.body.organization;
    const email = response.body.email;
    const encryptedPrivateKey = result.privateKey;
    const os = window.process.platform;
    let oldUser;
    if (os === 'darwin') {
      try {
        oldUser = await readKey(email, organization);
      } catch (error) {
        console.error(error);
        return dispatch({
          type: 'VERIFY_NEW_USER_ERROR',
          payload: 'Unable to register. Please try again later.'
        });
      }

      if (oldUser.split('"')[0].trim() === 'password:') {
        try {
          await deleteKey(email, organization);
        } catch (error) {
          console.error(error);
          return dispatch({
            type: 'VERIFY_NEW_USER_ERROR',
            payload: 'Unable to register. Please try again later.'
          });
        }
      }

      try {
        await addKey(encryptedPrivateKey, email, organization);
      } catch (error) {
        console.error(error);
        return dispatch({
          type: 'VERIFY_NEW_USER_ERROR',
          payload: 'Unable to register. Please try again later.'
        });
      }
      writeStorage(salt, organization, email, deviceId);
    } else if (os === 'win32') {
      writeStorageWindows(
        salt,
        organization,
        email,
        encryptedPrivateKey,
        deviceId
      );
    } else {
      dispatch({
        type: 'VERIFY_NEW_USER_ERROR',
        payload: 'Unable to register. Please run FortDox on Mac OS or Windows.'
      });
    }

    return dispatch({
      type: 'VERIFY_NEW_USER_SUCCESS',
      payload: {
        privateKey,
        organization,
        email,
        message: 'Registration complete! You can now login.'
      }
    });
  };
};

export const deleteUser = email => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'DELETE_USER_START'
    });

    const user = getState().user.get('email');
    if (user === email)
      return dispatch({
        type: 'DELETE_USER_ERROR',
        payload: 'You can\'t remove yourself from the organization'
      });

    try {
      await requestor.delete(`${config.server}/users/${email}`);
    } catch (error) {
      console.error(error);
      let message = 'Server error';
      switch (error.status) {
        case 404:
          message = `${email} can't be found.`;
          break;
        case 500:
        default:
          message = 'Return internal server error';
          break;
      }
      return dispatch({
        type: 'DELETE_USER_ERROR',
        message
      });
    }

    dispatch({
      type: 'DELETE_USER_SUCCESS',
      payload: {
        bold: `${email}`,
        text2: ' has been successfully removed form the organization.'
      }
    });
  };
};

export default { inviteUser, receivePrivateKey, verifyUser, deleteUser };
