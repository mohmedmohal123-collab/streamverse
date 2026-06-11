import type {
  backendInterface,
  UserPublic,
  UserSettings,
  WatchHistoryEntry,
  TrendingEntry,
  AdminStats,
  RegisterInput,
  UpdateProfileInput,
  TransformationInput,
  TransformationOutput,
  VideoPostInput,
  VideoPostView,
  CommentView,
  VideoStats,
  ContentStats,
  AuthResult,
  PageResult,
  PageResult_1,
  ActivityItem,
  RecommendedVideo,
  NotificationPage,
  NotificationView,
  SubscriptionView,
} from "../backend";
import {
  Language,
  Platform,
  UserRole,
  UserRole__1,
  VideoPostStatus,
  ReactionKind,
  Variant_watched_posted,
  NotificationKind,
  SubscriptionTier,
  SubscriptionStatus,
  PlanType,
} from "../backend";
import type { Principal } from "@icp-sdk/core/principal";

const sampleUser: UserPublic = {
  id: { toText: () => "aaaaa-aa" } as unknown as Principal,
  username: "ahmed_ali",
  displayName: "Ahmed Ali",
  createdAt: BigInt(1700000000000),
  role: UserRole.user,
  email: "ahmed@example.com",
  language: Language.ar,
  darkMode: true,
  avatarUrl: "https://i.pravatar.cc/150?img=3",
  isBanned: false,
};

const sampleWatchHistory: WatchHistoryEntry[] = [
  {
    title: "شرح كامل لـ React Hooks",
    thumbnailUrl: "https://picsum.photos/seed/watch1/320/180",
    watchedAt: BigInt(1700000000000),
    platform: Platform.youtube,
    videoId: "dQw4w9WgXcQ",
  },
  {
    title: "تعلم TypeScript من الصفر",
    thumbnailUrl: "https://picsum.photos/seed/watch2/320/180",
    watchedAt: BigInt(1699900000000),
    platform: Platform.youtube,
    videoId: "BwuLxPH8IDs",
  },
];

const sampleTrending: TrendingEntry[] = [
  {
    video: {
      title: "أفضل مسلسلات 2024",
      duration: "45:30",
      channelTitle: "Arab Entertainment",
      thumbnailUrl: "https://picsum.photos/seed/trend1/320/180",
      publishedAt: "2024-01-15",
      platform: Platform.youtube,
      viewCount: "2.4M",
      videoId: "trending1",
    },
    watchCount: BigInt(24000),
  },
  {
    video: {
      title: "The Best Gaming Setup 2024",
      duration: "12:45",
      channelTitle: "Tech Reviews",
      thumbnailUrl: "https://picsum.photos/seed/trend2/320/180",
      publishedAt: "2024-02-10",
      platform: Platform.youtube,
      viewCount: "890K",
      videoId: "trending2",
    },
    watchCount: BigInt(8900),
  },
  {
    video: {
      title: "كيف تحسّن مهاراتك في البرمجة",
      duration: "28:12",
      channelTitle: "Code Arabia",
      thumbnailUrl: "https://picsum.photos/seed/trend3/320/180",
      publishedAt: "2024-03-01",
      platform: Platform.youtube,
      viewCount: "1.1M",
      videoId: "trending3",
    },
    watchCount: BigInt(11000),
  },
];

const sampleStats: AdminStats = {
  bannedUsers: BigInt(2),
  trendingCount: BigInt(3),
  totalWatchEvents: BigInt(1540),
  totalUsers: BigInt(128),
};

const sampleVideoPost: VideoPostView = {
  id: "video-001",
  title: "فيديو تجريبي",
  description: "وصف الفيديو",
  thumbnailUrl: "https://picsum.photos/seed/vid1/320/180",
  videoUrl: "https://example.com/video.mp4",
  category: "Tech",
  tags: ["tech", "demo"],
  createdAt: BigInt(1700000000000),
  updatedAt: BigInt(1700000000000),
  viewCount: BigInt(120),
  likeCount: BigInt(15),
  dislikeCount: BigInt(2),
  status: VideoPostStatus.active,
  uploaderId: { toText: () => "aaaaa-aa" } as unknown as Principal,
};

