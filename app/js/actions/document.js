const requestor = require('@edgeguideab/client-request');
const config = require('../../config.json');

function checkEmptyFields(fields) {
  let emptyFields = [];
  fields.entrySeq().forEach((entry) => {
    if (entry[1].get('value').trim() === '') emptyFields.push(entry[0]);
  });
  return emptyFields;
}

const createDocument = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'CREATE_DOCUMENT_START'
    });

    let state = getState();
    let docFields = state.createDocument.get('docFields');
    let privateKey = state.user.get('privateKey');
    let email = state.user.get('email');
    let emptyFields = checkEmptyFields(docFields);
    if (emptyFields.length > 0) {
      let newDocFields = {};
      emptyFields.forEach((key) => {
        newDocFields[key] = {
          error: `${key == 'title' ? 'Title' : 'Textfield'} can not be empty.`
        };
      });
      return dispatch({
        type: 'CREATE_DOCUMENT_ERROR',
        payload: newDocFields
      });
    }

    let body = {};
    docFields.entrySeq().forEach((entry) => body[entry[0]] = entry[1].get('value'));
    try {
      await requestor.post(`${config.server}/documents`, {
        body: {
          body,
          email
        },
        headers: {
          'Authorization': `FortDoks ${privateKey}`
        }
      });
    } catch (error) {
      console.error(error);
      return dispatch({
        type: 'CREATE_DOCUMENT_ERROR',
        payload: 'Cannot connect to the server. Try again later.'
      });
    }

    return dispatch({
      type: 'CREATE_DOCUMENT_SUCCESS',
      payload: 'Document created!'
    });
  };
};

const updateDocument = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'UPDATE_DOCUMENT_START'
    });

    let state = getState();
    let oldDoc = state.updateDocument.get('documentToUpdate');
    let newDoc = state.updateDocument.get('docFields');
    let privateKey = state.user.get('privateKey');
    let email = state.user.get('email');
    let emptyFields = checkEmptyFields(newDoc);
    if (emptyFields.length > 0) {
      let newDocFields = {};
      emptyFields.forEach((key) => {
        newDocFields[key] = {
          error: `${key == 'title' ? 'Title' : 'Textfield'} can not be empty.`
        };
      });
      return dispatch({
        type: 'UPDATE_DOCUMENT_ERROR',
        payload: newDocFields,
        errorMsg: 'There were some errors.'
      });
    }
    let updateQuery = {};
    newDoc.entrySeq().forEach((entry) => updateQuery[entry[0]] = entry[1].get('value'));
    try {
      await requestor.patch(`${config.server}/documents`, {
        body:{
          index: oldDoc.get('_index'),
          type: oldDoc.get('_type'),
          id: oldDoc.get('_id'),
          updateQuery,
          email
        },
        headers: {
          'Authorization': `FortDoks ${privateKey}`
        }
      });
    } catch (error) {
      console.error(error);
      return dispatch({
        type: 'UPDATE_DOCUMENT_ERROR'
      });
    }

    return dispatch({
      type: 'UPDATE_DOCUMENT_SUCCESS',
      payload: 'Document updated!'
    });
  };
};

const deleteDocument = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'DELETE_DOCUMENT_START'
    });

    let state = getState();
    let doc = state.search.get('documentToUpdate');
    try {
      await requestor.delete(`${config.server}/documents`, {
        query:{
          index: doc.get('_index'),
          type: doc.get('_type'),
          id: doc.get('_id')
        }
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'DELETE_DOCUMENT_ERROR'
      });
    }
    dispatch({
      type: 'DELETE_DOCUMENT_SUCCESS'
    });
  };
};

module.exports = {updateDocument, createDocument, deleteDocument};
