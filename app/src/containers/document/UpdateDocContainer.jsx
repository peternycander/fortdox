import documentActions from 'actions/document/document';
import tagActions from 'actions/document/tags';
import fieldActions from 'actions/document/fields';
import attachmentActions from 'actions/document/attachments';
import UpdateDocView from 'components/document/UpdateDocView';

const { connect } = require('react-redux');

const mapStateToProps = state => {
  return {
    docFields: state.updateDocument.get('docFields'),
    oldDocFields: state.updateDocument.get('oldDocFields'),
    error: state.updateDocument.get('error'),
    isLoading: state.updateDocument.get('isLoading'),
    similarDocuments: state.updateDocument.get('similarDocuments'),
    elementToHide: state.updateDocument.get('elementToHide'),
    checkFields: state.updateDocument.get('checkFields'),
    nextViewAfterCheck: state.updateDocument.get('nextViewAfterCheck'),
    showVersionPanel: state.updateDocument.get('showVersionPanel'),
    permissions: state.user.get('permissions'),
    favoritedDocuments: state.search.get('favoritedDocuments'),
    id: state.updateDocument.getIn(['documentToUpdate', '_id']),
    refresh: state.updateDocument.get('refreshFavorites')
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getFavoriteDocuments: () => {
      dispatch(documentActions.getFavoriteDocuments());
    },
    onAddFavorite: id => {
      dispatch(documentActions.addFavoriteDocument(id));
    },
    onRemoveFavorite: id => {
      dispatch(documentActions.deleteFavoriteDocument(id));
    },
    onConvert: (id, type, format) => {
      dispatch(fieldActions.convertFormat(id, type, format));
    },
    onInsertDocumentVersion: version => {
      dispatch(documentActions.insertDocumentVersion(version));
    },
    onToggleVersionPanel: toggle => {
      dispatch(documentActions.toggleVersionPanel(toggle));
    },
    onUnCheckField: () => {
      dispatch(documentActions.unCheck());
    },
    hasChecked: nextView => {
      dispatch(documentActions.hasChecked(nextView));
    },
    onUpdateId: (fromId, toId) => {
      dispatch(fieldActions.updateFieldPositon(fromId, toId));
    },
    onDrop: () => {
      dispatch(fieldActions.onDrop());
    },
    onHideElement: id => {
      dispatch(fieldActions.onHideElement(id));
    },
    onChange: (id, text, type) => {
      dispatch(fieldActions.docInputChange(id, text, type));
    },
    onTitleChange: event => {
      dispatch(fieldActions.docTitleChange(event.target.value));
    },
    onSuggestTags: event => {
      dispatch(tagActions.suggestTags(event.target.value));
    },
    onUpdate: event => {
      event.preventDefault();
      dispatch(documentActions.updateDocument());
    },
    onDelete: () => {
      dispatch(documentActions.deleteDocument());
    },
    onAddTag: tag => {
      dispatch(tagActions.addTag(tag));
    },
    onRemoveTag: tagIndex => {
      dispatch(tagActions.removeTag(tagIndex));
    },
    onMount: () => {
      dispatch(tagActions.getOldTags());
    },
    onAddField: field => {
      dispatch(fieldActions.addField(field));
    },
    onRemoveField: id => {
      dispatch(fieldActions.removeField(id));
    },
    onAddAttachment: event => {
      dispatch(attachmentActions.addAttachment(event.target.files));
    },
    onRemoveAttachment: (index, name) => {
      dispatch(attachmentActions.removeAttachment(index, name));
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
    onCloseSimilarDocuments: () => {
      dispatch(fieldActions.clearSimilarDocuments());
    },
    onSimilarDocumentClick: id => {
      dispatch(documentActions.openDocument(id));
    }
  };
};

const UpdateDocContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UpdateDocView);

export default UpdateDocContainer;
