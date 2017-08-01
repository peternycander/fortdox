const {fromJS} = require('immutable');

let initialState = fromJS({
  documentToUpdate: null,
  docFields: {},
  tags: {
    value: '',
    error: null,
    list: [],
    activeTag: -1,
    suggested: [],
    old: []
  },
  error: null,
  isLoading: false
});

const form = (state = initialState, action) => {
  switch (action.type) {
    case 'INPUT_CHANGE_UPDATE_DOC':
      return state
        .setIn(['docFields', action.inputName, 'value'], fromJS(action.inputValue))
        .setIn(['docFields', action.inputName, 'error'], null);
    case 'GET_OLD_TAGS_START':
      return state.set('isLoading', true);
    case 'GET_OLD_TAGS_ERROR':
      return state.merge({
        error: fromJS(action.payload),
        isLoading: false
      });
    case 'GET_OLD_TAGS_SUCCESS':
      return state
        .setIn(['tags', 'old'], fromJS(action.payload))
        .set('isLoading', false);
    case 'INPUT_CHANGE_TAGS_UPDATE_DOC':
      return state.set('tags', state.get('tags').merge({
        value: fromJS(action.value),
        suggested: fromJS(action.suggestedTags),
        error: null
      }));
    case 'UPDATE_DOC_ADD_TAG_SUCCESS':
      return state.set('tags', state.get('tags').merge({
        value: '',
        list: fromJS(action.payload),
        suggested: [],
        error: null
      }));
    case 'UPDATE_DOC_ADD_TAG_FAIL':
      return state.set('tags', state.get('tags').merge({
        value: '',
        error: fromJS(action.payload),
        suggested: []
      }));
    case 'UPDATE_DOC_REMOVE_TAG_SUCCESS':
      return state.setIn(['tags', 'list'], fromJS(action.payload));
    case 'SET_UPDATE_DOCUMENT':
      return state
        .merge({
          documentToUpdate: fromJS(action.payload.documentToUpdate),
          docFields: fromJS(action.payload.docFields)
        })
        .setIn(['tags', 'list'], fromJS(action.payload.tags));
    case 'UPDATE_DOCUMENT_START':
      return state.set('isLoading', true);
    case 'UPDATE_DOCUMENT_ERROR':
      return state.merge({
        docFields: state.get('docFields').mergeDeepWith((oldError, newError) => newError ? newError : oldError, action.payload),
        isLoading: false,
      });
    case 'UPDATE_DOCUMENT_SUCCESS':
    case 'UPDATE_DOC_VIEW_TO_DEFAULT':
    case 'CHANGE_VIEW':
      return initialState;
    default:
      return state;
  }
};

module.exports = form;
