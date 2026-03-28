import { useState, useEffect } from 'react';

const getCommentsKey = (slug) => `article_comments_${slug}`;

const CommentsSection = ({ slug }) => {
  const [comments, setComments] = useState([]);
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');

  // Hydrate comments from localStorage
  useEffect(() => {
    if (!slug) return;
    try {
      const stored = JSON.parse(localStorage.getItem(getCommentsKey(slug)) || '[]');
      setComments(stored);
    } catch {
      setComments([]);
    }
  }, [slug]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      name: newName.trim(),
      text: newComment.trim(),
      date: new Date().toISOString()
    };

    const updatedComments = [newEntry, ...comments];
    setComments(updatedComments);
    setNewName('');
    setNewComment('');

    if (slug) {
      try {
        localStorage.setItem(getCommentsKey(slug), JSON.stringify(updatedComments));
      } catch { /* ignore */ }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div id="article-comments" className="mt-8 pt-8 border-t border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Comments ({comments.length})
      </h3>

      <div className="bg-gray-50 rounded-2xl p-5 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Leave a Reply</h4>
          <input
            type="text"
            placeholder="Your Name *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            required
          />
          <textarea
            placeholder="Write your comment here... *"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
            required
          />
          <button
            type="submit"
            className="self-end px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            Post Comment
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 font-bold uppercase text-sm">
              {comment.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-gray-900 text-sm">{comment.name}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
