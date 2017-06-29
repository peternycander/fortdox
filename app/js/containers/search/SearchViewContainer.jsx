const {connect} = require('react-redux');
const SearchView = require('components/search/SearchView');
const action = require('actions');
const search = require('actions/search');
const views = require('views.json');

const mapStateToProps = state => {
  return {
    searchString: state.search.get('searchString'),
    result: state.search.get('result')
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onChange: (e) => {
      dispatch(action.inputChange(e.target.name, e.target.value));
    },
    onSearch: () => {
      dispatch(search.search());
    },
    toUserView: () => {
      dispatch(action.currentViewToDefault());
      dispatch(action.changeView(views.USER_VIEW));
    },
    onUpdate: id => {
      dispatch(search.setUpdateDocument(id));
    }
  };
};

const SearchViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchView);

module.exports = SearchViewContainer;