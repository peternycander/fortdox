
module.exports = client => {
  const search = async (query) => {
    console.log(query);
    let response;
    try {
      response = await client.search({
        'index': 'document',
        'body': {
          'query': {
            'bool': {
              'should': [{
                'query_string': {
                  'query': `*${query.searchString}*~`
                }
              }, {
                'regexp': {
                  '_all': '.*' + query.searchString + '.*'
                }
              }, {
                'fuzzy': {
                  '_all': query.searchString
                }
              }]
            }
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