const sampleComment: CommentView = {
  id: "comment-001",
  text: "تعليق رائع على الفيديو",
  videoId: "video-001",
  authorId: { toText: () => "aaaaa-aa" } as unknown as Principal,
  createdAt: BigInt(1700000000000),
  updatedAt: BigInt(1700000000000),
  isEdited: false,
  isDeleted: false,
};

const emptyPageResult: PageResult = {
  items: [],
  total: BigInt(0),
  offset: BigInt(0),
  limit: BigInt(10),
};

const emptyPageResult1: PageResult_1 = {
  items: [],
  total: BigInt(0),
  offset: BigInt(0),
  limit: BigInt(10),
};

const sampleContentStats: ContentStats = {
  totalVideoPosts: BigInt(5),
  activeVideoPosts: BigInt(4),
  flaggedVideoPosts: BigInt(1),
  deletedVideoPosts: BigInt(0),
  totalComments: BigInt(12),
  deletedComments: BigInt(1),
  totalReactions: BigInt(30),
};

const sampleRecommendations: RecommendedVideo[] = [
  {
    videoId: "rec1",
    platform: Platform.youtube,
    score: 0.95,
    reason: "Based on who you follow",
  },
  {
    videoId: "rec2",
    platform: Platform.youtube,
    score: 0.88,
    reason: "Trending in your area",
  },
];

const sampleActivity: ActivityItem[] = [
  {
    userId: { toText: () => "aaaaa-bb" } as unknown as Principal,
    videoId: "activity-vid-1",
    timestamp: BigInt(1700100000000),
    activityType: Variant_watched_posted.watched,
  },
];

