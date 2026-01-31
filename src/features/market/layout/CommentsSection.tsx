import { useState, useEffect } from "react";
import {
  Heart,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useAuthStore } from "@/features/auth/auth.store";
import { mockSocket } from "@/services/mockSocket";
import type { Comment } from "../market.types";
import type { MarketOutcome } from "@/features/markets/markets.types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

dayjs.extend(relativeTime);

// Mock comments data with holder positions
const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    userId: "user-1",
    username: "VeneconPower",
    content: "Just gambling",
    timestamp: "2025-12-31T12:30:00Z",
    likes: 1,
    holderPosition: 7300,
    holderDate: "December 31",
    replies: [],
  },
  {
    id: "2",
    userId: "user-2",
    username: "Bshef",
    content: "There was no strike by u.s",
    timestamp: "2025-12-31T09:15:00Z",
    likes: 3,
    holderPosition: 1000,
    holderDate: "December 31",
    replies: [],
  },
  {
    id: "3",
    userId: "user-3",
    username: "PrinceofPredicti...",
    content: "can any yes holder tell me when usa strike the yemen",
    timestamp: "2025-12-31T08:00:00Z",
    likes: 2,
    holderPosition: 500,
    holderDate: "December 31",
    replies: [
      {
        id: "3-1",
        userId: "user-4",
        username: "ImpossibleAk12",
        content: "@PrinceofPred... 😂",
        timestamp: "2025-12-31T09:00:00Z",
        likes: 1,
        holderPosition: 7200,
        holderDate: "December 31",
      },
    ],
  },
  {
    id: "4",
    userId: "user-5",
    username: "CryptoTrader",
    content:
      "I think this has a high probability of happening based on recent market trends.",
    timestamp: "2025-12-30T14:30:00Z",
    likes: 24,
    holderPosition: 3500,
    holderDate: "December 30",
    replies: [],
  },
];

// Mock trade activity events
interface TradeActivityEvent {
  id: string;
  username: string;
  avatarGradient: string;
  action: "bought" | "sold";
  quantity: number;
  side: "Yes" | "No";
  outcome?: string;
  price: number;
  total: number;
  timestamp: number;
}

const MOCK_ACTIVITY: TradeActivityEvent[] = [
  {
    id: "1",
    username: "kunsect7",
    avatarGradient: "from-purple-400 to-pink-500",
    action: "sold",
    quantity: 11,
    side: "Yes",
    outcome: "Kevin Hassett",
    price: 41.0,
    total: 5,
    timestamp: Date.now() - 60000,
  },
  {
    id: "2",
    username: "annapugh",
    avatarGradient: "from-pink-300 to-rose-400",
    action: "sold",
    quantity: 14,
    side: "No",
    outcome: "Kevin Hassett",
    price: 58.0,
    total: 8,
    timestamp: Date.now() - 60000,
  },
  {
    id: "3",
    username: "axiol",
    avatarGradient: "from-orange-400 to-red-500",
    action: "sold",
    quantity: 77,
    side: "Yes",
    outcome: "Christopher Waller",
    price: 13.0,
    total: 10,
    timestamp: Date.now() - 60000,
  },
  {
    id: "4",
    username: "mariawallet",
    avatarGradient: "from-red-400 to-orange-500",
    action: "bought",
    quantity: 55,
    side: "No",
    outcome: "Stephen Miran",
    price: 99.7,
    total: 55,
    timestamp: Date.now() - 120000,
  },
  {
    id: "5",
    username: "mariawallet",
    avatarGradient: "from-red-400 to-orange-500",
    action: "bought",
    quantity: 41,
    side: "No",
    outcome: "Judy Shelton",
    price: 97.4,
    total: 40,
    timestamp: Date.now() - 120000,
  },
  {
    id: "6",
    username: "xxxxMan",
    avatarGradient: "from-green-400 to-lime-500",
    action: "bought",
    quantity: 5,
    side: "Yes",
    outcome: "Kevin Hassett",
    price: 42.0,
    total: 2,
    timestamp: Date.now() - 120000,
  },
  {
    id: "7",
    username: "andreeva",
    avatarGradient: "from-amber-400 to-orange-500",
    action: "bought",
    quantity: 4,
    side: "Yes",
    outcome: "Kevin Hassett",
    price: 42.0,
    total: 2,
    timestamp: Date.now() - 120000,
  },
  {
    id: "8",
    username: "sbimbg",
    avatarGradient: "from-gray-400 to-slate-500",
    action: "sold",
    quantity: 1843,
    side: "Yes",
    outcome: "Christopher Waller",
    price: 13.0,
    total: 240,
    timestamp: Date.now() - 180000,
  },
];

interface CommentsSectionProps {
  marketId: string;
  outcomes?: MarketOutcome[];
}

