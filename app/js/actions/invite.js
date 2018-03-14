const requestor = require('@edgeguideab/client-request');
const passwordCheck = require('actions/utilities/passwordCheck');
const encryptPrivateKey = require('actions/utilities/encryptPrivateKey');
const config = require('../../config.json');
const {writeStorage} = require('actions/utilities/storage');
const checkEmptyFields = require('actions/utilities/checkEmptyFields');

const inviteUser = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'INVITE_USER_START'
    });

    let state = getState();
    let fields = state.invite.get('fields');
    let emptyFields = checkEmptyFields(fields);
    if (emptyFields.length > 0) {
      let errorField = {};
      errorField[emptyFields[0][0]] = {
        error: 'Please enter an email'
      };
      return dispatch({
        type: 'INVITE_USER_FAIL',
        payload: errorField
      });
    }
    let newUserEmail = fields.getIn(['email', 'value']);
    let email = state.user.get('email');
    try {
      await requestor.post(`${config.server}/invite`, {
        body: {
          email,
          newUserEmail
        }
      });
    } catch (error) {
      console.error(error);
      switch (error.status) {
        case 400:
          if (error.body == 'mail') return dispatch({
            type: 'INVITE_USER_ERROR',
            payload: 'Invitation could not be sent. Please check the email address.'
          });
          if (error.body == 'header') return dispatch({
            type: 'INVITE_USER_ERROR',
            payload: 'Bad request. Please try again.'
          });
          break;
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

const receivePrivateKey = () => {
  return async (dispatch, getState) => {
    let state = getState();
    let uuid = state.verifyUser.get('uuid');
    let temporaryPassword = state.verifyUser.get('temporaryPassword');
    dispatch({
      type: 'RECEIVE_PRIVATE_KEY_START'
    });

    let response;
    try {
      response = await requestor.post(`${config.server}/invite/verify`, {
        body: {
          temporaryPassword,
          uuid
        }
      });
    } catch (error) {
      console.error(error);
      switch (error.status) {
        case 408:
        case 500:
          return dispatch({
            type: 'RECEIVE_PRIVATE_KEY_ERROR',
            payload: 'Email is already verified or the link is broken.'
          });
      }
    }

    return dispatch({
      type: 'RECEIVE_PRIVATE_KEY_SUCCESS',
      payload: response.body.privateKey
    });
  };
};

const verifyUser = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'VERIFY_NEW_USER_START'
    });

    let state = getState();
    let fields = state.verifyUser.get('fields');
    let emptyFields = checkEmptyFields(fields);
    if (emptyFields.length > 0) {
      let newFields = {};
      emptyFields.forEach((entry) => {
        let error;
        switch (entry[0]) {
          case 'password':
            error = 'Please enter a password.';
            break;
          case 'retypedPassword':
            error = 'Please re-enter your password.';
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
      if (pwResult.fault == 'password') return dispatch({
        type: 'VERIFY_NEW_USER_PASSWORD_FAIL',
        payload: pwResult.errorMsg
      });
      if (pwResult.fault == 'retypedPassword') return dispatch({
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
    let uuid = state.verifyUser.get('uuid');
    try {
      response = await requestor.post(`${config.server}/invite/confirm`, {
        body: {
          uuid,
          privateKey
        }
      });
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
          return dispatch({
            type: 'VERIFY_NEW_USER_ERROR',
            payload: 'Unable to connect to server. Please try again later.'
          });
      }
    }

    let salt = result.salt;
    let organization = response.body.organization;
    let email = response.body.email;
    let encryptedPrivateKey = result.privateKey;
    writeStorage(encryptedPrivateKey, salt, organization, email);
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

const deleteUser = email => {
  return async dispatch => {
    dispatch({
      type: 'DELETE_USER_START'
    });
    try {
      await requestor.delete(`${config.server}/users/${email}`);
    } catch (error) {
      console.error(error);
      let message = 'Server error';
      switch (error.status) {
        case 500:
          message = 'Return internal server error';
          break;
      }
      return dispatch({
        type: 'DELETE_USER_ERROR',
        message
      });
    }

    dispatch({
      type: 'DELETE_USER_SUCCESS'
    });
  };
};

module.exports = {inviteUser, receivePrivateKey, verifyUser, deleteUser};
