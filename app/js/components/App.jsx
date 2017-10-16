const React = require('react');
const FrontPageViewContainer = require('containers/front_page/FrontPageViewContainer');
const UserViewContainer = require('containers/user/UserViewContainer');
const SplashScreen = require('components/general/SplashScreen');
const Toast = require('components/general/Toast');

const App = ({currentView, splashScreen}) => {
  let view = null;
  switch (currentView) {
    case 'VERIFY_USER_VIEW':
    case 'LOGIN_VIEW':
    case 'VERIFY_LOGIN_VIEW':
    case 'REGISTER_VIEW':
    case 'ACTIVATE_ORGANIZATION_VIEW':
      view = <FrontPageViewContainer />;
      break;
    case 'INVITE_USER_VIEW':
    case 'SEARCH_VIEW':
    case 'USER_VIEW':
    case 'CREATE_DOC_VIEW':
    case 'UPDATE_DOC_VIEW':
    case 'PREVIEW_DOC':
      view = <UserViewContainer />;
      break;
  }
  return (
    <div>
      <SplashScreen show={splashScreen} />
      {view}
      <Toast />
    </div>
  );
};

module.exports = App;
