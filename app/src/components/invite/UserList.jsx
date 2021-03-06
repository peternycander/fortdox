const React = require('react');
const Modal = require('components/general/Modal');
const config = require('config');
const permissionList = config.permissions;

module.exports = class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.openDeleteDialog = this.openDeleteDialog.bind(this);
    this.closeDeleteDialog = this.closeDeleteDialog.bind(this);
    this.closeReinviteDialog = this.closeReinviteDialog.bind(this);
    this.state = {
      showDeleteDialog: false,
      showReinviteDialog: false
    };
  }

  componentDidMount() {
    const { onMount = () => {} } = this.props;
    onMount();
  }

  componentDidUpdate() {
    if (this.props.refresh) {
      this.props.onRefresh();
    }
  }

  openDeleteDialog(user) {
    this.setState({
      userToBeDeleted: user,
      showDeleteDialog: true
    });
  }

  closeDeleteDialog() {
    this.setState({
      showDeleteDialog: false,
      userToBeDeleted: null
    });
  }

  openReinviteDialog(user) {
    this.setState({
      userToBeReinvited: user,
      showReinviteDialog: true
    });
  }

  closeReinviteDialog() {
    this.setState({
      showReinviteDialog: false,
      userToBeReinvited: null
    });
  }

  onDelete() {
    this.props.onDeleteUser(this.state.userToBeDeleted);
    this.closeDeleteDialog();
  }

  onReinvite(e) {
    this.props.onInvite(e, this.state.userToBeReinvited);
    this.closeReinviteDialog();
  }

  render() {
    const { user, users, permissions } = this.props;
    const domUsers = users.map(member => {
      const memberIsAdmin = permissionList[member.permission & 1] === 'ADMIN';
      const memberIsOwner = member.owner;
      return (
        <div key={member.email} className='user'>
          <span className='email'>{member.email}</span>
          <span className='role'>
            {memberIsOwner ? 'Owner' : memberIsAdmin ? 'Admin' : ''}
          </span>
          <span className='pending'>{member.pending ? 'Pending' : ''}</span>
          <span className='reinvite'>
            {user !== member.email && (
              <span onClick={() => this.openReinviteDialog(member.email)}>
                <i className='material-icons'>mail</i>
                Reinvite
              </span>
            )}
          </span>
          <span className='delete'>
            {!memberIsOwner &&
              permissions.get('REMOVE_USER') &&
              user !== member.email && (
                <span onClick={() => this.openDeleteDialog(member.email)}>
                  <i className='material-icons'>delete</i>
                  Delete
                </span>
              )}
          </span>
        </div>
      );
    });

    const deleteDialog = (
      <Modal
        show={this.state.showDeleteDialog}
        onClose={this.closeDeleteDialog}
        showClose={false}
      >
        <div className='box dialog danger'>
          <i className='material-icons'>error_outline</i>
          <h2>Warning</h2>
          <p>
            Are you sure you want to remove {this.state.userToBeDeleted} form
            the organization?
          </p>
          <div className='buttons'>
            <button
              onClick={this.closeDeleteDialog}
              type='button'
              className='neutral'
            >
              Cancel
            </button>
            <button
              onClick={() => this.onDelete()}
              type='button'
              className='warning'
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    );

    const reinviteDialog = (
      <Modal
        show={this.state.showReinviteDialog}
        onClose={this.closeReinviteDialog}
        showClose={false}
      >
        <div className='box dialog danger'>
          <i className='material-icons'>error_outline</i>
          <h2>Warning</h2>
          <p>
            Are you sure you want to reinvite {this.state.userToBeReinvited} to
            the organization?
          </p>
          <p>All devices connected to the user will be deleted.</p>
          <div className='buttons'>
            <button
              onClick={e => this.closeReinviteDialog(e)}
              type='button'
              className='neutral'
            >
              Cancel
            </button>
            <button onClick={e => this.onReinvite(e)} type='button'>
              Reinvite
            </button>
          </div>
        </div>
      </Modal>
    );

    return (
      <div className='user-list preview no-margin-top'>
        {deleteDialog}
        {reinviteDialog}
        <div className='title small'>
          <h3>Users in organization</h3>
        </div>
        <div className='organization-users'>{domUsers}</div>
      </div>
    );
  }
};
