import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * HindiInput — Hinglish → Devanagari transliteration with:
 *   1. Auto-space insertion after each converted word
 *   2. Top-3 suggestion dropdown so user can pick the correct Hindi word
 *
 * Usage: type phonetically in English, press Space → word converts + space added.
 *        A small suggestions popup appears; click any suggestion to swap the word.
 */

/* ─── Fetch up to 3 suggestions from Google Input Tools ─── */
const fetchSuggestions = async (word) => {
  if (!word || !word.trim()) return [];
  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word.trim())}&itc=hi-t-i0-und&num=3&cp=0&cs=1&ie=utf-8&oe=utf-8&app=diacritical`;
    const res = await fetch(url);
    const data = await res.json();
    // Response: ["SUCCESS", [["word", ["opt1","opt2","opt3"]]]]
    if (data?.[0] === 'SUCCESS' && Array.isArray(data?.[1]?.[0]?.[1])) {
      return data[1][0][1]; // array of suggestions
    }
  } catch {
    // Network failure — return empty
  }
  return [];
};

/* ─── Whitelist of Hinglish words that need a suggestion dropdown ─── */
/**
 * These are words where the Google transliteration often picks the wrong
 * Hindi word as the top result (e.g. "mai" → "मई" but user means "मैं" or "में").
 * Only words in this set will show the suggestion popup; everything else
 * converts silently using the top suggestion.
 */
const SHOW_SUGGESTIONS_FOR = new Set([
  // Pronouns / postpositions with common transliteration errors
  'mai', 'main', 'me', 'mein',
  'ha', 'hai', 'hain', 'hoon', 'hun',
  'vo', 'voh', 'wo', 'woh',
  'yeh', 'ye', 'is', 'iss',
  'un', 'unhe', 'unko', 'use', 'usse',
  // Prepositions / particles that map to multiple words
  'ko', 'ka', 'ki', 'ke', 'se', 'ne', 'par', 'pe',
  'to', 'toh', 'bhi', 'hi', 'na', 'nahi', 'nhi',
  // Conjunctions
  'aur', 'ya', 'lekin', 'magar', 'kyunki', 'isliye',
]);

/* ─── Main Component ─── */
const TOOLBAR_ITEMS = [
  { label: 'Normal', tag: 'p', title: 'Normal paragraph' },
  { label: 'H2', tag: 'h2', title: 'Heading 2' },
  { label: 'H3', tag: 'h3', title: 'Heading 3' },
  { label: 'H4', tag: 'h4', title: 'Heading 4' },
  { label: 'H5', tag: 'h5', title: 'Heading 5' },
  'divider',
  { label: '𝐁', tag: 'strong', title: 'Bold', inline: true },
  { label: '𝘐', tag: 'em', title: 'Italic', inline: true },
];

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
  const inputRef = useRef(null);
  // suggestions state: { list, wordStart, wordLength, anchorTop, anchorLeft }
  const [suggestions, setSuggestions] = useState(null);
  // Track the last inserted Hindi word location so we can swap it on suggestion pick
  const lastInsertRef = useRef(null);

  /* close suggestions on outside click */
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

  /* ─── Compute dropdown anchor relative to the input element ─── */
  const getAnchorStyle = useCallback(() => {
    const el = inputRef.current;
    if (!el) return { top: '100%', left: 0 };
    // Position below the element; for textarea try to get cursor position
    return { top: '100%', left: 0, marginTop: 2 };
  }, []);

  /* ─── Word conversion on Space / Enter ─── */
  const handleKeyDown = async (e) => {
    // Close suggestions on any key (except mouse-driven clicks handled separately)
    if (suggestions && e.key !== ' ' && e.key !== 'Enter') {
      setSuggestions(null);
      lastInsertRef.current = null;
    }

    if (e.key !== ' ' && e.key !== 'Enter') return;

    const el = e.currentTarget;
    const cursorPos = el.selectionStart;
    const text = value;

    // Everything before cursor
    const beforeCursor = text.slice(0, cursorPos);

    // Find start of the last word
    const lastBreak = Math.max(beforeCursor.lastIndexOf(' '), beforeCursor.lastIndexOf('\n'));
    const wordStart = lastBreak + 1;
    const rawWord = beforeCursor.slice(wordStart);

    if (!rawWord.trim()) return; // just whitespace, let default happen

    // Prevent the space/enter from being natively added — we'll add it ourselves
    e.preventDefault();

    // Fetch suggestions
    const suggestions_list = await fetchSuggestions(rawWord);
    if (!suggestions_list.length) {
      // No result — just insert the raw word + separator
      const sep = e.key === 'Enter' ? '\n' : ' ';
      const newText = text.slice(0, wordStart) + rawWord + sep + text.slice(cursorPos);
      onChange(newText);
      moveCursor(wordStart + rawWord.length + 1);
      return;
    }

    const best = suggestions_list[0];
    const sep = e.key === 'Enter' ? '\n' : ' ';

    // Insert first suggestion + separator
    const newText = text.slice(0, wordStart) + best + sep + text.slice(cursorPos);
    onChange(newText);

    const newCursor = wordStart + best.length + 1;
    moveCursor(newCursor);

    // Record what was inserted so we can swap on suggestion pick
    lastInsertRef.current = { wordStart, wordLength: best.length, sep };

    // Show suggestion dropdown only for known ambiguous words (whitelist)
    if (suggestions_list.length > 1 && SHOW_SUGGESTIONS_FOR.has(rawWord.toLowerCase())) {
      setSuggestions({ list: suggestions_list, ...getAnchorStyle() });
    }
  };

  const moveCursor = (pos) => {
    setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      el.selectionStart = pos;
      el.selectionEnd = pos;
      el.focus();
    }, 0);
  };

  /* ─── Wrap selection or insert HTML tag at cursor ─── */
  const wrapTag = (tag, inline = false) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end).trim();

    let inserted;
    if (selected) {
      inserted = `<${tag}>${selected}</${tag}>`;
    } else if (inline) {
      inserted = `<${tag}></${tag}>`;
    } else {
      // Block element — wrap on its own line
      const before = value.slice(0, start);
      const needNewline = before.length > 0 && !before.endsWith('\n');
      inserted = (needNewline ? '\n' : '') + `<${tag}></${tag}>\n`;
    }

    const newText = value.slice(0, start) + inserted + value.slice(end);
    onChange(newText);
    // Place cursor inside the closing tag
    const closingLen = `</${tag}>`.length + (inline || selected ? 0 : 1);
    moveCursor(start + inserted.length - closingLen);
  };

  /* ─── User picks a different suggestion ─── */
  const pickSuggestion = (chosen) => {
    const info = lastInsertRef.current;
    setSuggestions(null);
    lastInsertRef.current = null;

    if (!info) return;
    const { wordStart, wordLength, sep } = info;

    // Replace the previously inserted word with the chosen one
    const newText =
      value.slice(0, wordStart) +
      chosen +
      sep +
      value.slice(wordStart + wordLength + sep.length);

    onChange(newText);
    moveCursor(wordStart + chosen.length + 1);
    inputRef.current?.focus();
  };

  const sharedProps = {
    ref: inputRef,
    value,
    onChange: (e) => {
      // Any manual edit closes suggestions
      setSuggestions(null);
      lastInsertRef.current = null;
      onChange(e.target.value);
    },
    onKeyDown: handleKeyDown,
    placeholder,
    required,
    lang: 'hi',
    dir: 'auto',
    className: `hindi-input ${className}`,
    style: { fontFamily: `'${fontFamily}', sans-serif` },
  };

  return (
    <div className="hindi-input-wrapper" style={toolbar ? { flexDirection: 'column', alignItems: 'stretch' } : {}}>
      {/* ─── Formatting Toolbar ─── */}
      {toolbar && multiline && (
        <div className="hi-toolbar">
          {TOOLBAR_ITEMS.map((item, i) =>
            item === 'divider' ? (
              <span key={i} className="wp-toolbar-divider" />
            ) : (
              <button
                key={item.tag}
                type="button"
                title={item.title}
                className="hi-toolbar-btn"
                onMouseDown={(e) => {
                  e.preventDefault(); // don't blur textarea
                  wrapTag(item.tag, item.inline);
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}

      <span
        className="hindi-badge"
        title="Hindi mode — type in English, press Space to convert"
        style={toolbar && multiline ? { top: '42px' } : {}}
      >
        हि
      </span>

      {multiline ? (
        <textarea {...sharedProps} rows={rows} />
      ) : (
        <input type="text" {...sharedProps} />
      )}

      {/* ─── Suggestion Dropdown ─── */}
      {suggestions && suggestions.list.length > 1 && (
        <div
          className="hi-suggestions"
          style={{ top: suggestions.top, left: suggestions.left, marginTop: suggestions.marginTop }}
        >
          <div className="hi-suggestions-label">Suggestions — click to use:</div>
          {suggestions.list.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`hi-suggestion-item ${i === 0 ? 'hi-suggestion-active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur
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

export default HindiInput;
