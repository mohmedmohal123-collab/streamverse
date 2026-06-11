import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import { History, Play, Trash2, Youtube } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import {
  VideoPlayer,
  clearLocalWatchHistory,
  getLocalWatchHistory,
} from "../components/VideoPlayer";
import { useTranslation } from "../lib/i18n";
import type { VideoMetadata } from "../types";

type LocalHistoryEntry = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  watchedAt: number;
  platform: string;
};

function toVideoMetadata(entry: LocalHistoryEntry): VideoMetadata {
  return {
    videoId: entry.videoId,
    title: entry.title,
    thumbnailUrl: entry.thumbnailUrl,
    viewCount: "",
    duration: "",
    channelTitle: "",
    publishedAt: new Date(entry.watchedAt).toISOString(),
    platform: "youtube",
  };
}

export default function WatchHistory() {
  const { t, language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [history, setHistory] = useState<LocalHistoryEntry[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoMetadata | null>(null);

  useEffect(() => {
    setHistory(getLocalWatchHistory());
  }, []);

  const handleClear = useCallback(() => {
    clearLocalWatchHistory();
    setHistory([]);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setActiveVideo(null);
    setHistory(getLocalWatchHistory());
  }, []);

  const formatWatchedAt = useCallback(
    (ts: number) => {
      try {
        return formatDistanceToNow(new Date(ts), {
          addSuffix: true,
          locale: language === "ar" ? arLocale : enUS,
        });
      } catch {
        return "";
      }
    },
    [language],
  );

  return (
    <div
      className="min-h-full bg-background pb-20 md:pb-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Sticky Page Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/15 p-2 flex-shrink-0">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground leading-tight">
                {t("watchHistory")}
              </h1>
              {history.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {history.length}{" "}
                  {language === "ar" ? "فيديو محفوظ" : "saved videos"}
                </p>
              )}
            </div>
          </div>

          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  data-ocid="watch_history.clear_history.open_modal_button"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">
                    {t("clearHistory")}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                data-ocid="watch_history.clear_history.dialog"
                className="max-w-sm"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display">
                    {t("clearHistory")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === "ar"
                      ? "هل أنت متأكد من مسح سجل المشاهدة؟ لا يمكن التراجع عن هذا الإجراء."
                      : "Are you sure you want to clear your watch history? This action cannot be undone."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter
                  className={
                    isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""
                  }
                >
                  <AlertDialogCancel data-ocid="watch_history.clear_history.cancel_button">
                    {t("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="watch_history.clear_history.confirm_button"
                    onClick={handleClear}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pt-5">
        {history.length === 0 ? (
          <EmptyState
            data-ocid="watch_history.empty_state"
            icon={History}
            title={t("noHistory")}
            description={t("noHistoryHint")}
            action={{
              label: language === "ar" ? "ابدأ بالاستكشاف" : "Start Exploring",
              onClick: () => navigate({ to: "/search" }),
              "data-ocid": "watch_history.explore_button",
            }}
          />
        ) : (
          <motion.div
            data-ocid="watch_history.list"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05 } },
            }}
            className="space-y-3"
          >
            {history.map((entry, i) => (
              <HistoryCard
                key={`${entry.videoId}-${entry.watchedAt}`}
                entry={entry}
                index={i + 1}
                formatWatchedAt={formatWatchedAt}
                onPlay={() => setActiveVideo(toVideoMetadata(entry))}
                isRTL={isRTL}
              />
            ))}
          </motion.div>
        )}
      </div>

      <VideoPlayer video={activeVideo} onClose={handleClosePlayer} />
    </div>
  );
}

interface HistoryCardProps {
  entry: LocalHistoryEntry;
  index: number;
  formatWatchedAt: (ts: number) => string;
  onPlay: () => void;
  isRTL: boolean;
}

function HistoryCard({
  entry,
  index,
  formatWatchedAt,
  onPlay,
  isRTL,
}: HistoryCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      type="button"
      data-ocid={`watch_history.item.${index}`}
      variants={{
        hidden: { opacity: 0, x: isRTL ? -16 : 16 },
        show: { opacity: 1, x: 0 },
      }}
      whileHover={{ scale: 1.005 }}
      className="w-full flex gap-3 sm:gap-4 bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:bg-card/80 transition-all duration-200 text-start group"
      onClick={onPlay}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-28 sm:w-44 aspect-video bg-muted self-stretch">
        {!imgError ? (
          <img
            src={entry.thumbnailUrl}
            alt={entry.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-200">
          <div className="rounded-full bg-primary p-2.5 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 shadow-lg">
            <Play className="h-3.5 w-3.5 text-primary-foreground fill-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-3 pe-3 sm:pe-4 flex flex-col justify-between gap-2">
        {/* Title */}
        <p className="font-display font-semibold text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
          {entry.title}
        </p>

        {/* Platform & Channel */}
        <div className="flex flex-wrap items-center gap-1.5">
          {entry.platform === "youtube" && (
            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0 h-5 gap-1 font-normal"
            >
              <Youtube className="h-3 w-3 text-red-500" />
              YouTube
            </Badge>
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 mt-auto">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {formatWatchedAt(entry.watchedAt)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
