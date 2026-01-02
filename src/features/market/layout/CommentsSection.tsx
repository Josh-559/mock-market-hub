import { useState, useEffect } from 'react';
import { Heart, MoreHorizontal, ChevronDown, ChevronUp, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useAuthStore } from '@/features/auth/auth.store';
import { mockSocket } from '@/services/mockSocket';
import type { Comment } from '../market.types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

dayjs.extend(relativeTime);

// Mock comments data with holder positions
const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    userId: 'user-1',
    username: 'VeneconPower',
    content: 'Just gambling',
    timestamp: '2025-12-31T12:30:00Z',
    likes: 1,
    holderPosition: 7300,
    holderDate: 'December 31',
    replies: [],
  },
  {
    id: '2',
    userId: 'user-2',
    username: 'Bshef',
    content: 'There was no strike by u.s',
    timestamp: '2025-12-31T09:15:00Z',
    likes: 3,
    holderPosition: 1000,
    holderDate: 'December 31',
    replies: [],
  },
  {
    id: '3',
    userId: 'user-3',
    username: 'PrinceofPredicti...',
    content: 'can any yes holder tell me when usa strike the yemen',
    timestamp: '2025-12-31T08:00:00Z',
    likes: 2,
    holderPosition: 500,
    holderDate: 'December 31',
    replies: [
      {
        id: '3-1',
        userId: 'user-4',
        username: 'ImpossibleAk12',
        content: '@PrinceofPred... 😂',
        timestamp: '2025-12-31T09:00:00Z',
        likes: 1,
        holderPosition: 7200,
        holderDate: 'December 31',
      },
    ],
  },
  {
    id: '4',
    userId: 'user-5',
    username: 'CryptoTrader',
    content: 'I think this has a high probability of happening based on recent market trends.',
    timestamp: '2025-12-30T14:30:00Z',
    likes: 24,
    holderPosition: 3500,
    holderDate: 'December 30',
    replies: [],
  },
];

interface TradeEvent {
  id: string;
  side: 'yes' | 'no';
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: number;
}

interface CommentsSectionProps {
  marketId: string;
}

export function CommentsSection({ marketId }: CommentsSectionProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'top'>('newest');
  const [holdersOnly, setHoldersOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'holders' | 'activity'>('comments');
  const [trades, setTrades] = useState<TradeEvent[]>([]);

  // Listen for trade activity
  useEffect(() => {
    const unsubscribe = mockSocket.on('TRADE_EXECUTED', (payload: any) => {
      const newTrade: TradeEvent = {
        id: `${Date.now()}-${Math.random()}`,
        side: payload.side,
        type: payload.type,
        price: payload.price,
        quantity: payload.quantity,
        timestamp: payload.timestamp,
      };
      setTrades((prev) => [newTrade, ...prev].slice(0, 20));
    });

    return () => unsubscribe();
  }, []);

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
      holderPosition: 1000,
      holderDate: dayjs().format('MMMM D'),
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleLike = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, likes: c.likes + 1 } : c
    ));
  };

  const filteredComments = holdersOnly 
    ? comments.filter(c => c.holderPosition && c.holderPosition > 0)
    : comments;

  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === 'top') {
      return b.likes - a.likes;
    }
    if (sortBy === 'oldest') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const formatPosition = (position: number) => {
    if (position >= 1000) {
      return `${(position / 1000).toFixed(1)}K`;
    }
    return position.toString();
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('comments')}
            className={cn(
              'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'comments'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Comments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('holders')}
            className={cn(
              'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'holders'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Top Holders
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={cn(
              'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'activity'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Activity
          </button>
        </div>
      </div>

      {activeTab === 'comments' && (
        <>
          {/* New Comment Input */}
          <form onSubmit={handleSubmitComment} className="flex items-center gap-2 border border-border rounded-lg px-4 py-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || !isAuthenticated}
              className="text-sm font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
            >
              Post
            </button>
          </form>

          {/* Sort & Filter Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-28 h-8 text-sm bg-surface border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                </SelectContent>
              </Select>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={holdersOnly}
                  onCheckedChange={(checked) => setHoldersOnly(!!checked)}
                />
                <span className="text-sm text-foreground">Holders</span>
              </label>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Beware of external links.</span>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-1">
            {sortedComments.map((comment) => (
              <CommentCard 
                key={comment.id} 
                comment={comment} 
                onLike={() => handleLike(comment.id)}
                formatPosition={formatPosition}
              />
            ))}
          </div>
        </>
      )}

      {activeTab === 'holders' && (
        <div className="py-8 text-center text-muted-foreground text-sm">
          Top holders data coming soon
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-1">
          {trades.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Waiting for trades...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                <span>Time</span>
                <span>Side</span>
                <span className="text-right">Price</span>
                <span className="text-right">Qty</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {trades.map((trade, index) => {
                  const isNew = index === 0;
                  const isBuy = trade.type === 'buy';
                  return (
                    <div
                      key={trade.id}
                      className={cn(
                        'grid grid-cols-4 gap-2 px-3 py-2 text-sm',
                        isNew && 'animate-flash-green',
                        'hover:bg-surface transition-colors'
                      )}
                    >
                      <span className="text-muted-foreground text-xs">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={cn(
                        'flex items-center gap-1 font-medium',
                        trade.side === 'yes' ? 'text-yes' : 'text-no'
                      )}>
                        {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {trade.side.toUpperCase()}
                      </span>
                      <span className="text-right font-mono">
                        {(trade.price * 100).toFixed(0)}¢
                      </span>
                      <span className="text-right font-mono text-muted-foreground">
                        {trade.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface CommentCardProps {
  comment: Comment;
  onLike: () => void;
  formatPosition: (position: number) => string;
  isReply?: boolean;
}

function CommentCard({ comment, onLike, formatPosition, isReply = false }: CommentCardProps) {
  const [showReplies, setShowReplies] = useState(true);

  const getAvatarGradient = (username: string) => {
    const gradients = [
      'from-orange-400 to-pink-500',
      'from-green-400 to-cyan-500',
      'from-purple-400 to-pink-500',
      'from-yellow-400 to-orange-500',
      'from-blue-400 to-purple-500',
    ];
    const index = username.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className={cn('py-4', !isReply && 'border-b border-border last:border-b-0')}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className={cn(
          'rounded-full bg-gradient-to-br flex-shrink-0',
          getAvatarGradient(comment.username),
          isReply ? 'h-7 w-7' : 'h-9 w-9'
        )} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'font-medium text-foreground',
                isReply ? 'text-sm' : 'text-sm'
              )}>
                {comment.username}
              </span>
              {comment.holderPosition && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                  {formatPosition(comment.holderPosition)} {comment.holderDate}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {dayjs(comment.timestamp).fromNow()}
              </span>
            </div>
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          
          <p className={cn(
            'text-foreground leading-relaxed mt-1',
            isReply ? 'text-sm' : 'text-sm'
          )}>
            {comment.content}
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span className="text-xs">{comment.likes}</span>
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Reply
            </button>
          </div>

          {/* Toggle Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 mt-2 space-y-0">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply as Comment}
              onLike={() => {}}
              formatPosition={formatPosition}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
