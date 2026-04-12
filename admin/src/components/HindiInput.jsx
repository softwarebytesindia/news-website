import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL, UPLOAD_IMAGE_API_URL } from '../utils/api';

/**
 * HindiInput — Hinglish → Devanagari transliteration with:
 *   • Auto-space insertion after each converted word
 *   • Top-3 suggestion dropdown for ambiguous words
 *   • When toolbar=true + multiline: contenteditable div with IMAGE INSERTION
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

/* ─── Words that need a suggestion dropdown ─── */
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

/* ─── SVG Icons ─── */
const UndoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const RedoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ImgIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const AlignLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const AlignCenterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const AlignRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   RICH CONTENTEDITABLE EDITOR (used when toolbar=true)
   ══════════════════════════════════════════════════════════════ */
const RichEditor = ({ value, onChange, placeholder, fontFamily, className }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const isComposing = useRef(false);
  const lastHtml = useRef(value || '');
  const savedRangeRef = useRef(null);   // saved caret before toolbar click
  const [suggestions, setSuggestions] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const lastInsertRef = useRef(null);

  /* Sync external value → DOM */
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

  /* ─── Save caret position ─── */
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  /* ─── Restore caret position ─── */
  const restoreSelection = useCallback(() => {
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }, []);

  /* ─── Upload image file to backend ─── */
  const uploadImageFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return null;
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(UPLOAD_IMAGE_API_URL, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      return data.filePath; // e.g. /uploads/filename.avif
    } catch (err) {
      console.error('Image upload error:', err);
      return null;
    }
  }, []);

  /* ─── Insert <figure> at cursor ─── */
  const insertFigureAtCursor = useCallback((src, altText = '') => {
    const editor = editorRef.current;
    if (!editor) return;

    // Build a unique id for the figure so we can find it after insertion
    const figId = `fig-${Date.now()}`;

    // Resolve full URL for preview
    const fullSrc = src.startsWith('http') ? src : `${API_BASE_URL}${src}`;

    const figHtml =
      `<figure class="content-img-wrap" id="${figId}" data-align="center">` +
        `<img class="content-img" src="${fullSrc}" alt="${altText}" />` +
        `<figcaption class="content-img-caption" contenteditable="true" data-placeholder="Add a caption…"></figcaption>` +
      `</figure>` +
      `<p><br></p>`;

    editor.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();

      // Insert a paragraph break before if range is mid-paragraph
      const div = document.createElement('div');
      div.innerHTML = figHtml;
      const frag = document.createDocumentFragment();
      while (div.firstChild) frag.appendChild(div.firstChild);
      range.insertNode(frag);

      // Move cursor after figure
      const insertedFig = editor.querySelector(`#${figId}`);
      if (insertedFig) {
        insertedFig.removeAttribute('id');
        const afterFig = insertedFig.nextElementSibling;
        if (afterFig) {
          const newRange = document.createRange();
          newRange.setStart(afterFig, 0);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      }
    } else {
      // Fallback: append at end
      editor.innerHTML += figHtml;
    }

    emitChange();
  }, [restoreSelection, emitChange]);

  /* ─── Handle file: upload then insert ─── */
  const handleImageFile = useCallback(async (file) => {
    if (!file) return;
    setUploading(true);
    saveSelection();
    const filePath = await uploadImageFile(file);
    setUploading(false);
    if (filePath) {
      insertFigureAtCursor(filePath, file.name.replace(/\.[^.]+$/, ''));
    } else {
      alert('Image upload failed. Please try again.');
    }
  }, [uploadImageFile, insertFigureAtCursor, saveSelection]);

  /* ─── Toolbar: image button ─── */
  const handleInsertImageClick = useCallback(() => {
    saveSelection();
    fileInputRef.current?.click();
  }, [saveSelection]);

  /* ─── File input change ─── */
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  /* ─── Drag and Drop ─── */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!editorRef.current?.contains(e.relatedTarget)) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (file) {
      // Set caret at drop position
      let range;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        }
      }
      if (range) {
        savedRangeRef.current = range;
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      await handleImageFile(file);
    }
  }, [handleImageFile]);

  /* ─── Image alignment handler (activated on figure click) ─── */
  const handleEditorClick = useCallback((e) => {
    // Clear any previously selected figure
    editorRef.current?.querySelectorAll('.content-img-wrap.selected').forEach(f => f.classList.remove('selected'));

    const fig = e.target.closest('figure.content-img-wrap');
    if (fig) {
      fig.classList.add('selected');
      e.stopPropagation();
    }
  }, []);

  /* ─── Deselect figure on editor blur ─── */
  useEffect(() => {
    const deselect = () => {
      editorRef.current?.querySelectorAll('.content-img-wrap.selected').forEach(f => f.classList.remove('selected'));
    };
    document.addEventListener('click', deselect);
    return () => document.removeEventListener('click', deselect);
  }, []);

  /* ─── Figure alignment buttons (rendered as floating toolbar) ─── */
  const handleAlignFigure = useCallback((align, e) => {
    e.preventDefault();
    e.stopPropagation();
    const fig = editorRef.current?.querySelector('figure.content-img-wrap.selected');
    if (!fig) return;
    fig.dataset.align = align;
    emitChange();
  }, [emitChange]);

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
    let start = offset;
    while (start > 0 && !/[\s\n]/.test(text[start - 1])) start--;
    const word = text.slice(start, offset);
    if (!word.trim()) return null;
    return { node, text, wordStart: start, wordEnd: offset, word };
  };

  /* ─── Replace word in text node with Hindi ─── */
  const replaceWordInNode = (node, wordStart, wordEnd, replacement, sep) => {
    // Validate bounds in case DOM mutated slightly during async fetch
    if (!node.isConnected || node.nodeType !== Node.TEXT_NODE) return;
    const maxLen = node.textContent.length;
    const start = Math.min(wordStart, maxLen);
    const end = Math.min(wordEnd, maxLen);

    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    sel.removeAllRanges();
    sel.addRange(range);

    // Use native insertText to guarantee flawless cursor advancement
    // and undo-history. For trailing spaces, \u00A0 prevents cursor trapping.
    const safeSep = sep === ' ' ? '\u00A0' : sep;
    
    if (safeSep === '\n') {
      document.execCommand('insertText', false, replacement);
      document.execCommand('insertParagraph', false, null);
    } else {
      document.execCommand('insertText', false, replacement + safeSep);
    }
  };

  /* ─── Transliterate on Space / Enter ─── */
  const handleKeyDown = async (e) => {
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
      replaceWordInNode(node, wordStart, wordEnd, word, sep);
      emitChange();
      return;
    }

    const best = list[0];
    replaceWordInNode(node, wordStart, wordEnd, best, sep);
    emitChange();

    lastInsertRef.current = { node, wordStart, wordLength: best.length, sep };

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
    
    // Validate bounds
    if (!node.isConnected || node.nodeType !== Node.TEXT_NODE) return;
    const maxLen = node.textContent.length;
    
    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(node, Math.min(wordStart, maxLen));
    range.setEnd(node, Math.min(wordStart + wordLength + sep.length, maxLen));
    sel.removeAllRanges();
    sel.addRange(range);

    const safeSep = sep === ' ' ? '\u00A0' : sep;
    editorRef.current?.focus();
    
    if (safeSep === '\n') {
      document.execCommand('insertText', false, chosen);
      document.execCommand('insertParagraph', false, null);
    } else {
      document.execCommand('insertText', false, chosen + safeSep);
    }
  };


  /* ─── Apply block format ─── */
  const applyBlockFormat = (tag) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag === 'p' ? 'p' : tag);
    emitChange();
  };

  /* ─── Apply inline format ─── */
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
        {/* ─── Undo / Redo ─── */}
        <button
          type="button"
          title="Undo (Ctrl+Z)"
          className="hi-toolbar-btn hi-undo-redo-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            editorRef.current?.focus();
            document.execCommand('undo', false, null);
            emitChange();
          }}
        >
          <UndoIcon />
        </button>
        <button
          type="button"
          title="Redo (Ctrl+Y)"
          className="hi-toolbar-btn hi-undo-redo-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            editorRef.current?.focus();
            document.execCommand('redo', false, null);
            emitChange();
          }}
        >
          <RedoIcon />
        </button>

        <span className="wp-toolbar-divider" />

        {TOOLBAR_ITEMS.map((item, i) =>
          item === 'divider' || item === 'divider-align' ? (
            <span key={i} className="wp-toolbar-divider" />
          ) : (
            <button
              key={item.tag}
              type="button"
              title={item.title}
              className={`hi-toolbar-btn ${item.block ? 'hi-toolbar-block-btn' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleToolbarClick(item);
              }}
            >
              {item.label}
            </button>
          )
        )}

        {/* ─── Insert Image Button ─── */}
        <span className="wp-toolbar-divider" />
        <button
          type="button"
          title="Insert Image (click or drag image into editor)"
          className="hi-toolbar-btn hi-img-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            handleInsertImageClick();
          }}
        >
          <ImgIcon />
          <span>Image</span>
        </button>

        <span className="hi-toolbar-hint">Space → हिंदी</span>
      </div>

      {/* ─── Image Alignment Floating Toolbar ─── */}
      <div className="hi-img-align-bar" role="toolbar" aria-label="Image alignment">
        <button type="button" title="Align image left" className="hi-img-align-btn"
          onMouseDown={(e) => handleAlignFigure('left', e)}>
          <AlignLeftIcon />
        </button>
        <button type="button" title="Center image" className="hi-img-align-btn"
          onMouseDown={(e) => handleAlignFigure('center', e)}>
          <AlignCenterIcon />
        </button>
        <button type="button" title="Align image right" className="hi-img-align-btn"
          onMouseDown={(e) => handleAlignFigure('right', e)}>
          <AlignRightIcon />
        </button>
      </div>

      {/* ─── Contenteditable Editor ─── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={`hi-rich-editor ${isDragOver ? 'drag-over' : ''} ${className || ''}`}
        style={{ fontFamily: `'${fontFamily}', sans-serif` }}
        data-placeholder={placeholder}
        onInput={emitChange}
        onKeyDown={handleKeyDown}
        onClick={handleEditorClick}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
      />

      {/* ─── Hidden File Input ─── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={false}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* ─── Uploading Overlay ─── */}
      {uploading && (
        <div className="hi-uploading-overlay" aria-live="polite">
          <div className="hi-uploading-spinner" />
          <span>Uploading image…</span>
        </div>
      )}

      {/* ─── Drag-and-Drop Hint ─── */}
      {isDragOver && (
        <div className="hi-drag-hint" aria-hidden="true">
          <ImgIcon />
          <span>Drop image to insert</span>
        </div>
      )}

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
