import { useCallback, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

/* ─── Toolbar Icons (WordPress-style SVG) ─── */
const Icon = ({ children, size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const ToolbarIcons = {
  bold: <Icon><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></Icon>,
  italic: <Icon><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></Icon>,
  underline: <Icon><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></Icon>,
  strike: <Icon><path d="M16 4H9a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h6"/><line x1="4" y1="12" x2="20" y2="12"/><path d="M8 20h7a3 3 0 0 0 3-3v0a3 3 0 0 0-3-3h-1"/></Icon>,
  orderedList: <Icon><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></Icon>,
  bulletList: <Icon><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></Icon>,
  blockquote: <Icon><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 5v3z"/></Icon>,
  code: <Icon><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></Icon>,
  link: <Icon><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Icon>,
  image: <Icon><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Icon>,
  video: <Icon><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></Icon>,
  alignLeft: <Icon><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></Icon>,
  alignCenter: <Icon><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></Icon>,
  alignRight: <Icon><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></Icon>,
  alignJustify: <Icon><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></Icon>,
  indentIncrease: <Icon><polyline points="3 8 7 12 3 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/></Icon>,
  indentDecrease: <Icon><polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/></Icon>,
  undo: <Icon><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></Icon>,
  redo: <Icon><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></Icon>,
  clean: <Icon><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4M4 7l8 4M4 7v10l8 4m0-10v10"/></Icon>,
  hr: <Icon><line x1="2" y1="12" x2="22" y2="12" strokeWidth="3"/></Icon>,
  subscript: <Icon><path d="m4 6 8 8"/><path d="m12 6-8 8"/><text x="19" y="20" fontSize="10" fill="currentColor" stroke="none" fontWeight="bold">2</text></Icon>,
  superscript: <Icon><path d="m4 12 8 8"/><path d="m12 12-8 8"/><text x="19" y="10" fontSize="10" fill="currentColor" stroke="none" fontWeight="bold">2</text></Icon>,
  fullscreen: <Icon><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></Icon>,
  exitFullscreen: <Icon><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></Icon>,
  textColor: <Icon size={18}><path d="M5 20h14"/><path d="M9 4h1l5 12"/><path d="M9.2 12.6h5.6"/><path d="M6 16l3-8"/></Icon>,
  bgColor: <Icon size={18}><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 21 3.3-3.3"/><path d="M2 21h20"/></Icon>,
  kitchenSink: <Icon><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Icon>,
  sourceCode: <Icon><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></Icon>,
};

/* ─── Custom Toolbar Button ─── */
const ToolbarButton = ({ icon, title, isActive, onClick, disabled, className = '' }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`wp-toolbar-btn ${isActive ? 'active' : ''} ${className}`}
  >
    {icon}
  </button>
);

/* ─── Toolbar Select ─── */
const ToolbarSelect = ({ value, onChange, options, title, className = '' }) => (
  <select
    title={title}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`wp-toolbar-select ${className}`}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

/* ─── Color Picker Button ─── */
const ColorPickerButton = ({ icon, title, color, onChange }) => {
  const inputRef = useRef(null);

  return (
    <div className="wp-color-picker-wrap">
      <button
        type="button"
        title={title}
        onClick={() => inputRef.current?.click()}
        className="wp-toolbar-btn wp-color-btn"
      >
        {icon}
        <span className="wp-color-indicator" style={{ backgroundColor: color || '#000000' }} />
      </button>
      <input
        ref={inputRef}
        type="color"
        value={color || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="wp-color-input"
      />
    </div>
  );
};

/* ─── Divider ─── */
const Divider = () => <span className="wp-toolbar-divider" />;

/* ─── Head Formats ─── */
const HEADING_OPTIONS = [
  { value: '', label: 'Paragraph' },
  { value: '1', label: 'Heading 1' },
  { value: '2', label: 'Heading 2' },
  { value: '3', label: 'Heading 3' },
  { value: '4', label: 'Heading 4' },
  { value: '5', label: 'Heading 5' },
  { value: '6', label: 'Heading 6' },
];

const FONT_OPTIONS = [
  { value: '', label: 'Default Font' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'arial', label: 'Arial' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'tahoma', label: 'Tahoma' },
  { value: 'verdana', label: 'Verdana' },
  { value: 'courier-new', label: 'Courier New' },
  { value: 'times-new-roman', label: 'Times New Roman' },
];

const SIZE_OPTIONS = [
  { value: '', label: 'Default Size' },
  { value: 'small', label: 'Small' },
  { value: 'large', label: 'Large' },
  { value: 'huge', label: 'Huge' },
];

/* ─── Quill Font Registration ─── */
const Quill = ReactQuill.Quill;
const Font = Quill.import('formats/font');
Font.whitelist = ['serif', 'monospace', 'arial', 'georgia', 'tahoma', 'verdana', 'courier-new', 'times-new-roman'];
Quill.register(Font, true);

/* ─── Main Component ─── */
const RichTextEditor = ({ value, onChange, placeholder = 'Write your content here...' }) => {
  const quillRef = useRef(null);
  const [showKitchenSink, setShowKitchenSink] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');
  const [activeFormats, setActiveFormats] = useState({});
  const editorWrapRef = useRef(null);

  const getEditor = useCallback(() => {
    return quillRef.current?.getEditor?.();
  }, []);

  /* ─── Format Detection on Selection Change ─── */
  const handleSelectionChange = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection();
    if (range) {
      const formats = editor.getFormat(range);
      setActiveFormats(formats);
    }
  }, [getEditor]);

  /* ─── Format Helpers ─── */
  const toggleFormat = useCallback((format, value = true) => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const current = editor.getFormat(range);
    editor.format(format, current[format] ? false : value);
    setTimeout(handleSelectionChange, 0);
  }, [getEditor, handleSelectionChange]);

  const setFormat = useCallback((format, val) => {
    const editor = getEditor();
    if (!editor) return;
    editor.focus();
    editor.format(format, val || false);
    setTimeout(handleSelectionChange, 0);
  }, [getEditor, handleSelectionChange]);

  const insertEmbed = useCallback((type, val) => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    editor.insertEmbed(range.index, type, val);
    editor.setSelection(range.index + 1);
  }, [getEditor]);

  /* ─── Actions ─── */
  const handleLink = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const currentFormat = editor.getFormat(range);
    if (currentFormat.link) {
      editor.format('link', false);
    } else {
      const url = prompt('Enter URL:');
      if (url) editor.format('link', url);
    }
    setTimeout(handleSelectionChange, 0);
  }, [getEditor, handleSelectionChange]);

  const handleImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) insertEmbed('image', url);
  }, [insertEmbed]);

  const handleVideo = useCallback(() => {
    const url = prompt('Enter video URL (YouTube, Vimeo, etc.):');
    if (url) insertEmbed('video', url);
  }, [insertEmbed]);

  const handleHr = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    editor.insertText(range.index, '\n');
    editor.insertEmbed(range.index + 1, 'divider', true);
    editor.setSelection(range.index + 2);
  }, [getEditor]);

  const handleUndo = useCallback(() => {
    getEditor()?.history?.undo();
  }, [getEditor]);

  const handleRedo = useCallback(() => {
    getEditor()?.history?.redo();
  }, [getEditor]);

  const handleClean = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    if (range.length > 0) {
      editor.removeFormat(range.index, range.length);
    }
    setTimeout(handleSelectionChange, 0);
  }, [getEditor, handleSelectionChange]);

  const handleTextColor = useCallback((color) => {
    setFormat('color', color);
  }, [setFormat]);

  const handleBgColor = useCallback((color) => {
    setFormat('background', color);
  }, [setFormat]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const toggleSource = useCallback(() => {
    if (!showSource) {
      setSourceHtml(value || '');
    } else {
      onChange(sourceHtml);
    }
    setShowSource((prev) => !prev);
  }, [showSource, value, sourceHtml, onChange]);

  /* ─── Word Count ─── */
  const wordCount = useMemo(() => {
    if (!value) return { words: 0, chars: 0 };
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { words, chars: text.length };
  }, [value]);

  /* ─── Quill Modules ─── */
  const modules = useMemo(() => ({
    toolbar: false,
    history: { delay: 1000, maxStack: 100, userOnly: true },
    clipboard: { matchVisual: false },
  }), []);

  const formats = useMemo(() => [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'indent', 'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'divider',
  ], []);

  const handleChange = useCallback((content) => {
    onChange(content);
    setTimeout(handleSelectionChange, 0);
  }, [onChange, handleSelectionChange]);

  return (
    <div
      ref={editorWrapRef}
      className={`wp-editor-wrapper ${isFullscreen ? 'wp-fullscreen' : ''}`}
    >
      {/* ─── Toolbar Row 1 ─── */}
      <div className="wp-toolbar">
        <div className="wp-toolbar-row">
          <ToolbarSelect
            title="Format"
            value={activeFormats.header || ''}
            onChange={(val) => setFormat('header', val ? parseInt(val) : false)}
            options={HEADING_OPTIONS}
          />

          <Divider />

          <ToolbarButton icon={ToolbarIcons.bold} title="Bold (Ctrl+B)" isActive={activeFormats.bold} onClick={() => toggleFormat('bold')} />
          <ToolbarButton icon={ToolbarIcons.italic} title="Italic (Ctrl+I)" isActive={activeFormats.italic} onClick={() => toggleFormat('italic')} />
          <ToolbarButton icon={ToolbarIcons.underline} title="Underline (Ctrl+U)" isActive={activeFormats.underline} onClick={() => toggleFormat('underline')} />
          <ToolbarButton icon={ToolbarIcons.strike} title="Strikethrough" isActive={activeFormats.strike} onClick={() => toggleFormat('strike')} />

          <Divider />

          <ToolbarButton icon={ToolbarIcons.bulletList} title="Bullet List" isActive={activeFormats.list === 'bullet'} onClick={() => toggleFormat('list', 'bullet')} />
          <ToolbarButton icon={ToolbarIcons.orderedList} title="Numbered List" isActive={activeFormats.list === 'ordered'} onClick={() => toggleFormat('list', 'ordered')} />
          <ToolbarButton icon={ToolbarIcons.blockquote} title="Blockquote" isActive={activeFormats.blockquote} onClick={() => toggleFormat('blockquote')} />

          <Divider />

          <ToolbarButton icon={ToolbarIcons.alignLeft} title="Align Left" isActive={!activeFormats.align || activeFormats.align === ''} onClick={() => setFormat('align', false)} />
          <ToolbarButton icon={ToolbarIcons.alignCenter} title="Align Center" isActive={activeFormats.align === 'center'} onClick={() => setFormat('align', 'center')} />
          <ToolbarButton icon={ToolbarIcons.alignRight} title="Align Right" isActive={activeFormats.align === 'right'} onClick={() => setFormat('align', 'right')} />
          <ToolbarButton icon={ToolbarIcons.alignJustify} title="Justify" isActive={activeFormats.align === 'justify'} onClick={() => setFormat('align', 'justify')} />

          <Divider />

          <ToolbarButton icon={ToolbarIcons.link} title="Insert/Remove Link" isActive={!!activeFormats.link} onClick={handleLink} />
          <ToolbarButton icon={ToolbarIcons.image} title="Insert Image" onClick={handleImage} />

          <Divider />

          <ToolbarButton
            icon={ToolbarIcons.kitchenSink}
            title="Toggle Toolbar"
            isActive={showKitchenSink}
            onClick={() => setShowKitchenSink(!showKitchenSink)}
          />

          <ToolbarButton
            icon={isFullscreen ? ToolbarIcons.exitFullscreen : ToolbarIcons.fullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            isActive={isFullscreen}
            onClick={toggleFullscreen}
          />
        </div>

        {/* ─── Toolbar Row 2 (Kitchen Sink - WordPress style) ─── */}
        {showKitchenSink && (
          <div className="wp-toolbar-row wp-toolbar-row-2">
            <ToolbarSelect
              title="Font Family"
              value={activeFormats.font || ''}
              onChange={(val) => setFormat('font', val || false)}
              options={FONT_OPTIONS}
            />

            <ToolbarSelect
              title="Font Size"
              value={activeFormats.size || ''}
              onChange={(val) => setFormat('size', val || false)}
              options={SIZE_OPTIONS}
            />

            <Divider />

            <ColorPickerButton
              icon={ToolbarIcons.textColor}
              title="Text Color"
              color={activeFormats.color || '#000000'}
              onChange={handleTextColor}
            />
            <ColorPickerButton
              icon={ToolbarIcons.bgColor}
              title="Background Color"
              color={activeFormats.background || '#ffffff'}
              onChange={handleBgColor}
            />

            <Divider />

            <ToolbarButton icon={ToolbarIcons.indentDecrease} title="Decrease Indent" onClick={() => setFormat('indent', '-1')} />
            <ToolbarButton icon={ToolbarIcons.indentIncrease} title="Increase Indent" onClick={() => setFormat('indent', '+1')} />

            <Divider />

            <ToolbarButton icon={ToolbarIcons.subscript} title="Subscript" isActive={activeFormats.script === 'sub'} onClick={() => setFormat('script', activeFormats.script === 'sub' ? false : 'sub')} />
            <ToolbarButton icon={ToolbarIcons.superscript} title="Superscript" isActive={activeFormats.script === 'super'} onClick={() => setFormat('script', activeFormats.script === 'super' ? false : 'super')} />

            <Divider />

            <ToolbarButton icon={ToolbarIcons.code} title="Code Block" isActive={activeFormats['code-block']} onClick={() => toggleFormat('code-block')} />
            <ToolbarButton icon={ToolbarIcons.video} title="Insert Video" onClick={handleVideo} />
            <ToolbarButton icon={ToolbarIcons.hr} title="Horizontal Line" onClick={handleHr} />

            <Divider />

            <ToolbarButton icon={ToolbarIcons.undo} title="Undo (Ctrl+Z)" onClick={handleUndo} />
            <ToolbarButton icon={ToolbarIcons.redo} title="Redo (Ctrl+Y)" onClick={handleRedo} />
            <ToolbarButton icon={ToolbarIcons.clean} title="Clear Formatting" onClick={handleClean} />

            <Divider />

            <ToolbarButton
              icon={ToolbarIcons.sourceCode}
              title="Source Code"
              isActive={showSource}
              onClick={toggleSource}
              className="wp-source-btn"
            />
          </div>
        )}
      </div>

      {/* ─── Editor / Source Area ─── */}
      {showSource ? (
        <textarea
          className="wp-source-editor"
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
          placeholder="Edit HTML source..."
        />
      ) : (
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleChange}
          onChangeSelection={handleSelectionChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      )}

      {/* ─── Status Bar ─── */}
      <div className="wp-status-bar">
        <span className="wp-word-count">
          Words: <strong>{wordCount.words}</strong> &nbsp;|&nbsp; Characters: <strong>{wordCount.chars}</strong>
        </span>
        <span className="wp-status-path">
          {activeFormats.header ? `h${activeFormats.header}` : 'p'}
          {activeFormats.bold && ' › bold'}
          {activeFormats.italic && ' › italic'}
          {activeFormats.underline && ' › underline'}
          {activeFormats.link && ' › link'}
          {activeFormats.blockquote && ' › blockquote'}
          {activeFormats['code-block'] && ' › code'}
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;
