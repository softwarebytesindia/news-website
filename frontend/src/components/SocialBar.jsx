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
    // Scroll to bottom of article / comments section
    const target = document.getElementById('article-comments') || document.querySelector('.article-end');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: url || window.location.href });
      } catch { /* user cancelled */ }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url || window.location.href);
      } catch { /* ignore */ }
    }
    setRipple('share');
    setTimeout(() => setRipple(''), 400);
  }, [title, url]);

  return (
    <>
      {/* ── Inline action bar ── */}
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

        {/* WhatsApp share */}
        <button
          className={`social-btn whatsapp${ripple === 'whatsapp' ? ' ripple' : ''}`}
          onClick={handleWhatsApp}
          aria-label="Share on WhatsApp"
          type="button"
        >
          <WhatsAppIcon />
          <span className="social-btn-label">WhatsApp</span>
        </button>

        {/* Native share / copy link */}
        <button
          className={`social-btn${ripple === 'share' ? ' ripple' : ''}`}
          onClick={handleNativeShare}
          aria-label="Share or copy link"
          type="button"
        >
          <ShareIcon />
          <span className="social-btn-label">Share</span>
        </button>
      </div>

      {/* ── Floating WhatsApp button (mobile only) ── */}
      <button
        className="whatsapp-float"
        onClick={handleWhatsApp}
        aria-label="Share on WhatsApp"
        type="button"
        title="Share on WhatsApp"
      >
        <WhatsAppIcon size={26} />
      </button>
    </>
  );
};

export default SocialBar;
