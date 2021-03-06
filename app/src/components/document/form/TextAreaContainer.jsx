import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TextArea from './TextArea';

class TextAreaContainer extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const {
      docFields,
      onRemoveField,
      onChange,
      onUpdateId,
      onDrop,
      onHideElement,
      elementToHide,
      onConvert
    } = this.props;
    let encryptedTextFields = docFields
      .get('encryptedTexts')
      .map(field => field.set('encrypted', true));
    let textFields = docFields.get('texts');
    return encryptedTextFields
      .concat(textFields)
      .sort((textA, textB) => (textA.get('id') < textB.get('id') ? -1 : 1))
      .map((field, index) => (
        <TextArea
          field={field}
          key={index}
          onChange={onChange}
          onRemoveField={onRemoveField}
          onUpdateId={onUpdateId}
          onDrop={onDrop}
          onHideElement={onHideElement}
          elementToHide={elementToHide}
          onConvert={onConvert}
        />
      ));
  }
}

export default DragDropContext(HTML5Backend)(TextAreaContainer);
