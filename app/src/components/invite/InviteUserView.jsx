const React = require('react');
const LoaderOverlay = require('components/general/LoaderOverlay');
const MessageBox = require('components/general/MessageBox');
const ErrorBox = require('components/general/ErrorBox');
const UserList = require('containers/invite/UserListContainer');

const InviteUserView = props => {
  let {
    fields,
    message,
    error,
    onChange,
    onInvite,
    isLoading,
    onDeleteUser,
    permissions
  } = props;

  let concatMessage = [];
  if (typeof message === 'object' && message !== null) {
    message.entrySeq().forEach(entry => {
      entry[0] === 'bold'
        ? concatMessage.push(<b key={entry[1]}>{entry[1]}</b>)
        : concatMessage.push(entry[1]);
    });
  }

  let errorMsg = fields.getIn(['email', 'error']) ? (
    <div className='arrow-box show'>
      <span className='material-icons'>error_outline</span>
      {fields.getIn(['email', 'error'])}
    </div>
  ) : null;

  let msg = message ? (
    <span>
      {message.get('text')}
      <b>{message.get('bold')}</b>
      {message.get('text2') ? message.get('text2') : null}
    </span>
  ) : null;

  return (
    <div className='inner-container'>
      <LoaderOverlay display={isLoading} />
      <MessageBox message={msg} />
      <ErrorBox errorMsg={error} />
      <div className='title'>
        <h1>Users</h1>
      </div>
      {permissions.get('INVITE_USER') && (
        <div className='no-margin-top preview'>
          <div className='title small'>
            <h3>Invite User</h3>
          </div>
          <div className='texts'>
            <p>Invite a new user to the organization.</p>
            <form onSubmit={onInvite} className='input-bar'>
              <input
                name='email'
                type='text'
                value={fields.getIn(['email', 'value'])}
                onChange={onChange}
                placeholder='Email'
                className='block'
                autoFocus
              />
              <button onClick={onInvite}>Send</button>
            </form>
            {errorMsg}
          </div>
        </div>
      )}
      <UserList
        onDeleteUser={onDeleteUser}
        onInvite={onInvite}
        permissions={permissions}
      />
    </div>
  );
};

module.exports = InviteUserView;
