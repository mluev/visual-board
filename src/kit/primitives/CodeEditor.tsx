import { useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { LanguageDescription } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { keymap, EditorView } from '@codemirror/view';
import { Prec, type Extension } from '@codemirror/state';

/** Dark editor theme matching the CodeExercise design (#1B1D22, JetBrains Mono, gold caret). */
const kitDark = createTheme({
  theme: 'dark',
  settings: {
    background: '#1B1D22',
    foreground: '#ECEDEE',
    caret: 'oklch(0.8 0.12 85)',
    selection: '#3A3D45',
    selectionMatch: '#2E3036',
    lineHighlight: 'transparent',
    gutterBackground: '#16181C',
    gutterForeground: '#5C606B',
    gutterBorder: 'transparent',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  },
  styles: [
    { tag: [t.comment, t.lineComment, t.blockComment], color: '#7D828D', fontStyle: 'italic' },
    { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], color: 'oklch(0.78 0.12 290)' },
    { tag: [t.string, t.special(t.string), t.regexp], color: 'oklch(0.8 0.12 150)' },
    { tag: [t.number, t.bool, t.null, t.atom], color: 'oklch(0.8 0.13 60)' },
    { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'oklch(0.82 0.1 230)' },
    { tag: [t.typeName, t.className, t.definition(t.typeName)], color: 'oklch(0.84 0.1 195)' },
    { tag: [t.propertyName], color: '#D6D8DC' },
    { tag: [t.operator, t.punctuation], color: '#A9ADB5' },
  ],
});

const base = EditorView.theme({
  '&': { fontSize: '14px', borderRadius: '14px', overflow: 'hidden' },
  '.cm-content': { padding: '14px 0', lineHeight: '1.6' },
  '.cm-gutters': { paddingLeft: '6px' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 10px 0 4px' },
  '&.cm-focused': { outline: 'none' },
});

/** Code editor with syntax highlighting for any common language (loaded on demand). */
export function CodeEditor({ value, onChange, language, onRun, minLines = 6, readOnly }: { value: string; onChange?: (v: string) => void; language?: string; onRun?: () => void; minLines?: number; readOnly?: boolean }) {
  const [lang, setLang] = useState<Extension | null>(null);
  useEffect(() => {
    let live = true;
    const desc = language ? LanguageDescription.matchLanguageName(languages, language, true) : null;
    desc
      ?.load()
      .then((l) => live && setLang(l))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [language]);

  const extensions = useMemo(() => {
    const ext: Extension[] = [base];
    if (lang) ext.push(lang);
    if (onRun) ext.push(Prec.highest(keymap.of([{ key: 'Mod-Enter', run: () => (onRun(), true) }])));
    return ext;
  }, [lang, onRun]);

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={kitDark}
      extensions={extensions}
      readOnly={readOnly}
      minHeight={`${minLines * 22.4 + 28}px`}
      basicSetup={{ foldGutter: false, highlightActiveLine: false, highlightActiveLineGutter: false, autocompletion: false, searchKeymap: false }}
    />
  );
}
