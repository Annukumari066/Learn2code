import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';

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
  editorHeight,
  setEditorHeight,
  lineNumbers,
}: CodeEditorProps) {
  return (
    <View style={styles.editorContainer}>
      <TextInput
        multiline
        value={lineNumbers}
        style={[styles.lineNumbersText, { height: Math.max(400, editorHeight) }]}
        editable={false}
        scrollEnabled={false}
      />

      <TextInput
        multiline
        value={value}
        onChangeText={onChange}
        onContentSizeChange={(e) => {
          setEditorHeight(e.nativeEvent.contentSize.height);
        }}
        style={[styles.codeInput, { height: Math.max(400, editorHeight) }]}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        spellCheck={false}
        placeholder="Write your code here..."
        placeholderTextColor="#64748b"
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  editorContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  lineNumbersText: {
    width: 42,
    backgroundColor: '#11111b',
    borderRightWidth: 1,
    borderRightColor: '#313244',
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#585b70',
    textAlign: 'right',
    paddingRight: 10,
    paddingVertical: 12,
    lineHeight: 22,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        userSelect: 'none',
        outlineStyle: 'none',
        overflow: 'hidden',
      } as any,
    }),
  },
  codeInput: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#cdd6f4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 22,
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        boxShadow: 'none',
      } as any,
    }),
  },
});
