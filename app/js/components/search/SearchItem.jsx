const React = require('react');
const {List} = require('immutable');

const SearchItem = ({
  title,
  text,
  tags = List(),
  onUpdate
}) => {
  let tagList = [];
  tags.forEach((item, i) => {
    tagList.push(<div className='tag' key={i}>{item}</div>);
  });

  return (
    <div className='search-item box' onClick={onUpdate}>
      <h2>{title}</h2>
      <p>{text}</p>
      {tagList}
    </div>
  );
};

module.exports = SearchItem;
