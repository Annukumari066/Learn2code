import React from 'react';
import { View, StyleSheet } from 'react-native';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: string;
  isDark: boolean;
  editorHeight: number;
  setEditorHeight: (h: number) => void;
  lineNumbers: string;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  isDark,
}: CodeEditorProps) {
  // Translate language keys to Monaco-compatible strings
  const monacoLanguage = language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'java' ? 'java' : 'python';
  
  // Translate theme keys to Monaco-compatible strings
  const monacoTheme = isDark ? 'vs-dark' : 'light';

  return (
    <View style={styles.webEditorContainer}>
      <Editor
        height="100%"
        width="100%"
        language={monacoLanguage}
        theme={monacoTheme}
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          fontSize: 14,
          fontFamily: 'monospace',
          minimap: { enabled: false },
          automaticLayout: true,
          folding: true,
          lineNumbers: 'on',
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          tabSize: 4,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webEditorContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 100,
  }
});