export const mockBackend: backendInterface = {
  canUserDownload: async () => true,
  getArchiveEnabled: async () => true,
  setArchiveEnabled: async () => ({ __kind__: "ok" as const, ok: null }),
  getProviderEnabled: async () => true,
  setProviderEnabled: async () => ({ __kind__: "ok" as const, ok: null }),
  getDownloadAnalytics: async () => ({ totalDownloads: 0n, byTier: [], topUsers: [], dailyTotals: [] }),
  getDailymotionApiKey: async () => "",
  setDailymotionApiKeyByToken: async () => ({ __kind__: "ok" as const, ok: null }),
  setDailymotionApiKey: async () => ({ __kind__: "ok" as const, ok: null }),
  validateDailymotionApiKey: async () => ({ __kind__: "ok" as const, ok: null }),
  _initializeAccessControl: async () => {},
  addComment: async (
    _videoId: string,
    _parentId: string | null,
    _text: string,
  ): Promise<CommentView> => sampleComment,
  addWatchHistory: async (_entry: WatchHistoryEntry): Promise<void> => {},
  adminDeleteComment: async (_commentId: string) => true,
  adminGetContentStats: async (): Promise<ContentStats> => sampleContentStats,
  adminListAllComments: async (
    _offset: bigint,
    _limit: bigint,
  ): Promise<PageResult_1> => ({
    ...emptyPageResult1,
    items: [sampleComment],
    total: BigInt(1),
  }),
  adminListAllVideoPosts: async (
    _offset: bigint,
    _limit: bigint,
  ): Promise<PageResult> => ({
    ...emptyPageResult,
    items: [sampleVideoPost],
    total: BigInt(1),
  }),
  adminUpdateVideoPostStatus: async (
    _postId: string,
    _status: typeof VideoPostStatus.active,
  ): Promise<VideoPostView | null> => sampleVideoPost,
  assignCallerUserRole: async (
    _user: Principal,
    _role: UserRole__1,
  ) => undefined,
  banUser: async (_userId: Principal) => undefined,
  clearWatchHistory: async () => undefined,
  createVideoPost: async (_input: VideoPostInput): Promise<VideoPostView> =>
    sampleVideoPost,
  deleteComment: async (_commentId: string) => true,
  deleteCommentByAdmin: async (_commentId: string) => true,
  deleteVideoPost: async (_postId: string) => true,
  deleteVideoPostByAdmin: async (
    _postId: string,
  ): Promise<VideoPostView | null> => sampleVideoPost,
  demoteFromAdmin: async (_userId: Principal) => undefined,
  editComment: async (
    _commentId: string,
    _text: string,
  ): Promise<CommentView | null> => sampleComment,
  flagVideoPost: async (_postId: string): Promise<VideoPostView | null> =>
    sampleVideoPost,
  followUser: async (_targetPrincipal: Principal): Promise<boolean> => true,
  getAdminStats: async () => sampleStats,
  getCallerUserProfile: async () => sampleUser,
  getCallerUserRole: async () => UserRole__1.user,
  getFlaggedContent: async (): Promise<PageResult> => emptyPageResult,
  getFollowActivity: async (
    _limit: bigint,
  ): Promise<ActivityItem[]> => sampleActivity,
  getFollowers: async (_userId: Principal): Promise<Principal[]> => [],
  getFollowing: async (_userId: Principal): Promise<Principal[]> => [],
  getRecommendations: async (
    _limit: bigint,
  ): Promise<RecommendedVideo[]> => sampleRecommendations,
  getSaltForUser: async (_username: string): Promise<string | null> => null,
  getTrending: async () => sampleTrending,
  getUser: async (_userId: Principal) => sampleUser,
  getUserSettings: async (): Promise<UserSettings> => ({
    language: Language.ar,
    darkMode: true,
  }),
  getVideoComments: async (_videoId: string): Promise<CommentView[]> => [
    sampleComment,
  ],
  getVideoPost: async (_postId: string): Promise<VideoPostView | null> =>
    sampleVideoPost,
  getVideoReaction: async (
    _videoId: string,
  ): Promise<ReactionKind | null> => null,
  getVideoStats: async (_videoId: string): Promise<VideoStats | null> => ({
    likeCount: BigInt(15),
    dislikeCount: BigInt(2),
    commentCount: BigInt(3),
  }),
  getVimeoApiKey: async () => "DEMO_VIMEO_KEY",
  getWatchHistory: async () => sampleWatchHistory,
  getYouTubeApiKey: async () => "DEMO_API_KEY",
  isCallerAdmin: async () => false,
  isFollowing: async (_targetPrincipal: Principal): Promise<boolean> => false,
  linkGoogleAccount: async (_googleSub: string, _email: string) => ({
    __kind__: "ok" as const,
    ok: null,
  }),
  listAllUsers: async () => [sampleUser],
  listUserVideoPosts: async (
    _uploader: Principal,
    _offset: bigint,
    _limit: bigint,
  ): Promise<PageResult> => emptyPageResult,
  listVideoPosts: async (
    _offset: bigint,
    _limit: bigint,
  ): Promise<PageResult> => emptyPageResult,
  loginWithCredentials: async (
    _username: string,
    _passwordHash: string,
  ): Promise<AuthResult> => ({
    __kind__: "ok",
    ok: { toText: () => "aaaaa-aa" } as unknown as Principal,
  }),
  promoteToAdmin: async (_userId: Principal) => undefined,
  reactToVideo: async (
    _videoId: string,
    _reaction: ReactionKind,
  ) => true,
  registerUser: async (_input: RegisterInput) => sampleUser,
  registerWithCredentials: async (
    _username: string,
    _email: string,
    _passwordHash: string,
    _salt: string,
  ): Promise<AuthResult> => ({
    __kind__: "ok",
    ok: { toText: () => "aaaaa-aa" } as unknown as Principal,
  }),
  saveCallerUserProfile: async (_input: RegisterInput) => undefined,
  searchYouTube: async (_searchQuery: string, _maxResults: bigint) =>
    JSON.stringify({
      kind: "youtube#searchListResponse",
      items: [
        {
          id: { videoId: "result1" },
          snippet: {
            title: "نتيجة البحث الأولى - فيديو رائع",
            channelTitle: "قناة التقنية",
            thumbnails: {
              medium: {
                url: "https://picsum.photos/seed/search1/320/180",
              },
            },
            publishedAt: "2024-01-01",
          },
        },
        {
          id: { videoId: "result2" },
          snippet: {
            title: "Amazing Tutorial Video - Learn Fast",
            channelTitle: "Tech Channel",
            thumbnails: {
              medium: {
                url: "https://picsum.photos/seed/search2/320/180",
              },
            },
            publishedAt: "2024-02-01",
          },
        },
      ],
    }),
  setVimeoApiKey: async (_apiKey: string) => undefined,
  setYouTubeApiKey: async (_apiKey: string) => undefined,
  transform: async (
    _input: TransformationInput,
  ): Promise<TransformationOutput> => ({
    status: BigInt(200),
    body: new Uint8Array(),
    headers: [],
  }),
  unbanUser: async (_userId: Principal) => undefined,
  unfollowUser: async (_targetPrincipal: Principal): Promise<boolean> => true,
  updateProfile: async (_input: UpdateProfileInput) => sampleUser,
  updateSettings: async (_settings: UserSettings) => undefined,
  updateVideoPost: async (
    _postId: string,
    _input: VideoPostInput,
  ): Promise<VideoPostView | null> => sampleVideoPost,
  verifyGoogleOAuth: async (_idToken: string): Promise<AuthResult> => ({
    __kind__: "ok",
    ok: { toText: () => "aaaaa-aa" } as unknown as Principal,
  }),
  // Notifications
  getMyNotifications: async (
    _offset: bigint,
    _limit: bigint,
  ): Promise<NotificationPage> => ({
    total: BigInt(0),
    offset: _offset,
    limit: _limit,
    unreadCount: BigInt(0),
    items: [] as NotificationView[],
  }),
  getUnreadCount: async (): Promise<bigint> => BigInt(0),
  markNotificationRead: async (_id: string): Promise<void> => {},
  markAllRead: async (): Promise<void> => {},
  // Subscriptions
  createCheckoutSession: async (
    _tier: SubscriptionTier,
    _planType: PlanType,
    _successUrl: string,
    _returnUrl: string,
  ): Promise<{ __kind__: "ok"; ok: string } | { __kind__: "err"; err: string }> => ({
    __kind__: "err",
    err: "Stripe not configured in mock",
  }),
  getMySubscription: async (): Promise<SubscriptionView | null> => null,
  cancelSubscription: async (): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({
    __kind__: "err",
    err: "No subscription in mock",
  }),
  createCustomerPortalSession: async (
    _returnUrl: string,
  ): Promise<{ __kind__: "ok"; ok: string } | { __kind__: "err"; err: string }> => ({
    __kind__: "err",
    err: "Stripe not configured in mock",
  }),
  handleStripeWebhook: async (
    _rawBody: string,
    _signature: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({
    __kind__: "ok",
    ok: null,
  }),
  setStripeKeys: async (_secretKey: string, _webhookSecret: string): Promise<void> => {},
  transformSubscription: async (
    _input: TransformationInput,
  ): Promise<TransformationOutput> => ({
    status: BigInt(200),
    body: new Uint8Array(),
    headers: [],
  }),
  // Content gating
  canUserAccessVideo: async (
    _videoId: string,
  ): Promise<{ __kind__: "ok"; ok: boolean } | { __kind__: "err"; err: string }> => ({
    __kind__: "ok",
    ok: true,
  }),
  getContentGatingSettings: async (): Promise<{
    defaultFreeVideosPerDay: bigint;
    enabled: boolean;
  }> => ({
    defaultFreeVideosPerDay: BigInt(5),
    enabled: false,
  }),
  getPremiumVideoIds: async (): Promise<string[]> => [],
  setContentGatingSettings: async (
    _enabled: boolean,
    _defaultFreeVideosPerDay: bigint,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({
    __kind__: "ok",
    ok: null,
  }),
  setVideoPremium: async (
    _videoId: string,
    _isPremium: boolean,
    _requiredTier: SubscriptionTier,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({
    __kind__: "ok",
    ok: null,
  }),
  deleteMyAccount: async (): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  getStripePublishableKey: async (): Promise<string> => "",
  getProfileByUsername: async (_username: string) => sampleUser,
  isAdminUsername: async (_username: string): Promise<boolean> => false,
  reseedAdmin: async (): Promise<boolean> => true,
  setVimeoApiKeyWithToken: async (_apiKey: string, _token: string): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  setYouTubeApiKeyWithToken: async (_apiKey: string, _token: string): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  setVimeoApiKeyByToken: async (_apiKey: string, _token: string): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  setYouTubeApiKeyByToken: async (_apiKey: string, _token: string): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  setStripeKeysAuth: async (
    _publishableKey: string,
    _secretKey: string,
    _webhookSecret: string,
    _username: string,
    _passwordHash: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  setVimeoApiKeyAuth: async (
    _apiKey: string,
    _username: string,
    _passwordHash: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  setYouTubeApiKeyAuth: async (
    _apiKey: string,
    _username: string,
    _passwordHash: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  validateVimeoApiKey: async (
    _key: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  validateYouTubeApiKey: async (
    _key: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  getWebhookEndpointInfo: async (): Promise<{ path: string; note: string }> => ({
    path: "/stripe-webhook",
    note: "Mock webhook endpoint info",
  }),
  getTikTokApiKey: async (): Promise<string> => "",
  setTikTokApiKeyAuth: async (
    _apiKey: string,
    _username: string,
    _passwordHash: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  setTikTokApiKeyWithToken: async (
    _apiKey: string,
    _token: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  addVideoToPlaylist: async (
    _playlistId: string,
    _videoId: string,
    _userId: string,
    _token: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  createPlaylist: async (
    _userId: string,
    _name: string,
    _description: string,
    _isPublic: boolean,
    _token: string,
  ): Promise<{ __kind__: "ok"; ok: string } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: "mock-playlist-id" }),
  deletePlaylist: async (
    _playlistId: string,
    _userId: string,
    _token: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  getDownloadCount: async (_userId: string, _date: string): Promise<bigint> => BigInt(0),
  getDownloadLimit: async (): Promise<bigint> => BigInt(3),
  getPlaylist: async (
    _playlistId: string,
  ): Promise<{ __kind__: "ok"; ok: { id: string; userId: string; name: string; createdAt: bigint; description: string; updatedAt: bigint; isPublic: boolean; videoIds: string[] } } | { __kind__: "err"; err: string }> => ({ __kind__: "err", err: "not found" }),
  getUserPlaylists: async (_userId: string): Promise<Array<{ id: string; userId: string; name: string; createdAt: bigint; description: string; updatedAt: bigint; isPublic: boolean; videoIds: string[] }>> => [],
  recordDownload: async (
    _userId: string,
    _videoId: string,
    _platform: string,
    _token: string,
  ): Promise<{ __kind__: "ok"; ok: bigint } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: BigInt(1) }),
  removeVideoFromPlaylist: async (
    _playlistId: string,
    _videoId: string,
    _userId: string,
    _token: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  resetDownloadCounts: async (
    _token: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  setDownloadLimit: async (
    _limit: bigint,
    _token: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  getDailyDownloadLimit: async (): Promise<bigint> => BigInt(5),
  setDailyDownloadLimitAuth: async (
    _limit: bigint,
    _username: string,
    _passHash: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  setDailyDownloadLimitByToken: async (
    _limit: bigint,
    _token: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
  updatePlaylist: async (
    _playlistId: string,
    _name: string,
    _description: string,
    _isPublic: boolean,
    _userId: string,
    _token: string,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: string }> => ({ __kind__: "ok", ok: null }),
};
