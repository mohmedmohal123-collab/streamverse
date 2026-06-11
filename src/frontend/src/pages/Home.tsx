import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  History,
  Info,
  Play,
  Search,
  Sparkles,
  TrendingUp,
  Tv,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { RecommendedVideo } from "../backend.d";
import { EmptyState } from "../components/EmptyState";
import { GridSkeleton } from "../components/LoadingSpinner";
import { ShareModal } from "../components/ShareModal";
import { VideoCard } from "../components/VideoCard";
import { VideoPlayer, getLocalWatchHistory } from "../components/VideoPlayer";
import {
  getSampleTrendingVideos,
  getTrendingVideos,
  useActor,
} from "../lib/backend";
import { useTranslation } from "../lib/i18n";
import type { VideoMetadata } from "../types";

function toVideoMetadata(v: {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
}): VideoMetadata {
  return {
    videoId: v.videoId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    viewCount: v.viewCount,
    duration: v.duration,
    channelTitle: v.channelTitle,
    publishedAt: v.publishedAt,
    platform: "youtube",
  };
}

// ─── Featured Banner ──────────────────────────────────────────────────────────

interface FeaturedBannerProps {
  videos: VideoMetadata[];
  isRTL: boolean;
  onWatch: (v: VideoMetadata) => void;
}

