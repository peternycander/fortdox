const {connect} = require('react-redux');
const RegisterView = require('components/front_page/register/RegisterView');
const action = require('actions');
const register = require('actions/register');
const views = require('views.json');

const mapStateToProps = state => {
  return {
    currentView: state.navigation.get('currentView'),
    register: {
      organizationInputValue: state.register.get('organizationInputValue'),
      usernameInputValue: state.register.get('usernameInputValue'),
      emailInputValue: state.register.get('emailInputValue'),
      passwordInputValue: state.register.get('passwordInputValue'),
      reTypedPasswordInputValue: state.register.get('reTypedPasswordInputValue'),
      errorMsg: state.register.get('errorMsg'),
      teamNameError: state.register.get('teamNameError'),
      verifyError: state.register.get('verifyError')
    }
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onChange: (e) => {
      dispatch(action.inputChange(e.target.name, e.target.value));
    },
    onVerify: () => {
      dispatch(register.registerTeamName());
    },
    onRegister: () => {
      dispatch(register.register());
    },
    toLoginView: () => {
      dispatch(action.changeView(views.LOGIN_VIEW));
    },
    toRegisterView: () => {
      dispatch(action.changeView(views.REGISTER_VIEW));
    }
  };
};

const RegisterViewContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RegisterView);

module.exports = RegisterViewContainer;