import { useState, useEffect, useCallback } from 'react';

/* ── Icons (inline SVG, zero dependencies) ── */

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill={filled ? '#ef4444' : 'none'}
    stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const WhatsAppIcon = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

/* ── Helpers ── */

const getLikeKey = (slug) => `article_likes_${slug}`;

const buildWhatsAppUrl = (title, url) => {
  const text = `${title}\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

/* ── Main Component ── */

const SocialBar = ({ title = '', url = '', slug = '' }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [ripple, setRipple] = useState('');

  // Hydrate like state from localStorage on mount / slug change
  useEffect(() => {
    if (!slug) return;
    try {
      const stored = JSON.parse(localStorage.getItem(getLikeKey(slug)) || 'null');
      if (stored) {
        setLiked(stored.liked || false);
        setLikeCount(stored.count || 0);
      } else {
        setLiked(false);
        setLikeCount(0);
      }
    } catch {
      setLiked(false);
      setLikeCount(0);
    }
  }, [slug]);

  const handleLike = useCallback(() => {
    setLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => {
        const nextCount = next ? c + 1 : Math.max(0, c - 1);
        if (slug) {
          try {
            localStorage.setItem(getLikeKey(slug), JSON.stringify({ liked: next, count: nextCount }));
          } catch { /* storage full - ignore */ }
        }
        return nextCount;
      });
      return next;
    });
    setRipple('like');
    setTimeout(() => setRipple(''), 400);
  }, [slug]);

  const handleWhatsApp = useCallback(() => {
    const shareUrl = buildWhatsAppUrl(title, url || window.location.href);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }, [title, url]);

  const handleComment = useCallback(() => {
    setRipple('comment');
    setTimeout(() => setRipple(''), 400);

    // Scroll to bottom of article / comments section
    const target = document.getElementById('article-comments') || document.querySelector('.article-end');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Look for a text input or textarea to focus
      setTimeout(() => {
        const input = target.querySelector('input[type="text"], textarea');
        if (input) input.focus();
      }, 500); // give time for scroll animation
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="social-bar" role="toolbar" aria-label="Article actions">
      {/* Like */}
      <button
        className={`social-btn${liked ? ' liked' : ''}${ripple === 'like' ? ' ripple' : ''}`}
        onClick={handleLike}
        aria-label={liked ? 'Unlike this article' : 'Like this article'}
        aria-pressed={liked}
        type="button"
      >
        <HeartIcon filled={liked} />
        <span className="social-btn-label">
          {likeCount > 0 ? likeCount : 'Like'}
        </span>
      </button>

      {/* Comment */}
      <button
        className={`social-btn${ripple === 'comment' ? ' ripple' : ''}`}
        onClick={handleComment}
        aria-label="Jump to comments"
        type="button"
      >
        <CommentIcon />
        <span className="social-btn-label">Comment</span>
      </button>
    </div>
  );
};

export const TopShareBar = ({ title = '', url = '' }) => {
  const shareUrl = encodeURIComponent(url || window.location.href);
  const shareTitle = encodeURIComponent(title);

  const links = [
    {
      name: 'Facebook',
      color: 'bg-[#1877f2] hover:bg-[#0c63d4]',
      icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
    },
    {
      name: 'X (Twitter)',
      color: 'bg-black hover:bg-gray-800',
      icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>,
      href: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`
    },
    {
      name: 'LinkedIn',
      color: 'bg-[#0077b5] hover:bg-[#005e93]',
      icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
    },
    {
      name: 'Telegram',
      color: 'bg-[#229ED9] hover:bg-[#1b80b0]',
      icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.381 4.025-1.627 4.476-1.635z" /></svg>,
      href: `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`
    },
    {
      name: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#1da851]',
      icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>,
      href: `https://wa.me/?text=${shareTitle} ${shareUrl}`
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 mb-2">
      <span className="text-sm font-semibold text-gray-700 mr-2 hidden sm:inline-block">Share:</span>
      {links.map(link => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white transition-transform hover:scale-105 active:scale-95 shadow-sm ${link.color}`}
          aria-label={`Share on ${link.name}`}
          title={`Share on ${link.name}`}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
};

export default SocialBar;
