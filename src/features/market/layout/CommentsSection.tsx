import { useState } from 'react';
import { MessageSquare, ThumbsUp, Reply, Send, User } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useAuthStore } from '@/features/auth/auth.store';
import type { Comment } from '../market.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Mock comments data
const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    userId: 'user-1',
    username: 'CryptoTrader',
    content: 'I think this has a high probability of happening based on recent market trends. The institutional adoption has been incredible.',
    timestamp: '2025-12-30T14:30:00Z',
    likes: 24,
    replies: [
      {
        id: '1-1',
        userId: 'user-2',
        username: 'MarketAnalyst',
        content: 'Agreed! The ETF inflows have been massive.',
        timestamp: '2025-12-30T15:45:00Z',
        likes: 8,
      },
    ],
  },
  {
    id: '2',
    userId: 'user-3',
    username: 'SkepticalInvestor',
    content: 'Not so sure about this. There are still significant regulatory hurdles to overcome.',
    timestamp: '2025-12-29T10:15:00Z',
    likes: 12,
  },
  {
    id: '3',
    userId: 'user-4',
    username: 'TechEnthusiast',
    content: 'The fundamentals look strong. I\'m holding YES positions.',
    timestamp: '2025-12-28T18:00:00Z',
    likes: 31,
  },
];

interface CommentsSectionProps {
  marketId: string;
}

export function CommentsSection({ marketId }: CommentsSectionProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'new'>('top');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: user?.id || '',
      username: user?.username || 'Anonymous',
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleLike = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    ));
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'top') {
      return b.likes - a.likes;
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            {comments.length} Comments
          </h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setSortBy('top')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
              sortBy === 'top'
                ? 'bg-surface text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Top
          </button>
          <button
            onClick={() => setSortBy('new')}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
              sortBy === 'new'
                ? 'bg-surface text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            New
          </button>
        </div>
      </div>

      {/* New Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <div className="h-9 w-9 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-9 px-4 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-lg bg-surface text-center">
          <p className="text-sm text-muted-foreground">
            <a href="/auth" className="text-primary hover:underline">Log in</a> to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <CommentCard 
            key={comment.id} 
            comment={comment} 
            onLike={() => handleLike(comment.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CommentCard({ comment, onLike }: { comment: Comment; onLike: () => void }) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
          {comment.avatar ? (
            <img src={comment.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              {comment.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">{comment.username}</span>
            <span className="text-xs text-muted-foreground">
              {dayjs(comment.timestamp).fromNow()}
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{comment.likes}</span>
            </button>
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply className="h-3.5 w-3.5" />
                <span>{comment.replies.length} replies</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {showReplies && comment.replies && (
        <div className="ml-12 space-y-3 border-l-2 border-border pl-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground">
                  {reply.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{reply.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {dayjs(reply.timestamp).fromNow()}
                  </span>
                </div>
                <p className="text-sm text-foreground">{reply.content}</p>
                <div className="flex items-center gap-4 mt-1">
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{reply.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
