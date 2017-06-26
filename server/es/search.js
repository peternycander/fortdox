
module.exports = client => {
  const search = async (query) => {
    let response;
    try {
      response = await client.search({
        index: query.index,
        body: {
          query: {
            match: query.searchQuery
          }
        }
      });
      return response;
    } catch (error) {
      console.error(error);

    }
  };

  const searchAll = (query) => {
    query.index = '_all';
    return search(query);
  };

  return {
    search,
    searchAll
  };
};
