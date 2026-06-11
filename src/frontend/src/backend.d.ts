import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface UserPublic {
    id: UserId;
    username: string;
    displayName: string;
    createdAt: Timestamp;
    role: UserRole;
    email: string;
    language: Language;
    darkMode: boolean;
    avatarUrl: string;
    isBanned: boolean;
    facebookUrl?: string;
    tiktokUrl?: string;
}
export interface UserDownloadCount {
    userId: string;
    count: bigint;
}
export interface DailyDownloadTotal {
    date: string;
    count: bigint;
}
export interface NotificationView {
    id: string;
    userId: UserId;
    kind: NotificationKind;
    isRead: boolean;
    actorId: UserId;
    message: string;
    timestamp: Timestamp;
    videoId?: string;
}
export interface VideoPostView {
    id: string;
    dislikeCount: bigint;
    status: VideoPostStatus;
    title: string;
    likeCount: bigint;
    thumbnailUrl: string;
    createdAt: bigint;
    tags: Array<string>;
    description: string;
    updatedAt: bigint;
    viewCount: bigint;
    category: string;
    videoUrl: string;
    uploaderId: UserId;
}
export interface VideoPostInput {
    title: string;
    thumbnailUrl: string;
    tags: Array<string>;
    description: string;
    category: string;
    videoUrl: string;
}
export interface RecommendedVideo {
    platform: Platform;
    score: number;
    reason: string;
    videoId: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface NotificationPage {
    total: bigint;
    offset: bigint;
    limit: bigint;
    unreadCount: bigint;
    items: Array<NotificationView>;
}
export type VideoId = string;
export interface TierDownloadCount {
    count: bigint;
    tier: string;
}
export interface RegisterInput {
    username: string;
    displayName: string;
    email: string;
    avatarUrl: string;
}
export interface DownloadAnalytics {
    byTier: Array<TierDownloadCount>;
    dailyTotals: Array<DailyDownloadTotal>;
    totalDownloads: bigint;
    topUsers: Array<UserDownloadCount>;
}
export interface VideoStats {
    dislikeCount: bigint;
    likeCount: bigint;
    commentCount: bigint;
}
export interface PageResult {
    total: bigint;
    offset: bigint;
    limit: bigint;
    items: Array<VideoPostView>;
}
export type AuthResult = {
    __kind__: "ok";
    ok: UserId;
} | {
    __kind__: "err";
    err: string;
};
export interface ActivityItem {
    activityType: Variant_watched_posted;
    userId: UserId;
    timestamp: bigint;
    videoId: string;
}
export interface SubscriptionView {
    id: string;
    status: SubscriptionStatus;
    stripeSubscriptionId: string;
    userId: UserId;
    tier: SubscriptionTier;
    currentPeriodEnd: Timestamp;
    stripeCustomerId: string;
    planType: PlanType;
}
export interface PageResult_1 {
    total: bigint;
    offset: bigint;
    limit: bigint;
    items: Array<CommentView>;
}
export interface CommentView {
    id: string;
    isDeleted: boolean;
    parentCommentId?: string;
    authorId: UserId;
    createdAt: bigint;
    text: string;
    updatedAt: bigint;
    isEdited: boolean;
    videoId: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface WatchHistoryEntry {
    title: string;
    thumbnailUrl: string;
    watchedAt: Timestamp;
    platform: Platform;
    videoId: VideoId;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type UserId = Principal;
export interface UpdateProfileInput {
    displayName: string;
    email: string;
    avatarUrl: string;
    facebookUrl?: string;
    tiktokUrl?: string;
}
export interface TrendingEntry {
    video: VideoMetadata;
    watchCount: bigint;
}
export interface ContentStats {
    totalVideoPosts: bigint;
    deletedComments: bigint;
    activeVideoPosts: bigint;
    totalReactions: bigint;
    deletedVideoPosts: bigint;
    flaggedVideoPosts: bigint;
    totalComments: bigint;
}
export interface AdminStats {
    bannedUsers: bigint;
    trendingCount: bigint;
    totalWatchEvents: bigint;
    totalUsers: bigint;
}
export interface UserSettings {
    language: Language;
    darkMode: boolean;
}
export interface VideoMetadata {
    title: string;
    duration: string;
    channelTitle: string;
    thumbnailUrl: string;
    publishedAt: string;
    platform: Platform;
    viewCount: string;
    videoId: VideoId;
}
export enum Language {
    ar = "ar",
    en = "en"
}
export enum NotificationKind {
    video_commented = "video_commented",
    new_video_from_followed = "new_video_from_followed",
    new_follower = "new_follower",
    video_liked = "video_liked"
}
export enum PlanType {
    annual = "annual",
    monthly = "monthly"
}
export enum Platform {
    tiktok = "tiktok",
    vimeo = "vimeo",
    kwai = "kwai",
    dailymotion = "dailymotion",
    archive = "archive",
    youtube = "youtube"
}
export enum ReactionKind {
    like = "like",
    dislike = "dislike"
}
export enum SubscriptionStatus {
    incomplete = "incomplete",
    active = "active",
    canceled = "canceled",
    pastDue = "pastDue"
}
export enum SubscriptionTier {
    pro = "pro",
    free = "free",
    plus = "plus"
}
export enum UserRole {
    admin = "admin",
    user = "user"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_watched_posted {
    watched = "watched",
    posted = "posted"
}
export enum VideoPostStatus {
    deleted = "deleted",
    active = "active",
    flagged = "flagged"
}
export interface backendInterface {
    addComment(videoId: string, parentCommentId: string | null, text: string): Promise<CommentView>;
    addVideoToPlaylist(playlistId: string, videoId: string, userId: string, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addWatchHistory(entry: WatchHistoryEntry): Promise<void>;
    adminDeleteComment(commentId: string): Promise<boolean>;
    adminGetContentStats(): Promise<ContentStats>;
    adminListAllComments(offset: bigint, limit: bigint): Promise<PageResult_1>;
    adminListAllVideoPosts(offset: bigint, limit: bigint): Promise<PageResult>;
    adminUpdateVideoPostStatus(postId: string, status: VideoPostStatus): Promise<VideoPostView | null>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    banUser(userId: UserId): Promise<void>;
    canUserAccessVideo(videoId: string): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    canUserDownload(userId: string): Promise<boolean>;
    cancelSubscription(): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    clearWatchHistory(): Promise<void>;
    createCheckoutSession(tier: SubscriptionTier, planType: PlanType, successUrl: string, returnUrl: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createCustomerPortalSession(returnUrl: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createPlaylist(userId: string, name: string, description: string, isPublic: boolean, token: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createVideoPost(input: VideoPostInput): Promise<VideoPostView>;
    deleteComment(commentId: string): Promise<boolean>;
    deleteCommentByAdmin(commentId: string): Promise<boolean>;
    /**
     * / Deletes the calling user's account and all associated data. Caller must be authenticated.
     */
    deleteMyAccount(): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deletePlaylist(playlistId: string, userId: string, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteVideoPost(postId: string): Promise<boolean>;
    deleteVideoPostByAdmin(postId: string): Promise<VideoPostView | null>;
    demoteFromAdmin(userId: UserId): Promise<void>;
    editComment(commentId: string, newText: string): Promise<CommentView | null>;
    flagVideoPost(postId: string): Promise<VideoPostView | null>;
    followUser(targetPrincipal: Principal): Promise<boolean>;
    getAdminStats(): Promise<AdminStats>;
    getArchiveEnabled(): Promise<boolean>;
    getCallerUserProfile(): Promise<UserPublic | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getContentGatingSettings(): Promise<{
        defaultFreeVideosPerDay: bigint;
        enabled: boolean;
    }>;
    getDailyDownloadLimit(): Promise<bigint>;
    getDailymotionApiKey(): Promise<string>;
    getDownloadAnalytics(): Promise<DownloadAnalytics>;
    getDownloadCount(userId: string, date: string): Promise<bigint>;
    getDownloadLimit(): Promise<bigint>;
    getFlaggedContent(): Promise<PageResult>;
    getFollowActivity(limit: bigint): Promise<Array<ActivityItem>>;
    getFollowers(userId: Principal): Promise<Array<Principal>>;
    getFollowing(userId: Principal): Promise<Array<Principal>>;
    getMyNotifications(offset: bigint, limit: bigint): Promise<NotificationPage>;
    getMySubscription(): Promise<SubscriptionView | null>;
    getPlaylist(playlistId: string): Promise<{
        __kind__: "ok";
        ok: {
            id: string;
            userId: string;
            name: string;
            createdAt: bigint;
            description: string;
            updatedAt: bigint;
            isPublic: boolean;
            videoIds: Array<string>;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    getPremiumVideoIds(): Promise<Array<string>>;
    getProfileByUsername(username: string): Promise<UserPublic | null>;
    getProviderEnabled(provider: string): Promise<boolean>;
    getRecommendations(limit: bigint): Promise<Array<RecommendedVideo>>;
    getSaltForUser(username: string): Promise<string | null>;
    /**
     * / Returns the stored Stripe publishable key (public key, no auth needed).
     */
    getStripePublishableKey(): Promise<string>;
    getTikTokApiKey(): Promise<string>;
    getTrending(): Promise<Array<TrendingEntry>>;
    getUnreadCount(): Promise<bigint>;
    getUser(userId: UserId): Promise<UserPublic | null>;
    getUserPlaylists(userId: string): Promise<Array<{
        id: string;
        userId: string;
        name: string;
        createdAt: bigint;
        description: string;
        updatedAt: bigint;
        isPublic: boolean;
        videoIds: Array<string>;
    }>>;
    getUserSettings(): Promise<UserSettings>;
    getVideoComments(videoId: string): Promise<Array<CommentView>>;
    getVideoPost(postId: string): Promise<VideoPostView | null>;
    getVideoReaction(videoId: string): Promise<ReactionKind | null>;
    getVideoStats(videoId: string): Promise<VideoStats | null>;
    getVimeoApiKey(): Promise<string>;
    getWatchHistory(): Promise<Array<WatchHistoryEntry>>;
    getWebhookEndpointInfo(): Promise<{
        note: string;
        path: string;
    }>;
    getYouTubeApiKey(): Promise<string>;
    handleStripeWebhook(rawBody: string, signature: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Check if the given username belongs to the admin account.
     * / Used by the frontend to verify admin status without needing II.
     */
    isAdminUsername(username: string): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isFollowing(targetPrincipal: Principal): Promise<boolean>;
    linkGoogleAccount(googleSub: string, email: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    listAllUsers(): Promise<Array<UserPublic>>;
    listUserVideoPosts(uploader: Principal, offset: bigint, limit: bigint): Promise<PageResult>;
    listVideoPosts(offset: bigint, limit: bigint): Promise<PageResult>;
    loginWithCredentials(username: string, passwordHash: string): Promise<AuthResult>;
    markAllRead(): Promise<void>;
    markNotificationRead(id: string): Promise<void>;
    promoteToAdmin(userId: UserId): Promise<void>;
    reactToVideo(videoId: string, reaction: ReactionKind): Promise<boolean>;
    recordDownload(userId: string, videoId: string, platform: string, token: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerUser(input: RegisterInput): Promise<UserPublic>;
    registerWithCredentials(username: string, email: string, passwordHash: string, salt: string): Promise<AuthResult>;
    removeVideoFromPlaylist(playlistId: string, videoId: string, userId: string, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Re-seed the admin account. Call this if admin access is lost.
     * / Returns true if seeding succeeded.
     */
    reseedAdmin(): Promise<boolean>;
    resetDownloadCounts(token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveCallerUserProfile(input: RegisterInput): Promise<void>;
    searchYouTube(searchQuery: string, maxResults: bigint): Promise<string>;
    setArchiveEnabled(enabled: boolean, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setContentGatingSettings(enabled: boolean, defaultFreeVideosPerDay: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setDailyDownloadLimitAuth(limit: bigint, username: string, passHash: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setDailyDownloadLimitByToken(limit: bigint, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setDailymotionApiKey(apiKey: string, username: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setDailymotionApiKeyByToken(apiKey: string, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setDownloadLimit(limit: bigint, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setProviderEnabled(provider: string, enabled: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    /**
     * / Sets the Stripe publishable key, secret key, and webhook secret.
     * / No caller-based auth since frontend calls are anonymous.
     */
    setStripeKeys(publishableKey: string, secretKey: string, webhookSecret: string): Promise<void>;
    /**
     * / Sets Stripe keys after verifying admin credentials.
     * / Accepts the username and client-side password hash (same format as loginWithCredentials).
     */
    setStripeKeysAuth(publishableKey: string, secretKey: string, webhookSecret: string, username: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setTikTokApiKeyAuth(apiKey: string, username: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setTikTokApiKeyWithToken(apiKey: string, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setVideoPremium(videoId: string, isPremium: boolean, requiredTier: SubscriptionTier): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setVimeoApiKey(apiKey: string): Promise<void>;
    setVimeoApiKeyAuth(apiKey: string, username: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setVimeoApiKeyByToken(apiKey: string, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setVimeoApiKeyWithToken(apiKey: string, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setYouTubeApiKey(apiKey: string): Promise<void>;
    setYouTubeApiKeyAuth(apiKey: string, username: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setYouTubeApiKeyByToken(apiKey: string, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setYouTubeApiKeyWithToken(apiKey: string, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    transformSubscription(input: TransformationInput): Promise<TransformationOutput>;
    unbanUser(userId: UserId): Promise<void>;
    unfollowUser(targetPrincipal: Principal): Promise<boolean>;
    updatePlaylist(playlistId: string, name: string, description: string, isPublic: boolean, userId: string, token: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateProfile(input: UpdateProfileInput): Promise<UserPublic>;
    updateSettings(settings: UserSettings): Promise<void>;
    updateVideoPost(postId: string, input: VideoPostInput): Promise<VideoPostView | null>;
    validateDailymotionApiKey(key: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    validateVimeoApiKey(key: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    validateYouTubeApiKey(key: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    verifyGoogleOAuth(idToken: string): Promise<AuthResult>;
}
