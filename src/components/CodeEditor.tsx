// CodeMirror 6 editor (the "equivalent editor" to Monaco): small, offline-capable and touch-friendly.
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--bg-2)', color: 'var(--text)', fontSize: '13px', borderRadius: '12px' },
  '.cm-content': { fontFamily: 'var(--font-mono)', caretColor: 'var(--accent)' },
  '.cm-gutters': { backgroundColor: 'var(--bg-2)', color: 'var(--text-3)', border: 'none', borderRight: '1px solid var(--line)' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--accent) 6%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--accent)' },
  '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--accent)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'color-mix(in srgb, var(--accent) 25%, transparent) !important' },
  '&.cm-focused': { outline: '2px solid color-mix(in srgb, var(--accent) 40%, transparent)' },
});

export default function CodeEditor({ value, onChange, language, height = '340px' }: { value: string; onChange: (v: string) => void; language: 'c' | 'cpp' | 'python'; height?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <CodeMirror
        value={value}
        height={height}
        theme="none"
        extensions={[language === 'python' ? python() : cpp(), theme, EditorView.lineWrapping]}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, autocompletion: true, bracketMatching: true, closeBrackets: true, indentOnInput: true, tabSize: 4 }}
        aria-label="Code editor"
      />
    </div>
  );
}
