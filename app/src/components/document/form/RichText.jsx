import React, { Component } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import TurndownService from 'turndown';
import { tableRule, privateKeyRule, copyRule } from 'lib/turndownExtensions';
const turndownPluginGfm = require('turndown-plugin-gfm');
const turndownService = new TurndownService({
  emDelimiter: '*',
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});
const gfm = turndownPluginGfm.gfm;
const tables = turndownPluginGfm.tables;
turndownService.use(gfm);
turndownService.use([tables]);
turndownService.addRule('table', tableRule);
turndownService.addRule('privateKey', privateKeyRule);
turndownService.addRule('copy', copyRule);

const Remarkable = require('remarkable');
const {
  privateKeyParser,
  copyParser,
  privateKeyRenderer,
  copyRenderer
} = require('lib/remarkableExtensions');
const md = new Remarkable();
md.block.ruler.before('code', 'privatekey', privateKeyParser);
md.inline.ruler.push('copy', copyParser);
md.renderer.rules.privatekey = privateKeyRenderer;
md.renderer.rules.copy = copyRenderer;

const plugins = 'link lists table';

const toolbar =
  'styleselect | bold italic | markdownCode blockquote | bullist numlist | link table | privateKey copyPass';

const formats = {
  codeMark: { inline: 'code' },
  blockquote: { block: 'blockquote' },
  privateKey: {
    block: 'div',
    classes: 'rich-text-private-key'
  },
  copy: {
    block: 'div',
    classes: 'rich-text-copy'
  }
};

const style_formats = [
  { title: 'Heading 1', block: 'h1' },
  { title: 'Heading 2', block: 'h2' },
  { title: 'Heading 3', block: 'h3' },
  { title: 'Heading 4', block: 'h4' },
  { title: 'Heading 5', block: 'h5' }
];

const table_default_styles = { 'border-collapsed': 'none', width: '100%' };

const table_default_attributes = { border: 0 };

class RichText extends Component {
  constructor(props) {
    super(props);

    this.setup = this.setup.bind(this);
  }

  setup(editor) {
    this.setState({ activeEditor: editor });

    editor.addButton('markdownCode', {
      icon: 'code',
      onclick: function() {
        editor.execCommand('mceToggleFormat', false, 'codeMark');
      },
      onpostrender: function() {
        var btn = this;
        editor.on('init', function() {
          editor.formatter.formatChanged('codeMark', function(state) {
            btn.active(state);
          });
        });
      }
    });
    editor.addButton('privateKey', {
      icon: 'lock',
      onclick: function() {
        editor.execCommand('mceToggleFormat', false, 'privateKey');
      },
      onpostrender: function() {
        var btn = this;
        editor.on('init', function() {
          editor.formatter.formatChanged('privateKey', function(state) {
            btn.active(state);
          });
        });
      }
    });
    editor.addButton('copyPass', {
      icon: 'copy',
      onclick: function() {
        editor.execCommand('mceToggleFormat', false, 'copy');
      },
      onpostrender: function() {
        var btn = this;
        editor.on('init', function() {
          editor.formatter.formatChanged('copy', function(state) {
            btn.active(state);
          });
        });
      }
    });
  }

  handleEditorChange(id, type) {
    const text = turndownService.turndown(this.state.activeEditor.getContent());
    this.props.onRichTextChange(id, text, type);
  }

  render() {
    const { text, id, type } = this.props;
    return (
      <Editor
        initialValue={md.render(text)}
        init={{
          setup: this.setup,
          style_formats,
          formats,
          plugins,
          toolbar,
          table_default_styles,
          table_default_attributes,
          branding: false,
          menubar: false,
          target_list: false,
          link_title: false,
          entity_encoding: 'raw',
          content_css: '/css/index.css'
        }}
        onKeyUp={() => this.handleEditorChange(id, type)}
      />
    );
  }
}

export default RichText;
