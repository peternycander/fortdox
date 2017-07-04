const React = require('react');

const LoginView = ({input, onChange, onLogin, toUserView, toRegisterView}) => {
  let errorMsg = input.error ? <h2>{input.errorMsg}</h2> : null;

  return (
    <div className='login-panel'>
      <h1 className='text-center'>FortDoks</h1>
      {errorMsg}
      <label>Username:</label>
      <input
        name='userInputValue'
        type='text'
        value={input.userInputValue}
        onChange={onChange}
        className='input-block'
      />
      <label>Password:</label>
      <input
        name='passwordInputValue'
        type='password'
        value={input.passwordInputValue}
        onChange={onChange}
        className='input-block'
      />
      <a onClick={onLogin} className='btn btn-block'>
        Login
      </a>
      <a onClick={toRegisterView} className='btn btn-block'>
        Register a New Team
      </a>
      <a onClick={toUserView} className='btn btn-block'>
        Fusk knapp!
      </a>
    </div>
  );
};

module.exports = LoginView;