function FeaturedBanner({ videos, isRTL, onWatch }: FeaturedBannerProps) {
  const [index, setIndex] = useState(0);
  const featured = videos.slice(0, 5);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const current = featured[index];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      data-ocid="home.featured_banner"
      className="relative w-full h-[55vh] min-h-[380px] max-h-[560px] overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={current.thumbnailUrl}
          alt={current.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{ transform: "scale(1.05)" }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-4 md:px-8 pb-10 max-w-4xl">
        <motion.div
          key={current.videoId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <Badge
            variant="secondary"
            className="bg-primary/20 text-primary border-primary/30 text-xs px-2.5 py-0.5"
          >
            <Flame className="h-3 w-3 me-1" />
            {isRTL ? "الأكثر مشاهدة" : "Trending Now"}
          </Badge>

          <h1 className="font-display font-bold text-2xl md:text-4xl lg:text-5xl text-foreground leading-tight line-clamp-2">
            {current.title}
          </h1>

          <p className="text-sm text-muted-foreground line-clamp-2 max-w-lg">
            {current.channelTitle}
            {current.viewCount ? ` · ${current.viewCount} views` : ""}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => onWatch(current)}
              className="gradient-primary text-white border-0 h-11 px-6 font-medium shadow-glow hover:opacity-90 transition-opacity gap-2"
              data-ocid="home.featured_play_button"
            >
              <Play className="h-4 w-4 fill-current" />
              {isRTL ? "تشغيل" : "Play"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onWatch(current)}
              className="h-11 px-5 gap-2 border-border/60 hover:bg-card"
              data-ocid="home.featured_info_button"
            >
              <Info className="h-4 w-4" />
              {isRTL ? "المزيد" : "More Info"}
            </Button>
          </div>
        </motion.div>

        {/* Dots */}
        <div className="flex gap-2 mt-6">
          {featured.map((video, i) => (
            <button
              key={video?.videoId || String(i)}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ─── Content Row ──────────────────────────────────────────────────────────────

interface ContentRowProps {
  title: string;
  icon: React.ElementType;
  videos: VideoMetadata[];
  isRTL: boolean;
  onWatch: (v: VideoMetadata) => void;
  onShare: (v: VideoMetadata) => void;
  dataOcid: string;
  isLoading?: boolean;
}

function ContentRow({
  title,
  icon: Icon,
  videos,
  onWatch,
  onShare,
  dataOcid,
  isLoading,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!isLoading && videos.length === 0) return null;

  return (
    <section className="py-5" data-ocid={dataOcid}>
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="font-display font-bold text-base md:text-lg text-foreground">
            {title}
          </h2>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card/80 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-card/80 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4">
          <GridSkeleton count={4} />
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((video, i) => (
            <div
              key={video.videoId}
              className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px]"
            >
              <VideoCard
                video={video}
                onWatch={(
                  v:
                    | import("../types").VideoMetadata
                    | import("../types").UnifiedVideo,
                ) => onWatch(v as import("../types").VideoMetadata)}
                onShare={(
                  v:
                    | import("../types").VideoMetadata
                    | import("../types").UnifiedVideo,
                ) => onShare?.(v as import("../types").VideoMetadata)}
                onComment={(
                  v:
                    | import("../types").VideoMetadata
                    | import("../types").UnifiedVideo,
                ) => onWatch(v as import("../types").VideoMetadata)}
                index={i}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const { actor } = useActor();
  const [activeVideo, setActiveVideo] = useState<VideoMetadata | null>(null);
  const [shareVideo, setShareVideo] = useState<VideoMetadata | null>(null);
  const [heroQuery, setHeroQuery] = useState("");

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () =>
      getTrendingVideos(12, actor).catch(() => getSampleTrendingVideos()),
    staleTime: 1000 * 60 * 10,
  });

  const trendingVideos = (trendingData ?? getSampleTrendingVideos()).map(
    toVideoMetadata,
  );

  const { data: recentlyWatched = [] } = useQuery({
    queryKey: ["local-watch-history"],
    queryFn: () => {
      const history = getLocalWatchHistory().slice(0, 10);
      return history.map((h) => ({
        videoId: h.videoId,
        title: h.title,
        thumbnailUrl: h.thumbnailUrl,
        viewCount: "",
        duration: "",
        channelTitle: "",
        publishedAt: "",
        platform: h.platform as "youtube",
      }));
    },
    staleTime: 0,
  });

  const { data: recommendations = [], isLoading: recsLoading } = useQuery<
    RecommendedVideo[]
  >({
    queryKey: ["recommendations"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getRecommendations(BigInt(10));
    },
    enabled: !!actor,
    staleTime: 1000 * 60 * 5,
  });

  // Build recommended videos from recommendation data
  const recommendedVideos: VideoMetadata[] = recommendations.map((rec, i) => ({
    videoId: rec.videoId,
    title: isRTL ? `فيديو مقترح #${i + 1}` : `Suggested Video #${i + 1}`,
    thumbnailUrl: `https://picsum.photos/seed/rec-${rec.videoId}/320/180`,
    viewCount: "",
    duration: "",
    channelTitle: "",
    publishedAt: "",
    platform: rec.platform === "vimeo" ? "vimeo" : "youtube",
  }));

  // "New on StreamVerse" = reversed trending
  const newVideos = [...trendingVideos].reverse();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = heroQuery.trim();
    if (q) {
      navigate({ to: "/search", search: { q } });
    } else {
      navigate({ to: "/search" });
    }
  };

  return (
    <div
      className="min-h-full bg-background pb-8 overflow-y-auto"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── Featured Banner ── */}
      <FeaturedBanner
        videos={trendingVideos}
        isRTL={isRTL}
        onWatch={setActiveVideo}
      />

      {/* ── Continue Watching ── */}
      {recentlyWatched.length > 0 && (
        <ContentRow
          title={isRTL ? "مواصلة المشاهدة" : "Continue Watching"}
          icon={Clock}
          videos={recentlyWatched.map((v) => ({
            videoId: v.videoId,
            title: v.title,
            thumbnailUrl: v.thumbnailUrl,
            viewCount: v.viewCount,
            duration: v.duration,
            channelTitle: v.channelTitle,
            publishedAt: v.publishedAt,
            platform: v.platform,
          }))}
          isRTL={isRTL}
          onWatch={setActiveVideo}
          onShare={setShareVideo}
          dataOcid="home.continue_watching_row"
        />
      )}

      {/* ── Trending Now ── */}
      <ContentRow
        title={isRTL ? "الأكثر رواجاً" : "Trending Now"}
        icon={TrendingUp}
        videos={trendingVideos}
        isRTL={isRTL}
        onWatch={setActiveVideo}
        onShare={setShareVideo}
        dataOcid="home.trending_row"
        isLoading={trendingLoading}
      />

      {/* ── Recommended For You ── */}
      {recsLoading || recommendedVideos.length > 0 ? (
        <div className="bg-muted/20">
          <ContentRow
            title={isRTL ? "مقترح لك" : "Recommended For You"}
            icon={Sparkles}
            videos={recommendedVideos}
            isRTL={isRTL}
            onWatch={setActiveVideo}
            onShare={setShareVideo}
            dataOcid="home.recommendations_row"
            isLoading={recsLoading}
          />
        </div>
      ) : null}

      {/* ── New on StreamVerse ── */}
      <ContentRow
        title={isRTL ? "جديد على StreamVerse" : "New on StreamVerse"}
        icon={Flame}
        videos={newVideos}
        isRTL={isRTL}
        onWatch={setActiveVideo}
        onShare={setShareVideo}
        dataOcid="home.new_row"
      />

      {/* ── Switch to Feed CTA ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="px-4 py-8"
        data-ocid="home.feed_cta_section"
      >
        <div className="max-w-xl mx-auto text-center space-y-4 bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-glow">
            <Tv className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display font-bold text-xl text-foreground">
            {isRTL ? "جرب وضع التصفح السريع" : "Try TikTok-Style Feed"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {isRTL
              ? "تصفح الفيديوهات بشكل عمودي سريع وممتع كتيك توك"
              : "Browse videos in a fast, vertical TikTok-style feed"}
          </p>
          <Button
            asChild
            className="gradient-primary text-white border-0 h-11 px-6 font-medium shadow-glow hover:opacity-90 transition-opacity gap-2"
            data-ocid="home.feed_cta_button"
          >
            <Link to="/feed">
              <Play className="h-4 w-4 fill-current" />
              {isRTL ? "فتح التصفح السريع" : "Open Feed"}
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* ── Search CTA ── */}
      <section
        className="px-4 py-6 bg-muted/20"
        data-ocid="home.search_section"
      >
        <div className="max-w-lg mx-auto text-center space-y-4">
          <h2 className="font-display font-bold text-lg text-foreground">
            {isRTL ? "ابحث عن محتواك المفضل" : "Find Your Favorite Content"}
          </h2>
          <form
            onSubmit={handleHeroSearch}
            className="flex gap-2"
            data-ocid="home.search_form"
          >
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder={
                  isRTL
                    ? "ابحث عن فيديوهات، موسيقى، أفلام..."
                    : "Search videos, music, movies..."
                }
                className="w-full ps-9 bg-background/50 border border-border/60 focus:border-primary focus:bg-background h-11 text-sm rounded-md px-3 outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                data-ocid="home.search_input"
              />
            </div>
            <Button
              type="submit"
              className="gradient-primary text-white border-0 h-11 px-5 font-medium shadow-glow hover:opacity-90 transition-opacity"
              data-ocid="home.search_button"
            >
              {isRTL ? "بحث" : "Search"}
            </Button>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 pt-8 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Video Player Modal */}
      <VideoPlayer
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        onShare={() => {
          if (activeVideo) setShareVideo(activeVideo);
        }}
      />

      {/* Share Modal */}
      <ShareModal video={shareVideo} onClose={() => setShareVideo(null)} />
    </div>
  );
}
