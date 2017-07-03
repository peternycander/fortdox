const {connect} = require('react-redux');
const LoginView = require('components/login/LoginView');
const action = require('actions');
const login = require('actions/login');

const mapStateToProps = state => {
  return {
    input: {
      userInputValue: state.login.get('userInputValue'),
      passwordInputValue: state.login.get('passwordInputValue'),
      error: state.login.get('error'),
      errorMsg: state.login.get('errorMsg')
    }
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onChange: (event) => {
      dispatch(action.inputChange(event.target.name, event.target.value));
    },
    onLogin: (event) => {
      event.preventDefault();
      dispatch(login());
    }
  };
};

const LoginViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginView);

module.exports = LoginViewContainer;