export function CommentsSection({ marketId, outcomes }: CommentsSectionProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "top">("newest");
  const [holdersOnly, setHoldersOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "comments" | "holders" | "activity"
  >("comments");
  const [activity, setActivity] = useState<TradeActivityEvent[]>(MOCK_ACTIVITY);
  const [activityFilter, setActivityFilter] = useState<
    "all" | "bought" | "sold"
  >("all");
  const [minAmount, setMinAmount] = useState<number | null>(null);

  // Listen for trade activity
  useEffect(() => {
    const unsubscribe = mockSocket.on("TRADE_EXECUTED", (payload: any) => {
      const newTrade: TradeActivityEvent = {
        id: `${Date.now()}-${Math.random()}`,
        username: user?.username || "anonymous",
        avatarGradient: "from-blue-400 to-cyan-500",
        action: payload.type,
        quantity: payload.quantity,
        side: payload.side === "yes" ? "Yes" : "No",
        price: payload.price * 100,
        total: payload.quantity * payload.price,
        timestamp: payload.timestamp,
      };
      setActivity((prev) => [newTrade, ...prev].slice(0, 20));
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: user?.id || "",
      username: user?.username || "Anonymous",
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      holderPosition: 1000,
      holderDate: dayjs().format("MMMM D"),
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  const handleLike = (commentId: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c,
      ),
    );
  };

  const filteredComments = holdersOnly
    ? comments.filter((c) => c.holderPosition && c.holderPosition > 0)
    : comments;

  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === "top") {
      return b.likes - a.likes;
    }
    if (sortBy === "oldest") {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const filteredActivity = activity.filter((a) => {
    if (activityFilter !== "all" && a.action !== activityFilter) return false;
    if (minAmount && a.total < minAmount) return false;
    return true;
  });

  const formatPosition = (position: number) => {
    if (position >= 1000) {
      return `${(position / 1000).toFixed(1)}K`;
    }
    return position.toString();
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("comments")}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "comments"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Comments ({comments.length})
          </button>
          {/* <button
            onClick={() => setActiveTab('holders')}
            className={cn(
              'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'holders'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Top Holders
          </button> */}
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "pb-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "activity"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Activity
          </button>
        </div>
      </div>

      {activeTab === "comments" && (
        <>
          {/* New Comment Input */}
          <form
            onSubmit={handleSubmitComment}
            className="flex items-center gap-2 border border-border rounded-lg px-4 py-3"
          >
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
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as typeof sortBy)}
              >
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

      {activeTab === "holders" && (
        <div className="py-8 text-center text-muted-foreground text-sm">
          Top holders data coming soon
        </div>
      )}

      {activeTab === "activity" && (
        <div className="space-y-4">
          {/* Activity Filters */}
          <div className="flex items-center gap-3">
            <Select
              value={activityFilter}
              onValueChange={(v) =>
                setActivityFilter(v as typeof activityFilter)
              }
            >
              <SelectTrigger className="w-20 h-8 text-sm bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="bought">Bought</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={minAmount?.toString() || "any"}
              onValueChange={(v) =>
                setMinAmount(v === "any" ? null : parseInt(v))
              }
            >
              <SelectTrigger className="w-32 h-8 text-sm bg-background border-border">
                <SelectValue placeholder="Min amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Min amount</SelectItem>
                <SelectItem value="10">₦10+</SelectItem>
                <SelectItem value="100">₦100+</SelectItem>
                <SelectItem value="1000">₦1,000+</SelectItem>
                <SelectItem value="10000">₦10,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity List - Polymarket Style */}
          <div className="divide-y divide-border">
            {filteredActivity.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No activity matching filters
              </div>
            ) : (
              filteredActivity.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-4 hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full bg-gradient-to-br flex-shrink-0",
                        event.avatarGradient,
                      )}
                    />

                    {/* Trade info */}
                    <div className="text-sm">
                      <span className="font-medium text-foreground">
                        {event.username}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        {event.action}{" "}
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          event.side === "Yes" ? "text-yes" : "text-no",
                        )}
                      >
                        {event.quantity} {event.side}
                      </span>
                      {event.outcome && (
                        <>
                          <span className="text-muted-foreground"> for </span>
                          <span className="font-medium text-foreground">
                            {event.outcome}
                          </span>
                        </>
                      )}
                      <span className="text-muted-foreground">
                        {" "}
                        at {event.price.toFixed(1)}¢{" "}
                      </span>
                      <span className="text-muted-foreground">
                        (₦{event.total})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTimeAgo(event.timestamp)}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              ))
            )}
          </div>
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

function CommentCard({
  comment,
  onLike,
  formatPosition,
  isReply = false,
}: CommentCardProps) {
  const [showReplies, setShowReplies] = useState(true);

  const getAvatarGradient = (username: string) => {
    const gradients = [
      "from-orange-400 to-pink-500",
      "from-green-400 to-cyan-500",
      "from-purple-400 to-pink-500",
      "from-yellow-400 to-orange-500",
      "from-blue-400 to-purple-500",
    ];
    const index = username.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div
      className={cn(
        "py-4",
        !isReply && "border-b border-border last:border-b-0",
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className={cn(
            "rounded-full bg-gradient-to-br flex-shrink-0",
            getAvatarGradient(comment.username),
            isReply ? "h-7 w-7" : "h-9 w-9",
          )}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "font-medium text-foreground",
                  isReply ? "text-sm" : "text-sm",
                )}
              >
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

          <p
            className={cn(
              "text-foreground leading-relaxed mt-1",
              isReply ? "text-sm" : "text-sm",
            )}
          >
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
                  Hide {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "Reply" : "Replies"}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "Reply" : "Replies"}
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
