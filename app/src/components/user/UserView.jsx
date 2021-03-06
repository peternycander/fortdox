import SearchViewContainer from 'containers/search/SearchViewContainer';
import CreateDocContainer from 'containers/document/CreateDocContainer';
import UpdateDocContainer from 'containers/document/UpdateDocContainer';
import InviteUserContainer from 'containers/invite/InviteUserContainer';
import DevicesContainer from 'containers/devices/DevicesContainer';
import PermissionsContainer from 'containers/permissions/PermissionsContainer';
import BookmarkContainer from 'components/user/Bookmark';
const React = require('react');
const HeaderContainer = require('containers/user/HeaderContainer');
const DownloadManager = require('components/general/DownloadManager');
const SplashScreen = require('components/general/SplashScreen');

const UserView = ({
  currentView,
  splashScreen,
  downloads,
  show,
  onOpenAttachment,
  onClearDownload,
  onClearAllDownloads,
  onCloseDownloadPane,
  favoritedDocuments
}) => {
  let page;
  switch (currentView) {
    case 'USER_VIEW':
    case 'SEARCH_VIEW':
    case 'PREVIEW_DOC':
      page = <SearchViewContainer />;
      break;
    case 'CREATE_DOC_VIEW':
      page = <CreateDocContainer />;
      break;
    case 'UPDATE_DOC_VIEW':
      page = <UpdateDocContainer />;
      break;
    case 'INVITE_USER_VIEW':
      page = <InviteUserContainer />;
      break;
    case 'DEVICES_VIEW':
      page = <DevicesContainer />;
      break;
    case 'ACCESS_VIEW':
      page = <PermissionsContainer />;
      break;
    default:
      console.error(
        currentView,
        'is unexpected label, default to SearchViewContainer'
      );
      page = <SearchViewContainer />;
      break;
  }

  const showBookmarkBar = favoritedDocuments.size !== 0;

  return (
    <div className={`wrapper ${showBookmarkBar ? 'show-bookmark-bar' : ''}`}>
      <SplashScreen show={splashScreen} />
      <HeaderContainer />
      <BookmarkContainer />
      <div
        className={`container-fluid ${
          showBookmarkBar ? 'show-bookmark-bar' : ''
        }`}
      >
        {page}
      </div>
      <DownloadManager
        show={show}
        downloads={downloads}
        onOpenAttachment={onOpenAttachment}
        onClearDownload={onClearDownload}
        onClearAll={onClearAllDownloads}
        onClose={onCloseDownloadPane}
      />
    </div>
  );
};

export default UserView;
