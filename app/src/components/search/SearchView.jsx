import { HITS_PER_PAGE } from 'actions/search';
import PreviewDocContainer from 'containers/document/PreviewDocContainer';
import React, { Component } from 'react';
const SearchItem = require('./SearchItem');
const Searchbar = require('./Searchbar');
const LoaderOverlay = require('../../components/general/LoaderOverlay');
const ErrorBox = require('../../components/general/ErrorBox');
const MessageBox = require('components/general/MessageBox');

class SearchView extends Component {
  constructor(props) {
    super(props);
    this.toggleFavoritesPanel = this.toggleFavoritesPanel.bind(this);
    this.state = {
      showFavoritesPanel: false
    };
  }

  componentDidMount() {
    this.props.getFavoriteDocuments();
  }

  toggleFavoritesPanel() {
    this.setState({ showFavoritesPanel: !this.state.showFavoritesPanel });
  }

  render() {
    let {
      currentIndex,
      error,
      message,
      result,
      totalHits,
      savedSearchString,
      isLoading,
      documentToUpdate,
      showPreview,
      onSearch,
      onUpdate,
      toDocView,
      onPreview,
      onTagSearch
    } = this.props;

    let searchResult = [];
    result.forEach((doc, index) => {
      searchResult.push(
        <SearchItem
          doc={doc}
          onUpdate={onUpdate}
          onPreview={onPreview}
          onTagSearch={onTagSearch}
          key={index}
        />
      );
    });

    if (searchResult.length % 3 === 2)
      searchResult.push(
        <div className='search-item invisible' key='invisible' />
      );
    let pagination = renderPagination(currentIndex, onSearch, totalHits);
    let searchLength =
      totalHits || totalHits === 0 ? (
        <p>
          {totalHits} search result{totalHits === 1 ? '' : 's'} found.
        </p>
      ) : null;

    let boxes =
      error || message ? (
        <div className={`alert-boxes ${showPreview ? 'big' : 'small'}`}>
          <ErrorBox errorMsg={error} />
          <MessageBox message={message} />
        </div>
      ) : null;

    let docButton = (
      <div className='doc-button'>
        <button className='round large material-icons' onClick={toDocView}>
          add
        </button>
      </div>
    );

    function renderPagination(currentIndex, onSearch, totalHits) {
      let pagination = [];
      if (totalHits > HITS_PER_PAGE) {
        let start = currentIndex > 3 ? currentIndex - 3 : 1;
        let end =
          Math.ceil(totalHits / HITS_PER_PAGE) > start + 6
            ? start + 6
            : Math.ceil(totalHits / HITS_PER_PAGE);
        let paginationButtons = new Array(end - start + 1);
        paginationButtons.fill(null);
        paginationButtons.forEach((value, i) => {
          paginationButtons.push(
            <button
              onClick={() => onSearch({ index: start + i })}
              className={`pagination ${
                start + i === currentIndex ? 'focused' : ''
              }`}
              key={start + i}
            >
              {start + i}
            </button>
          );
        });
        if (currentIndex !== 1)
          paginationButtons.unshift(
            <button
              className='pagination material-icons'
              onClick={() => onSearch({ index: currentIndex - 1 })}
              key='left'
            >
              keyboard_arrow_left
            </button>
          );
        if (Math.ceil(totalHits / HITS_PER_PAGE) !== currentIndex)
          paginationButtons.push(
            <button
              className='pagination material-icons'
              onClick={() => onSearch({ index: currentIndex + 1 })}
              key='right'
            >
              keyboard_arrow_right
            </button>
          );
        pagination.push(
          <div key={pagination.length} className='pagination'>
            {paginationButtons}
          </div>
        );
      }

      return pagination;
    }

    return (
      <div>
        <LoaderOverlay display={isLoading} />
        {boxes}
        <div className={`search-container ${showPreview ? 'big' : 'small'}`}>
          <div className={`left ${showPreview ? 'small' : 'full'}`}>
            <span id='top' />
            <Searchbar
              onSearch={onSearch}
              savedSearchString={savedSearchString}
            />
            {searchLength}
            <div className={`search-result ${showPreview ? '' : 'grid'}`}>
              {searchResult}
            </div>
            {pagination}
            {!documentToUpdate && docButton}
          </div>
          <div className={`right ${showPreview ? 'show' : 'hide'}`}>
            <PreviewDocContainer />
          </div>
        </div>
      </div>
    );
  }
}

export default SearchView;
