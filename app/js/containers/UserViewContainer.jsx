const {connect} = require('react-redux');
const UserView = require('components/UserView');
const action = require('actions');
const views = require('views.json');

const mapStateToProps = state => {
  return {
    username: state.login.get('username')
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toFormView : () => {
      dispatch(action.changeView(views.FORM_VIEW));
    },
    toSearchView: () => {
      dispatch(action.changeView(views.SEARCH_VIEW));
    }
  };
};

const UserViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserView);

module.exports = UserViewContainer;