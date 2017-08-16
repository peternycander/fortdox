const requestor = require('@edgeguideab/client-request');
const config = require('../../config.json');

const search = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'SEARCH_START'
    });

    let state = getState();
    let searchString = state.search.get('searchString');
    let organization = state.user.get('organization');
    let email = state.user.get('email');
    let index = 1;
    let response;
    try {
      response = await requestor.get(`${config.server}/document`, {
        query: {
          searchString,
          organization,
          email,
          index
        }
      });
    } catch (error) {
      console.error(error);
      switch (error.status) {
        case 400:
        case 401:
          return dispatch({
            type: 'SEARCH_ERROR',
            payload: 'Unauthorized'
          });
        case 404:
          return dispatch({
            type: 'SEARCH_ERROR',
            payload: 'Bad request. Please try again.'
          });
        case 408:
        case 500:
          return dispatch({
            type: 'SEARCH_ERROR',
            payload: 'Unable to connect to server. Please try again later.'
          });
      }
    }
    return dispatch({
      type: 'SEARCH_SUCCESS',
      payload: {
        index: index,
        searchResult: response.body.searchResult,
        totalHits: response.body.totalHits,
        searchString: searchString,
      }
    });
  };
};

const paginationSearch = index => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'PAGINATION_SEARCH_START'
    });

    let state = getState();
    let searchString = state.search.get('searchedString');
    let organization = state.user.get('organization');
    let email = state.user.get('email');
    document.getElementById('top').scrollIntoView();
    let response;
    try {
      response = await requestor.get(`${config.server}/document`, {
        query: {
          searchString,
          organization,
          email,
          index
        }
      });
    } catch (error) {
      console.error(error);
      switch (error.status) {
        case 400:
        case 404:
          return dispatch({
            type: 'SEARCH_ERROR',
            payload: 'Bad request. Please try again.'
          });
        case 408:
        case 500:
          return dispatch({
            type: 'SEARCH_ERROR',
            payload: 'Unable to connect to server. Please try again later.'
          });
      }
    }

    return dispatch({
      type: 'PAGINATION_SEARCH_SUCCESS',
      payload: {
        index: index,
        searchResult: response.body.searchResult,
        totalHits: response.body.totalHits,
        searchString: searchString
      }
    });
  };
};


const tagSearch = tag => {
  return async (dispatch, getState) => {
    dispatch({
      type: 'TAG_SEARCH_START'
    });
    let state = getState();
    let organization = state.user.get('organization');
    let email = state.user.get('email');
    let index = 1;
    let response;
    try {
      response = await requestor.get(`${config.server}/document`, {
        query: {
          searchString: tag,
          organization,
          email,
          index
        }
      });
    } catch (error) {
      console.error(error);
      switch (error.status) {
        case 400:
        case 404:
          return dispatch({
            type: 'TAG_SEARCH_ERROR',
            payload: 'Bad request. Please try again.'
          });
        case 408:
        case 500:
          return dispatch({
            type: 'TAG_SEARCH_ERROR',
            payload: 'Unable to connect to server. Please try again later.'
          });
      }
    }
    return dispatch({
      type: 'TAG_SEARCH_SUCCESS',
      payload: {
        index: index,
        searchResult: response.body.searchResult,
        totalHits: response.body.totalHits,
        searchString: tag,
      }
    });
  };
};
module.exports = {search, paginationSearch, tagSearch};
