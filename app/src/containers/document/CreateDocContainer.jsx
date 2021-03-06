import {
  Document as documentActions,
  Tags as tagActions,
  Fields as fieldActions,
  Attachments as attachmentActions
} from 'actions/document';
import CreateDocView from 'components/document/CreateDocView';

const { connect } = require('react-redux');
const action = require('../../actions');

const mapStateToProps = state => {
  return {
    docFields: state.createDocument.get('docFields'),
    error: state.createDocument.get('error'),
    isLoading: state.createDocument.get('isLoading'),
    similarDocuments: state.updateDocument.get('similarDocuments'),
    elementToHide: state.createDocument.get('elementToHide'),
    checkFields: state.createDocument.get('checkFields'),
    nextViewAfterCheck: state.createDocument.get('nextViewAfterCheck')
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onConvert: (id, type, format) => {
      dispatch(fieldActions.convertFormat(id, type, format));
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
    onCreate: event => {
      event.preventDefault();
      dispatch(documentActions.createDocument());
    },
    onAddTag: tag => {
      dispatch(tagActions.addTag(tag));
    },
    onRemoveTag: tag => {
      dispatch(tagActions.removeTag(tag));
    },
    setTagIndex: index => {
      dispatch(tagActions.setTagIndex(index));
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
      dispatch(action.changeView('UPDATE_DOC_VIEW'));
      dispatch(documentActions.openDocument(id));
    }
  };
};

const CreateDocContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateDocView);

export default CreateDocContainer;
