import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * HindiInput — Hinglish → Devanagari transliteration with:
 *   • Auto-space insertion after each converted word
 *   • Top-3 suggestion dropdown for ambiguous words
 *   • When toolbar=true + multiline: uses contenteditable div → headings render visually
 *   • Otherwise: plain textarea / input
 */

/* ─── Fetch up to 3 suggestions from Google Input Tools ─── */
const fetchSuggestions = async (word) => {
  if (!word || !word.trim()) return [];
  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word.trim())}&itc=hi-t-i0-und&num=3&cp=0&cs=1&ie=utf-8&oe=utf-8&app=diacritical`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.[0] === 'SUCCESS' && Array.isArray(data?.[1]?.[0]?.[1])) {
      return data[1][0][1];
    }
  } catch { /* network failure */ }
  return [];
};

/* ─── Words that need a suggestion dropdown (common transliteration errors) ─── */
const SHOW_SUGGESTIONS_FOR = new Set([
  'mai', 'main', 'me', 'mein',
  'ha', 'hai', 'hain', 'hoon', 'hun',
  'vo', 'voh', 'wo', 'woh',
  'yeh', 'ye', 'is', 'iss',
  'un', 'unhe', 'unko', 'use', 'usse',
  'ko', 'ka', 'ki', 'ke', 'se', 'ne', 'par', 'pe',
  'to', 'toh', 'bhi', 'hi', 'na', 'nahi', 'nhi',
  'aur', 'ya', 'lekin', 'magar', 'kyunki', 'isliye',
]);

/* ─── Toolbar definition ─── */
const TOOLBAR_ITEMS = [
  { label: 'Normal',     tag: 'p',      title: 'Normal text',  block: true  },
  { label: 'Heading 2',  tag: 'h2',     title: 'Heading (H2)', block: true  },
  { label: 'Heading 3',  tag: 'h3',     title: 'Heading (H3)', block: true  },
  { label: 'Heading 4',  tag: 'h4',     title: 'Heading (H4)', block: true  },
  { label: 'Heading 5',  tag: 'h5',     title: 'Heading (H5)', block: true  },
  'divider',
  { label: '𝐁',          tag: 'strong', title: 'Bold',         block: false },
  { label: '𝘐',          tag: 'em',     title: 'Italic',       block: false },
  'divider-align',
  { label: '≡',          tag: 'left',   title: 'Align Left',    align: true },
  { label: '⊞',          tag: 'center', title: 'Align Center',  align: true },
  { label: '⊟',          tag: 'right',  title: 'Align Right',   align: true },
  { label: '☰',          tag: 'justify',title: 'Justify',       align: true },
];

/* ══════════════════════════════════════════════════════════════
   RICH CONTENTEDITABLE EDITOR (used when toolbar=true)
   ══════════════════════════════════════════════════════════════ */
const RichEditor = ({ value, onChange, placeholder, fontFamily, className }) => {
  const editorRef = useRef(null);
  const isComposing = useRef(false);
  const lastHtml = useRef(value || '');
  const [suggestions, setSuggestions] = useState(null);
  const lastInsertRef = useRef(null);

  /* Sync external value → DOM (only when it differs, avoiding cursor reset) */
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== (value || '')) {
      el.innerHTML = value || '';
      lastHtml.current = value || '';
    }
  }, [value]);

  /* ─── Read innerHTML and notify parent ─── */
  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    if (html !== lastHtml.current) {
      lastHtml.current = html;
      onChange(html);
    }
  }, [onChange]);

  /* ─── Get the current word at caret (for transliteration) ─── */
  const getWordAtCaret = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return null;

    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;

    const text = node.textContent;
    const offset = range.startOffset;
    // Find word start (go back until space/newline)
    let start = offset;
    while (start > 0 && !/[\s\n]/.test(text[start - 1])) start--;
    const word = text.slice(start, offset);
    if (!word.trim()) return null;
    return { node, text, wordStart: start, wordEnd: offset, word };
  };

  /* ─── Replace word in text node with Hindi ─── */
  const replaceWordInNode = (node, wordStart, wordEnd, replacement, sep) => {
    const text = node.textContent;
    const before = text.slice(0, wordStart);
    const after = text.slice(wordEnd);
    node.textContent = before + replacement + sep + after;

    // Move caret after replacement + sep
    const newOffset = wordStart + replacement.length + sep.length;
    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(node, newOffset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  /* ─── Transliterate on Space / Enter ─── */
  const handleKeyDown = async (e) => {
    // Close suggestions on any other key
    if (suggestions && e.key !== ' ' && e.key !== 'Enter' && e.key !== 'Process') {
      setSuggestions(null);
      lastInsertRef.current = null;
    }

    if (e.key !== ' ' && e.key !== 'Enter') return;
    if (isComposing.current) return;

    const wordInfo = getWordAtCaret();
    if (!wordInfo) return;

    const { node, wordStart, wordEnd, word } = wordInfo;
    const sep = e.key === 'Enter' ? '\n' : ' ';

    const isHindiWord = /[\u0900-\u097F]/.test(word);
    
    if (isHindiWord) {
      e.preventDefault();
      replaceWordInNode(node, wordStart, wordEnd, word, sep);
      emitChange();
      return;
    }

    e.preventDefault();

    const list = await fetchSuggestions(word);
    if (!list.length) {
      // No conversion — just insert word + sep as-is
      replaceWordInNode(node, wordStart, wordEnd, word, sep);
      emitChange();
      return;
    }

    const best = list[0];
    replaceWordInNode(node, wordStart, wordEnd, best, sep);
    emitChange();

    // Record for suggestion swapping
    lastInsertRef.current = { node, wordStart, wordLength: best.length, sep };

    // Show dropdown only for known ambiguous words
    if (list.length > 1 && SHOW_SUGGESTIONS_FOR.has(word.toLowerCase())) {
      setSuggestions({ list });
    }
  };

  /* ─── User picks a different suggestion ─── */
  const pickSuggestion = (chosen) => {
    const info = lastInsertRef.current;
    setSuggestions(null);
    lastInsertRef.current = null;
    if (!info) return;

    const { node, wordStart, wordLength, sep } = info;
    const text = node.textContent;
    const before = text.slice(0, wordStart);
    const after = text.slice(wordStart + wordLength + sep.length);
    node.textContent = before + chosen + sep + after;

    const newOffset = wordStart + chosen.length + sep.length;
    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(node, newOffset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    emitChange();
    editorRef.current?.focus();
  };

  /* ─── Apply block format (heading / paragraph) via execCommand ─── */
  const applyBlockFormat = (tag) => {
    editorRef.current?.focus();
    // formatBlock wraps current block in the given tag
    document.execCommand('formatBlock', false, tag === 'p' ? 'p' : tag);
    emitChange();
  };

  /* ─── Apply inline format (bold / italic) ─── */
  const applyInlineFormat = (tag) => {
    editorRef.current?.focus();
    if (tag === 'strong') document.execCommand('bold', false, null);
    else if (tag === 'em') document.execCommand('italic', false, null);
    emitChange();
  };

  /* ─── Apply alignment ─── */
  const applyAlignment = (align) => {
    editorRef.current?.focus();
    document.execCommand(`justify${align}`, false, null);
    emitChange();
  };

  /* ─── Toolbar button click ─── */
  const handleToolbarClick = (item) => {
    if (item.block) applyBlockFormat(item.tag);
    else if (item.align) applyAlignment(item.tag);
    else applyInlineFormat(item.tag);
  };

  /* Close suggestions on outside click */
  useEffect(() => {
    if (!suggestions) return;
    const close = (e) => {
      if (!e.target.closest('.hi-suggestions')) {
        setSuggestions(null);
        lastInsertRef.current = null;
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [suggestions]);

  return (
    <div className="hi-rich-wrapper">
      {/* ─── Toolbar ─── */}
      <div className="hi-toolbar">
        {TOOLBAR_ITEMS.map((item, i) =>
          item === 'divider' ? (
            <span key={i} className="wp-toolbar-divider" />
          ) : (
            <button
              key={item.tag}
              type="button"
              title={item.title}
              className={`hi-toolbar-btn ${item.block ? 'hi-toolbar-block-btn' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault(); // don't blur editor
                handleToolbarClick(item);
              }}
            >
              {item.label}
            </button>
          )
        )}
        <span className="hi-toolbar-hint">Space → हिंदी</span>
      </div>

      {/* ─── Contenteditable Editor ─── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={`hi-rich-editor ${className || ''}`}
        style={{ fontFamily: `'${fontFamily}', sans-serif` }}
        data-placeholder={placeholder}
        onInput={emitChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; }}
      />

      {/* ─── Suggestion Dropdown ─── */}
      {suggestions && suggestions.list.length > 1 && (
        <div className="hi-suggestions" style={{ top: '100%', left: 0, marginTop: 2 }}>
          <div className="hi-suggestions-label">Suggestions — click to use:</div>
          {suggestions.list.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`hi-suggestion-item ${i === 0 ? 'hi-suggestion-active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                pickSuggestion(s);
              }}
            >
              {i === 0 && <span className="hi-suggestion-check">✓</span>}
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   PLAIN TEXTAREA / INPUT (used for title, excerpt, etc.)
   ══════════════════════════════════════════════════════════════ */
const HindiInput = ({
  value = '',
  onChange,
  multiline = false,
  rows = 4,
  placeholder = 'Type in English (Hinglish) — press Space to convert to Hindi…',
  className = '',
  required = false,
  fontFamily = 'Hind',
  toolbar = false,
}) => {
  /* When toolbar + multiline → use rich contenteditable editor */
  if (toolbar && multiline) {
    return (
      <RichEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        fontFamily={fontFamily}
        className={className}
      />
    );
  }

  /* ── Plain textarea/input with transliteration ── */
  const inputRef = useRef(null);
  const [suggestions, setSuggestions] = useState(null);
  const lastInsertRef = useRef(null);
  const pendingCursorRef = useRef(null);

  /* Restore cursor after controlled re-render */
  useEffect(() => {
    if (pendingCursorRef.current !== null) {
      const el = inputRef.current;
      if (el) {
        const pos = pendingCursorRef.current;
        el.selectionStart = pos;
        el.selectionEnd = pos;
      }
      pendingCursorRef.current = null;
    }
  }, [value]);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!suggestions) return;
    const close = (e) => {
      if (!e.target.closest('.hi-suggestions')) {
        setSuggestions(null);
        lastInsertRef.current = null;
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [suggestions]);

  const moveCursor = (pos) => {
    pendingCursorRef.current = pos;
    const el = inputRef.current;
    if (el) { el.selectionStart = pos; el.selectionEnd = pos; el.focus(); }
  };

  const handleKeyDown = async (e) => {
    if (suggestions && e.key !== ' ' && e.key !== 'Enter') {
      setSuggestions(null);
      lastInsertRef.current = null;
    }
    if (e.key !== ' ' && e.key !== 'Enter') return;

    const el = e.currentTarget;
    const cursorPos = el.selectionStart;
    const text = value;
    const beforeCursor = text.slice(0, cursorPos);
    const lastBreak = Math.max(beforeCursor.lastIndexOf(' '), beforeCursor.lastIndexOf('\n'));
    const wordStart = lastBreak + 1;
    const rawWord = beforeCursor.slice(wordStart);
    if (!rawWord.trim()) return;

    const isHindiWord = /[\u0900-\u097F]/.test(rawWord);
    const sep = e.key === 'Enter' ? '\n' : ' ';

    if (isHindiWord) {
      e.preventDefault();
      const newText = text.slice(0, wordStart) + rawWord + sep + text.slice(cursorPos);
      onChange(newText);
      moveCursor(wordStart + rawWord.length + 1);
      return;
    }

    e.preventDefault();

    const list = await fetchSuggestions(rawWord);

    if (!list.length) {
      const newText = text.slice(0, wordStart) + rawWord + sep + text.slice(cursorPos);
      onChange(newText);
      moveCursor(wordStart + rawWord.length + 1);
      return;
    }

    const best = list[0];
    const newText = text.slice(0, wordStart) + best + sep + text.slice(cursorPos);
    onChange(newText);
    moveCursor(wordStart + best.length + 1);

    lastInsertRef.current = { wordStart, wordLength: best.length, sep };
    if (list.length > 1 && SHOW_SUGGESTIONS_FOR.has(rawWord.toLowerCase())) {
      setSuggestions({ list, top: '100%', left: 0, marginTop: 2 });
    }
  };

  const pickSuggestion = (chosen) => {
    const info = lastInsertRef.current;
    setSuggestions(null);
    lastInsertRef.current = null;
    if (!info) return;
    const { wordStart, wordLength, sep } = info;
    const newText = value.slice(0, wordStart) + chosen + sep + value.slice(wordStart + wordLength + sep.length);
    onChange(newText);
    moveCursor(wordStart + chosen.length + 1);
    inputRef.current?.focus();
  };

  const sharedProps = {
    ref: inputRef,
    value,
    onChange: (e) => { setSuggestions(null); lastInsertRef.current = null; onChange(e.target.value); },
    onKeyDown: handleKeyDown,
    placeholder,
    required,
    lang: 'hi',
    dir: 'auto',
    className: `hindi-input ${className}`,
    style: { fontFamily: `'${fontFamily}', sans-serif` },
  };

  return (
    <div className="hindi-input-wrapper" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <span className="hindi-badge" title="Hindi mode — type in English, press Space to convert">हि</span>
      {multiline ? <textarea {...sharedProps} rows={rows} /> : <input type="text" {...sharedProps} />}
      {suggestions && suggestions.list.length > 1 && (
        <div className="hi-suggestions" style={{ top: suggestions.top, left: suggestions.left, marginTop: suggestions.marginTop }}>
          <div className="hi-suggestions-label">Suggestions — click to use:</div>
          {suggestions.list.map((s, i) => (
            <button key={i} type="button"
              className={`hi-suggestion-item ${i === 0 ? 'hi-suggestion-active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); pickSuggestion(s); }}
            >
              {i === 0 && <span className="hi-suggestion-check">✓</span>}
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HindiInput;
