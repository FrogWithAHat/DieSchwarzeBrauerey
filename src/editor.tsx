import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { resolve } from 'path';

export default class Editor extends React.Component<any, any> {

  public editor;
  public state = {
    value: this.props.value,
    loading: true
  };

  public editorDidMount(editor, monaco) {
    this.editor = editor;
    this.editor.focus();
    this.setState({ loading: false });
  }

	public handleResize = () => this.editor.layout();
  
  public componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  public render() {
    return (
      <div className={ this.state.loading ? 'spinner' : '' }>
        <MonacoEditor
          width="calc(100vw - 210mm)"
          height="1050"
          theme="vs-dark"
          language="markdown"
          options={ { wordWrap: true } }
          onChange={ this.props.onChange }
          editorDidMount={ (e, m) => this.editorDidMount(e, m) }
          value={ this.props.value }
        />
      </div>
    );
  }
}