const {connect} = require('react-redux');
const PreviewDoc = require('components/document/PreviewDoc');
const {tagSearch} = require('actions/search');
const action = require('actions');

const mapStateToProps = state => {
  return {
    docFields: state.updateDocument.get('docFields'),
    error: state.updateDocument.get('error'),
    isLoading: state.updateDocument.get('isLoading')
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onEdit: () => {
      dispatch(action.changeView('UPDATE_DOC_VIEW'));
    },
    onTagSearch: tag => {
      dispatch(tagSearch(tag));
    }
  };
};

const PreviewDocContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PreviewDoc);

module.exports = PreviewDocContainer;
