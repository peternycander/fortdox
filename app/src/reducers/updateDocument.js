const { fromJS, List } = require('immutable');

let initialState = fromJS({
  documentToUpdate: null,
  docFields: {
    title: {
      value: '',
      id: 'title',
      label: 'Title',
      error: null
    },
    encryptedTexts: [],
    texts: [],
    tags: {
      value: '',
      error: null,
      list: [],
      activeTag: -1,
      suggested: [],
      old: []
    },
    attachments: [],
    files: [],
    preview: {
      name: null,
      data: null,
      type: null
    },
    versions: null,
    nextID: 0
  },
  error: null,
  isLoading: false,
  similarDocuments: [],
  elementToHide: null,
  showVersionPanel: undefined,
  refreshFavorites: false,
  checkFields: false
});

const form = (state = initialState, action) => {
  switch (action.type) {
    case 'OPEN_DOCUMENT_START':
    case 'UPDATE_DOC_VIEW_GET_FAVORITE_DOCUMENTS_START':
      return state.set('isLoading', true).set('refreshFavorites', false);
    case 'UPDATE_DOC_VIEW_ADD_FAVORITE_START':
    case 'UPDATE_DOC_VIEW_DELETE_FAVORITE_START':
      return state.set('isLoading', true);
    case 'OPEN_DOCUMENT_DONE':
      return state.merge({
        documentToUpdate: fromJS(action.documentToUpdate),
        docFields: state.get('docFields').merge({
          title: fromJS(action.title),
          encryptedTexts: fromJS(action.encryptedTexts),
          texts: fromJS(action.texts),
          tags: state
            .getIn(['docFields', 'tags'])
            .set('list', fromJS(action.tags)),
          attachments: fromJS(action.attachments),
          files: action.files,
          versions: fromJS(action.versions),
          nextID: fromJS(action.nextID)
        }),
        oldDocFields: state.get('docFields').merge({
          title: fromJS(action.title),
          encryptedTexts: fromJS(action.encryptedTexts),
          texts: fromJS(action.texts),
          tags: state
            .getIn(['docFields', 'tags'])
            .set('list', fromJS(action.tags)),
          attachments: fromJS(action.attachments),
          versions: fromJS(action.versions),
          nextID: fromJS(action.nextID)
        }),
        isLoading: false,
        searchField: {
          show: false
        }
      });
    case 'INSERT_DOCUMENT_VERSION':
      return state.merge({
        docFields: state.get('docFields').merge({
          title: fromJS(action.payload.title),
          encryptedTexts: fromJS(action.payload.encryptedTexts),
          texts: fromJS(action.payload.texts),
          tags: state
            .getIn(['docFields', 'tags'])
            .set('list', fromJS(action.payload.tags)),
          attachments: fromJS(action.payload.attachments),
          nextID: fromJS(action.payload.nextID)
        })
      });
    case 'OPEN_DOCUMENT_ERROR':
    case 'UPDATE_DOC_VIEW_GET_FAVORITE_DOCUMENTS_ERROR':
    case 'UPDATE_DOC_VIEW_ADD_FAVORITE_ERROR':
    case 'UPDATE_DOC_VIEW_DELETE_FAVORITE_ERROR':
      return state.set('isLoading', false).set('error', fromJS(action.payload));
    case 'UPDATE_DOC_INPUT_CHANGE_TITLE':
      return state
        .setIn(['docFields', 'title', 'value'], fromJS(action.payload))
        .setIn(['docFields', 'title', 'error'], null)
        .set('checkFields', false);
    case 'UPDATE_DOC_CONVERTED_ENCRYPTED_TEXT':
    case 'UPDATE_DOC_INPUT_CHANGE_ENCRYPTED_TEXT':
      return state
        .setIn(['docFields', 'encryptedTexts'], fromJS(action.payload))
        .set('checkFields', false);
    case 'UPDATE_DOC_CONVERTED_TEXT':
    case 'UPDATE_DOC_INPUT_CHANGE_TEXT':
      return state
        .setIn(['docFields', 'texts'], fromJS(action.payload))
        .set('checkFields', false);
    case 'UPDATE_DOC_INPUT_CHANGE_TAGS':
      return state.setIn(
        ['docFields', 'tags'],
        state.getIn(['docFields', 'tags']).merge({
          value: fromJS(action.value),
          suggested: fromJS(action.suggestedTags),
          error: null
        })
      );
    case 'UPDATE_DOC_ADD_TAG':
      return state
        .setIn(
          ['docFields', 'tags'],
          state.getIn(['docFields', 'tags']).merge({
            value: '',
            list: fromJS(action.payload),
            suggested: [],
            error: null
          })
        )
        .set('checkFields', false);
    case 'UPDATE_DOC_ADD_TAG_FAIL':
      return state.setIn(
        ['docFields', 'tags'],
        state.getIn(['docFields', 'tags']).merge({
          value: '',
          error: fromJS(action.payload),
          suggested: []
        })
      );
    case 'UPDATE_DOC_REMOVE_TAG':
      return state
        .setIn(['docFields', 'tags', 'list'], fromJS(action.payload))
        .set('checkFields', false);
    case 'UPDATE_DOC_GET_OLD_TAGS_ERROR':
      return state.merge({
        error: fromJS(action.payload.error)
      });
    case 'UPDATE_DOC_GET_OLD_TAGS_SUCCESS':
      return state.setIn(['docFields', 'tags', 'old'], fromJS(action.payload));
    case 'UPDATE_DOCUMENT_START':
      return state.set('isLoading', true);
    case 'UPDATE_DOCUMENT_FAIL': {
      let encryptedTexts = state.getIn(['docFields', 'encryptedTexts']);
      encryptedTexts.forEach((entry, index) => {
        if (action.emptyFieldIDs.includes(entry.get('id'))) {
          encryptedTexts = encryptedTexts.update(index, field =>
            field.set('error', fromJS(action.emptyFieldError))
          );
        }
      });
      let texts = state.getIn(['docFields', 'texts']);
      texts.forEach((entry, index) => {
        if (action.emptyFieldIDs.includes(entry.get('id'))) {
          texts = texts.update(index, field =>
            field.set('error', fromJS(action.emptyFieldError))
          );
        }
      });
      return state.merge({
        docFields: state.get('docFields').merge({
          title: state
            .getIn(['docFields', 'title'])
            .set('error', fromJS(action.titleError)),
          encryptedTexts,
          texts
        }),
        isLoading: false
      });
    }
    case 'UPDATE_DOCUMENT_ERROR':
      return state.merge({
        error: fromJS(action.payload),
        isLoading: false
      });
    case 'UPDATE_DOC_NEW_ENCRYPTED_TEXT_FIELD':
      return state
        .setIn(['docFields', 'encryptedTexts'], fromJS(action.payload))
        .setIn(['docFields', 'nextID'], fromJS(action.nextID))
        .set('checkFields', false);
    case 'UPDATE_DOC_NEW_TEXT_FIELD':
      return state
        .setIn(['docFields', 'texts'], fromJS(action.payload))
        .setIn(['docFields', 'nextID'], fromJS(action.nextID))
        .set('checkFields', false);
    case 'UPDATE_DOC_REMOVE_FIELD':
      return state
        .setIn(['docFields', 'encryptedTexts'], fromJS(action.encryptedTexts))
        .setIn(['docFields', 'texts'], fromJS(action.texts))
        .set('checkFields', false);
    case 'UPDATE_DOC_ADD_ATTACHMENT_ERROR':
      return state.merge({
        error: action.payload.error
      });
    case 'UPDATE_DOC_ADD_ATTACHMENT':
      return state
        .updateIn(['docFields', 'attachments'], attachments =>
          attachments.push(
            fromJS({
              name: action.name,
              type: action.fileType,
              file: action.file,
              new: true
            })
          )
        )
        .updateIn(['docFields', 'files'], files =>
          files.push({ actualFile: action.actualFile })
        )
        .set('checkFields', false);
    case 'UPDATE_DOC_REMOVE_ATTACHMENT':
      return state
        .setIn(['docFields', 'attachments'], action.payload.attachments)
        .setIn(['docFields', 'files'], action.payload.files)
        .set('checkFields', false);
    case 'UPDATE_DOC_PREVIEW_ATTACHMENT_START':
      return state.set('isLoading', true);
    case 'UPDATE_DOC_PREVIEW_ATTACHMENT_FAIL':
      return state.merge({
        error: fromJS(action.payload),
        isLoading: false
      });
    case 'UPDATE_DOC_PREVIEW_ATTACHMENT_SUCCESS':
      return state
        .merge({
          isLoading: false,
          error: null
        })
        .setIn(['docFields', 'preview'], fromJS(action.payload));
    case 'UPDATE_DOCUMENT_SUCCESS':
      return state.set('isLoading', false).set('showVersionPanel', undefined);
    case 'DOCUMENT_TITLE_LOOKUP_DONE': {
      let current = state.getIn(['documentToUpdate', '_id']);
      let hits = action.payload.hits.filter(e => e._id !== current);
      return state
        .set('similarDocuments', fromJS(hits))
        .set('isLoading', false);
    }
    case 'DOCUMENT_TITLE_LOOKUP_CLEAR':
      return state.set('similarDocuments', List());
    case 'RESTORE_TO_OLD_DOCUMENT':
      return state.merge({
        docFields: state.get('docFields').merge({
          title: state.getIn(['oldDocFields', 'title']),
          encryptedTexts: state.getIn(['oldDocFields', 'encryptedTexts']),
          texts: state.getIn(['oldDocFields', 'texts']),
          tags: state
            .getIn(['docFields', 'tags'])
            .set('list', state.getIn(['oldDocFields', 'tags', 'list'])),
          attachments: state.getIn(['oldDocFields', 'attachments']),
          files: state.getIn(['oldDocFields', 'files']),
          versions: state.getIn(['oldDocFields', 'versions']),
          nextID: state.getIn(['oldDocFields', 'nextID'])
        })
      });
    case 'CHANGE_VIEW':
    case 'SEARCH_SUCCESS':
    case 'TAG_SEARCH_SUCCESS':
      switch (action.payload) {
        case 'PREVIEW_DOC':
        case 'UPDATE_DOC_VIEW':
        case 'SEARCH_VIEW':
          return state
            .set('error', null)
            .set('showVersionPanel', undefined)
            .set('fieldsChecked', false);
        default:
          return initialState;
      }
    case 'UPDATE_DOC_UPDATE_FIELD_POSITION_SUCCESS':
      return state
        .setIn(
          ['docFields', 'encryptedTexts'],
          action.payload.updatedEncryptedTexts
        )
        .setIn(['docFields', 'texts'], action.payload.updatedTexts);
    case 'UPDATE_DOC_FIELD_DROPPED':
      return state.set('elementToHide', null).set('checkFields', false);
    case 'UPDATE_DOC_HIDE_ELEMENT':
      return state.set('elementToHide', action.payload);
    case 'UPDATE_DOC_CHECK_FIELDS':
      return state
        .set('nextViewAfterCheck', action.payload)
        .set('checkFields', true);
    case 'UPDATE_DOC_FIELDS_CHECKED':
      return state.set('fieldsChecked', true);
    case 'UPDATE_DOC_UNCHECK_FIELD':
      return state.set('checkFields', false);
    case 'TOGGLE_VERSION_HISTORY':
      return state.set('showVersionPanel', action.payload);
    case 'LOGOUT':
    case 'SESSION_EXPIRED':
      return initialState;
    case 'ATTACHMENT_DOWNLOAD_STARTED':
      return state.set('showVersionPanel', false);
    case 'UPDATE_DOC_VIEW_ADD_FAVORITE_SUCCESS':
    case 'UPDATE_DOC_VIEW_DELETE_FAVORITE_SUCCESS':
      return state.set('refreshFavorites', true).set('isLoading', false);
    case 'GET_FAVORITE_DOCUMENTS_SUCCESS':
      return state.set('isLoading', false);
    default:
      return state;
  }
};

module.exports = form;
