import PreviewDoc from 'components/document/PreviewDoc';
import {
  previewDocument,
  getFavoriteDocuments,
  addFavoriteDocument,
  deleteFavoriteDocument
} from 'actions/document/document';
const { connect } = require('react-redux');
const { tagSearch } = require('actions/search');
const {
  showSearchField,
  search,
  searchFieldChange
} = require('actions/document/search');
const action = require('actions');
const attachmentActions = require('actions/document/attachments');

const mapStateToProps = state => {
  return {
    docFields: state.previewDocument.get('docFields'),
    error: state.previewDocument.get('error'),
    isLoading: state.previewDocument.get('isLoading'),
    searchField: state.previewDocument.get('searchField'),
    favoritedDocuments: state.search.get('favoritedDocuments'),
    id: state.updateDocument.getIn(['documentToUpdate', '_id']),
    refresh: state.previewDocument.get('refreshFavorites')
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addFavoriteDocument: id => {
      dispatch(addFavoriteDocument(id));
    },
    removeFavoriteDocument: id => {
      dispatch(deleteFavoriteDocument(id));
    },
    getFavoriteDocuments: () => {
      dispatch(getFavoriteDocuments());
    },
    onEdit: () => {
      dispatch(action.changeView('UPDATE_DOC_VIEW'));
    },
    onTagSearch: tag => {
      dispatch(tagSearch(tag));
    },
    onPreviewAttachment: (attachment, attachmentIndex) => {
      dispatch(
        attachmentActions.previewAttachment(attachment, attachmentIndex)
      );
    },
    onDownloadAttachment: (attachment, attachmentIndex) => {
      dispatch(
        attachmentActions.downloadAttachment(attachment, attachmentIndex)
      );
    },
    onShowSearchField: () => {
      dispatch(showSearchField());
    },
    onSearch: () => {
      dispatch(search());
    },
    onSearchFieldChange: event => {
      dispatch(searchFieldChange(event.target.value));
    },
    onClickDocumentLink: id => {
      dispatch(previewDocument(id, true));
    }
  };
};

const PreviewDocContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PreviewDoc);

export default PreviewDocContainer;
