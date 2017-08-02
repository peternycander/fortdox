const React = require('react');
const {List} = require('immutable');

const SearchItem = ({doc, onUpdate}) => {
  let title = doc.getIn(['_source', 'title']);
  let tags = doc.getIn(['_source', 'tags']) !== undefined ? doc.getIn(['_source', 'tags']) : List();
  let id = doc.getIn(['_id']);
  let tagList = [];
  tags.forEach((item, i) => {
    tagList.push(<div className='tag' key={i}>{item}</div>);
  });

  let text = [];
  if (doc.getIn(['highlight', 'texts.text']) !== undefined) {
    let temp = doc.getIn(['highlight', 'texts.text']).first().split(/%%#%%|%%#%%/);
    if (temp.length > 10) temp.forEach(str => text.push(str));
    else temp.forEach((str, index) => index % 2 === 0 ? text.push(str) : text.push(<span className='highlight' key={index}>{str}</span>));
  } else {
    if (doc.getIn(['_source', 'texts']) !== undefined) {
      let texts = doc.getIn(['_source', 'texts']);
      let currentLength = 0;
      let maxLength = 250;
      for (let i = 0; i < texts.size; i++) {
        if (texts.get(i).get('text').length + currentLength > maxLength) {
          text.push(texts.get(i).get('text').splice(0, texts[i].length+currentLength-maxLength));
          break;
        } else {
          text.push(texts.get(i).get('text'));
          currentLength += texts.get(i).get('text').length;
        }
      }
    }
  }

  return (
    <div className='search-item box' onClick={() => onUpdate(id)}>
      <h2>{title}</h2>
      <p>{text}</p>
      {tagList}
    </div>
  );
};

module.exports = SearchItem;
