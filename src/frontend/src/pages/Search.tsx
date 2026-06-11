import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  ChevronDown,
  Loader2,
  Mic,
  Music2,
  Search as SearchIcon,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { GridSkeleton } from "../components/LoadingSpinner";
import { ShareModal } from "../components/ShareModal";
import { VideoCard } from "../components/VideoCard";
import { VideoPlayer } from "../components/VideoPlayer";
import {
  getTikTokApiKeySync,
  getVimeoApiKeySync,
  getYouTubeApiKeySync,
  searchTikTok,
  searchVimeo,
  searchYouTube,
  useActor,
} from "../lib/backend";
import { useTranslation } from "../lib/i18n";
import type { VideoMetadata } from "../types";

// ─── AI suggestions data ────────────────────────────────────────────────────
const AI_PATTERNS_EN: Array<{ keys: string[]; suggestions: string[] }> = [
  {
    keys: ["movie", "film", "cinema", "أفلام", "فيلم"],
    suggestions: [
      "Top action movies 2025",
      "Award-winning drama films",
      "Best Arabic movies",
      "Hollywood blockbusters 2024",
    ],
  },
  {
    keys: ["music", "song", "موسيقى", "أغاني", "أغنية"],
    suggestions: [
      "Arabic pop hits 2025",
      "Top music videos this month",
      "Relaxing study music",
      "Best music releases 2024",
    ],
  },
  {
    keys: ["game", "gaming", "play", "ألعاب", "لعبة"],
    suggestions: [
      "Gaming highlights compilation",
      "Top 10 games 2025",
      "Minecraft survival guide",
      "Best game reviews",
    ],
  },
  {
    keys: ["tech", "technology", "review", "تقنية", "تقنيات", "مراجعة"],
    suggestions: [
      "Best smartphones 2025",
      "AI tools explained",
      "Laptop buying guide",
      "Latest tech news",
    ],
  },
  {
    keys: ["cook", "recipe", "food", "طبخ", "وصفة", "أكل"],
    suggestions: [
      "Authentic Arabic recipes",
      "Quick dinner ideas",
      "Healthy meal prep",
      "Dessert recipes easy",
    ],
  },
  {
    keys: ["learn", "tutorial", "course", "تعلم", "شرح", "دورة"],
    suggestions: [
      "Learn Python for beginners",
      "English speaking practice",
      "Drawing tutorial easy",
      "Arabic learning guide",
    ],
  },
];

const QUICK_SUGGESTIONS_EN = [
  "Top movies 2025",
  "Arabic music hits",
  "Tech reviews",
  "Cooking tutorials",
  "Gaming highlights",
  "Travel vlogs",
  "Documentary films",
];
const QUICK_SUGGESTIONS_AR = [
  "أفضل أفلام 2025",
  "موسيقى عربية",
  "مراجعات تقنية",
  "وصفات طبخ",
  "ألعاب فيديو",
  "رحلات سفر",
  "وثائقيات",
];

const PAGE_SIZE = 12;
const LOAD_MORE_SIZE = 8;

type SourceFilter = "all" | "youtube" | "vimeo" | "tiktok";

// ─── Helpers ────────────────────────────────────────────────────────────────
function getAiSuggestions(query: string): string[] {
  const lower = query.toLowerCase();
  for (const { keys, suggestions } of AI_PATTERNS_EN) {
    if (keys.some((k) => lower.includes(k))) return suggestions;
  }
  if (query.length > 2) {
    return [
      `${query} tutorial`,
      `${query} 2025`,
      `Best ${query} videos`,
      `${query} beginners guide`,
    ];
  }
  return [
    "Top trending 2025",
    "Most watched this week",
    "Best Arabic content",
    "Popular documentaries",
  ];
}

function getAiSuggestionsAr(query: string): string[] {
  if (query.length > 1) {
    return [
      `${query} للمبتدئين`,
      `أفضل ${query} 2025`,
      `${query} شرح كامل`,
      `${query} تعليمي`,
    ];
  }
  return [
    "الأكثر مشاهدة هذا الأسبوع",
    "أفلام عربية مميزة",
    "موسيقى هادئة للدراسة",
    "وثائقيات مثيرة",
  ];
}

// ─── Component ────────────────────────────────────────────────────────────
export default function Search() {
  const { t, isRTL, language } = useTranslation();
  const { actor } = useActor();

  const initialQuery =
    new URLSearchParams(window.location.search).get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [aiQuery, setAiQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [allResults, setAllResults] = useState<VideoMetadata[]>([]);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoMetadata | null>(null);
  const [shareVideo, setShareVideo] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiTyped, setAiTyped] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  // ─── Voice search state ───────────────────────────────────────────────────
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "error">(
    "idle",
  );
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  // ─── Audio fingerprint state ───────────────────────────────────────────────
  type AudioSearchState =
    | "idle"
    | "recording"
    | "identifying"
    | "matched"
    | "nomatch"
    | "error";
  const [audioState, setAudioState] = useState<AudioSearchState>("idle");
  const [audioCountdown, setAudioCountdown] = useState(0);
  const [audioStatusMsg, setAudioStatusMsg] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Voice search handler ─────────────────────────────────────────────────
  const handleVoiceSearch = () => {
    type SpeechRecognitionCtor = new () => {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult:
        | ((e: {
            results: { [i: number]: { [j: number]: { transcript: string } } };
          }) => void)
        | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
      stop: () => void;
    };
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognitionAPI =
      win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setVoiceState("error");
      setTimeout(() => setVoiceState("idle"), 2500);
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setVoiceState("idle");
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language === "ar" ? "ar-SA" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setVoiceState("listening");
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript.trim()) {
        setQuery(transcript.trim());
        doSearch(transcript.trim());
      }
      recognitionRef.current = null;
      setVoiceState("idle");
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setVoiceState("error");
      setTimeout(() => setVoiceState("idle"), 2500);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setVoiceState((s) => (s === "listening" ? "idle" : s));
    };
    recognition.start();
  };

  // ─── Audio fingerprint handler ─────────────────────────────────────────────
  const handleAudioSearch = async () => {
    if (audioState !== "idle") {
      mediaRecorderRef.current?.stop();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setAudioState("idle");
      setAudioCountdown(0);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setAudioState("error");
      setAudioStatusMsg(t("search.audio.unsupported"));
      setTimeout(() => setAudioState("idle"), 3000);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/ogg",
      });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        for (const trk of stream.getTracks()) trk.stop();
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        setAudioCountdown(0);
        setAudioState("identifying");
        setAudioStatusMsg(t("search.audio.identifying"));
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType,
        });
        try {
          const fd = new FormData();
          fd.append("file", blob, "audio.webm");
          fd.append("return", "spotify,apple_music,deezer");
          const res = await fetch("https://api.audd.io/", {
            method: "POST",
            body: fd,
          });
          const json = (await res.json()) as {
            status: string;
            result?: { title?: string; artist?: string };
          };
          if (json.status === "success" && json.result?.title) {
            const searchQ = `${json.result.artist ? `${json.result.artist} ` : ""}${json.result.title}`;
            setAudioStatusMsg(t("search.audio.matched") + searchQ);
            setAudioState("matched");
            setQuery(searchQ);
            doSearch(searchQ);
            setTimeout(() => {
              setAudioState("idle");
              setAudioStatusMsg("");
            }, 3000);
          } else {
            setAudioState("nomatch");
            setAudioStatusMsg(t("search.audio.noMatch"));
            setTimeout(() => {
              setAudioState("idle");
              setAudioStatusMsg("");
            }, 3000);
          }
        } catch {
          setAudioState("error");
          setAudioStatusMsg(t("search.audio.error"));
          setTimeout(() => {
            setAudioState("idle");
            setAudioStatusMsg("");
          }, 3000);
        }
      };
      recorder.start();
      setAudioState("recording");
      setAudioStatusMsg(t("search.audio.recording"));
      setAudioCountdown(8);
      let remaining = 8;
      countdownTimerRef.current = setInterval(() => {
        remaining -= 1;
        setAudioCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(countdownTimerRef.current!);
          recorder.stop();
        }
      }, 1000);
    } catch {
      setAudioState("error");
      setAudioStatusMsg(t("search.audio.error"));
      setTimeout(() => {
        setAudioState("idle");
        setAudioStatusMsg("");
      }, 3000);
    }
  };

  const hasYouTubeKey = !!getYouTubeApiKeySync();
  const hasVimeoKey = !!getVimeoApiKeySync();
  const hasTikTokKey = !!getTikTokApiKeySync();
  const hasApiKey = hasYouTubeKey || hasVimeoKey || hasTikTokKey;

  const quickSuggestions =
    language === "ar" ? QUICK_SUGGESTIONS_AR : QUICK_SUGGESTIONS_EN;

  const filteredResults =
    sourceFilter === "all"
      ? allResults
      : allResults.filter((v) => v.platform === sourceFilter);
  const visibleResults = filteredResults.slice(0, displayedCount);
  const hasMore = displayedCount < filteredResults.length;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!submittedQuery) return;
    const url = new URL(window.location.href);
    url.searchParams.set("q", submittedQuery);
    window.history.replaceState(null, "", url.toString());
  }, [submittedQuery]);

  // Reset pagination when filter changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally reset on filter change
  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter]);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) return;
      setIsLoading(true);
      setError(null);
      setHasSearched(true);
      setSubmittedQuery(q.trim());
      setDisplayedCount(PAGE_SIZE);
      setShowAiPanel(false);

      const ytKey = getYouTubeApiKeySync();
      const vimeoKey2 = getVimeoApiKeySync();
      const ttKey = getTikTokApiKeySync();

      try {
        const promises: Promise<VideoMetadata[]>[] = [];

        if (ytKey || !vimeoKey2) {
          promises.push(
            searchYouTube(q.trim(), 20, actor)
              .then((data) =>
                data.map((v) => ({ ...v, platform: "youtube" as const })),
              )
              .catch(() => []),
          );
        }

        if (vimeoKey2) {
          promises.push(
            searchVimeo(q.trim(), 12, actor)
              .then((data) =>
                data.map((v) => ({ ...v, platform: "vimeo" as const })),
              )
              .catch(() => []),
          );
        }

        if (ttKey) {
          promises.push(
            searchTikTok(q.trim(), 12, actor)
              .then((data) =>
                data.map((v) => ({ ...v, platform: "tiktok" as const })),
              )
              .catch(() => []),
          );
        }

        if (promises.length === 0) {
          throw new Error(
            "No API keys configured. Add YouTube, Vimeo, or TikTok API key in Admin.",
          );
        }

        const results = await Promise.all(promises);
        const merged: VideoMetadata[] = [];
        const maxLen = Math.max(...results.map((r) => r.length));
        for (let i = 0; i < maxLen; i++) {
          for (const arr of results) {
            if (arr[i]) merged.push(arr[i]);
          }
        }
        setAllResults(merged);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Search failed";
        setError(msg);
        setAllResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [actor],
  );

  const didAutoSearch = useRef(false);
  useEffect(() => {
    if (!didAutoSearch.current && initialQuery) {
      didAutoSearch.current = true;
      doSearch(initialQuery);
    }
  }, [doSearch, initialQuery]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayedCount((c) =>
              Math.min(c + LOAD_MORE_SIZE, filteredResults.length),
            );
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filteredResults.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    doSearch(s);
  };

  const aiSuggestions =
    language === "ar"
      ? getAiSuggestionsAr(aiQuery || query)
      : getAiSuggestions(aiQuery || query);

  return (
    <div
      className="min-h-full bg-background pb-20 md:pb-8"
      dir={isRTL ? "rtl" : "ltr"}
      data-ocid="search.page"
    >
      {/* Sticky search header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border shadow-sm">
        <div className="px-4 py-3 space-y-3">
          {/* Search bar row */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                data-ocid="search.search_input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="ps-10 pe-10 h-10 bg-background border-border focus-visible:ring-primary text-sm"
                autoFocus
                aria-label={t("searchPlaceholder")}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setAllResults([]);
                    setHasSearched(false);
                    setError(null);
                    const url = new URL(window.location.href);
                    url.searchParams.delete("q");
                    window.history.replaceState(null, "", url.toString());
                  }}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              type="submit"
              data-ocid="search.submit_button"
              disabled={!query.trim() || isLoading}
              className="gradient-primary text-white border-0 h-10 px-4 shrink-0"
              aria-label={t("search")}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
            </Button>

            {/* Voice search button */}
            <Button
              type="button"
              variant="outline"
              data-ocid="search.voice_button"
              onClick={handleVoiceSearch}
              className={`h-10 px-3 shrink-0 transition-colors ${
                voiceState === "listening"
                  ? "border-red-500 text-red-500 bg-red-500/10 animate-pulse"
                  : voiceState === "error"
                    ? "border-destructive text-destructive"
                    : ""
              }`}
              aria-label={
                voiceState === "listening"
                  ? t("search.voice.listening")
                  : t("search.voice.start")
              }
              title={
                voiceState === "listening"
                  ? t("search.voice.listening")
                  : t("search.voice.start")
              }
            >
              <Mic className="h-4 w-4" />
            </Button>

            {/* Audio fingerprint search button */}
            <Button
              type="button"
              variant="outline"
              data-ocid="search.audio_button"
              onClick={handleAudioSearch}
              className={`h-10 px-3 shrink-0 transition-colors ${
                audioState === "recording"
                  ? "border-primary text-primary bg-primary/10"
                  : audioState === "identifying"
                    ? "border-amber-500 text-amber-500 bg-amber-500/10"
                    : audioState === "matched"
                      ? "border-green-500 text-green-500 bg-green-500/10"
                      : audioState === "nomatch" || audioState === "error"
                        ? "border-destructive text-destructive"
                        : ""
              }`}
              aria-label={t("search.audio.start")}
              title={t("search.audio.start")}
            >
              {audioState === "recording" ? (
                <span className="relative flex items-center justify-center">
                  <Music2 className="h-4 w-4" />
                  {audioCountdown > 0 && (
                    <span className="absolute -top-2.5 -end-2.5 text-[9px] font-bold leading-none bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                      {audioCountdown}
                    </span>
                  )}
                </span>
              ) : audioState === "identifying" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Music2 className="h-4 w-4" />
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              data-ocid="search.ai_toggle_button"
              onClick={() => setShowAiPanel((v) => !v)}
              className={`h-10 px-3 shrink-0 transition-colors ${showAiPanel ? "border-primary text-primary bg-primary/10" : ""}`}
              aria-label={t("aiAssistant")}
              aria-expanded={showAiPanel}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline ms-1.5 text-xs font-medium">
                AI
              </span>
            </Button>
          </form>

          {/* Voice / Audio status bar */}
          <AnimatePresence>
            {(voiceState !== "idle" ||
              (audioState !== "idle" && audioStatusMsg)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                    voiceState === "listening"
                      ? "bg-red-500/10 border border-red-500/30 text-red-400"
                      : audioState === "recording"
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : audioState === "identifying"
                          ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                          : audioState === "matched"
                            ? "bg-green-500/10 border border-green-500/30 text-green-400"
                            : "bg-destructive/10 border border-destructive/30 text-destructive"
                  }`}
                  data-ocid="search.audio_status"
                >
                  {(voiceState === "listening" ||
                    audioState === "recording" ||
                    audioState === "identifying") && (
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current" />
                    </span>
                  )}
                  <span className="font-medium text-xs">
                    {voiceState === "listening"
                      ? t("search.voice.listening")
                      : voiceState === "error"
                        ? t("search.voice.error")
                        : audioStatusMsg}
                  </span>
                  {audioState === "recording" && audioCountdown > 0 && (
                    <span className="ms-auto text-xs font-bold opacity-80">
                      {audioCountdown}s
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick suggestion chips */}
          <AnimatePresence>
            {!hasSearched && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1.5 overflow-hidden"
              >
                {quickSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-ocid="search.suggestion_button"
                    onClick={() => handleSuggestion(s)}
                    className="text-xs bg-muted hover:bg-primary/20 hover:text-primary text-foreground rounded-full px-3 py-1 transition-colors cursor-pointer border border-transparent hover:border-primary/30"
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Source filter buttons (shown after search) */}
          <AnimatePresence>
            {hasSearched && allResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-1.5 overflow-hidden"
              >
                {(["all", "youtube", "vimeo", "tiktok"] as SourceFilter[]).map(
                  (f) => (
                    <button
                      key={f}
                      type="button"
                      data-ocid={`search.filter.${f}`}
                      onClick={() => setSourceFilter(f)}
                      className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1 transition-colors border font-medium ${
                        sourceFilter === f
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {f === "youtube" && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      )}
                      {f === "vimeo" && (
                        <span className="w-2 h-2 rounded-full bg-[#1ab7ea] shrink-0" />
                      )}
                      {f === "tiktok" && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: "#fe2c55" }}
                        />
                      )}
                      {f === "all"
                        ? isRTL
                          ? "الكل"
                          : "All"
                        : f === "youtube"
                          ? "YouTube"
                          : f === "vimeo"
                            ? "Vimeo"
                            : "TikTok"}
                      <span className="opacity-60">
                        (
                        {f === "all"
                          ? allResults.length
                          : allResults.filter((v) => v.platform === f).length}
                        )
                      </span>
                    </button>
                  ),
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Assistant panel */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-border"
            >
              <div
                data-ocid="search.ai_panel"
                className="px-4 py-4 bg-card/60 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground font-display">
                      {t("aiAssistant")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("searchRefineHint")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiPanel(false)}
                    className="ms-auto text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t("close")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-2 mb-3">
                  <Input
                    data-ocid="search.ai_input"
                    value={aiQuery}
                    onChange={(e) => {
                      setAiQuery(e.target.value);
                      setAiTyped(true);
                    }}
                    placeholder={t("aiPlaceholder")}
                    className="text-sm bg-background border-border h-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && aiQuery.trim()) {
                        setQuery(aiQuery);
                        doSearch(aiQuery);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    data-ocid="search.ai_refine_button"
                    onClick={() => {
                      const q = aiQuery.trim() || query;
                      if (q) {
                        setQuery(q);
                        doSearch(q);
                      }
                    }}
                    className="gradient-primary text-white border-0 h-9 shrink-0"
                  >
                    {t("refineSearch")}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("suggestions")}
                    </p>
                  </div>
                  <div
                    className="flex flex-wrap gap-1.5"
                    data-ocid="search.ai_suggestions_list"
                  >
                    <AnimatePresence mode="popLayout">
                      {aiSuggestions.map((s, i) => (
                        <motion.div
                          key={`${s}-${aiTyped}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-xs py-1 px-2.5 border border-transparent hover:border-primary/30"
                            onClick={() => {
                              setQuery(s);
                              doSearch(s);
                            }}
                            data-ocid={`search.ai_suggestion.${i + 1}`}
                          >
                            {s}
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main content */}
      <div className="flex">
        <div className="flex-1 min-w-0 px-4 pt-4 pb-8">
          {/* No API key banner */}
          {!hasApiKey && !hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="search.no_api_key_banner"
              className="mb-5 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3.5"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary mb-0.5">
                    {isRTL
                      ? "مفاتيح API غير مضبوطة"
                      : "API Keys not configured"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRTL
                      ? "أضف مفتاح YouTube أو Vimeo أو TikTok API في لوحة الإدارة لتفعيل البحث."
                      : "Add your YouTube, Vimeo, or TikTok API key in the Admin panel to enable search."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {isLoading && <GridSkeleton count={6} />}

          <AnimatePresence>
            {error && !isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                data-ocid="search.error_state"
                className="flex flex-col items-center justify-center py-16 gap-4 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <SearchIcon
                    className="h-8 w-8 text-destructive/60"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">
                    {isRTL ? "فشل البحث" : "Search failed"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    {error}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="search.retry_button"
                  onClick={() => doSearch(query)}
                >
                  {t("retry")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading &&
            hasSearched &&
            filteredResults.length === 0 &&
            !error && (
              <EmptyState
                data-ocid="search.empty_state"
                icon={SearchIcon}
                title={t("noResults")}
                description={t("noResultsHint")}
                action={{
                  label: isRTL ? "بحث جديد" : "New search",
                  onClick: () => {
                    setQuery("");
                    setHasSearched(false);
                    setAllResults([]);
                    setError(null);
                  },
                  "data-ocid": "search.new_search_button",
                }}
              />
            )}

          {!isLoading && visibleResults.length > 0 && (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04 } },
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-semibold text-sm text-foreground">
                    {t("searchResults")}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="text-xs h-5 px-1.5"
                    data-ocid="search.results_count"
                  >
                    {filteredResults.length}
                  </Badge>
                </div>
                {submittedQuery && (
                  <p className="text-xs text-muted-foreground truncate ms-4 max-w-[160px]">
                    {isRTL ? "عن:" : "for:"}{" "}
                    <span className="text-primary font-medium">
                      {submittedQuery}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 2xl:gap-4">
                {visibleResults.map((video, i) => (
                  <motion.div
                    key={`${video.platform}-${video.videoId}`}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      show: { opacity: 1, y: 0 },
                    }}
                    data-ocid={`search.result.${i + 1}`}
                  >
                    <VideoCard
                      video={video}
                      onWatch={(
                        v:
                          | import("../types").VideoMetadata
                          | import("../types").UnifiedVideo,
                      ) =>
                        setActiveVideo(v as import("../types").VideoMetadata)
                      }
                      onShare={(
                        v:
                          | import("../types").VideoMetadata
                          | import("../types").UnifiedVideo,
                      ) => setShareVideo(v as import("../types").VideoMetadata)}
                      onComment={(
                        v:
                          | import("../types").VideoMetadata
                          | import("../types").UnifiedVideo,
                      ) =>
                        setActiveVideo(v as import("../types").VideoMetadata)
                      }
                      index={i}
                    />
                  </motion.div>
                ))}
              </div>

              <div ref={loadMoreRef} className="mt-6">
                {isLoadingMore && (
                  <div
                    className="flex justify-center py-4"
                    data-ocid="search.loading_more_state"
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                {hasMore && !isLoadingMore && (
                  <div className="flex justify-center mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      data-ocid="search.load_more_button"
                      onClick={() =>
                        setDisplayedCount((c) =>
                          Math.min(c + LOAD_MORE_SIZE, filteredResults.length),
                        )
                      }
                      className="gap-2 text-sm"
                    >
                      <ChevronDown className="h-4 w-4" />
                      {isRTL
                        ? `تحميل المزيد (${filteredResults.length - displayedCount})`
                        : `Load more (${filteredResults.length - displayedCount})`}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* AI Sidebar (desktop) */}
        <AnimatePresence>
          {(hasSearched || query.length > 0) && (
            <motion.aside
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
              transition={{ duration: 0.3 }}
              className="hidden xl:flex flex-col w-72 shrink-0 border-s border-border bg-card/50 sticky top-[113px] h-[calc(100vh-113px)] overflow-hidden"
              data-ocid="search.ai_sidebar"
              aria-label={t("aiAssistant")}
            >
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground font-display">
                        {t("aiAssistant")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("searchRefineHint")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={aiQuery}
                      onChange={(e) => {
                        setAiQuery(e.target.value);
                        setAiTyped(true);
                      }}
                      placeholder={t("aiPlaceholder")}
                      className="text-sm bg-background border-border h-9"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && aiQuery.trim()) {
                          setQuery(aiQuery);
                          doSearch(aiQuery);
                        }
                      }}
                      data-ocid="search.ai_sidebar_input"
                    />
                    <Button
                      type="button"
                      size="sm"
                      data-ocid="search.ai_sidebar_refine_button"
                      onClick={() => {
                        const q = aiQuery.trim() || query;
                        if (q) {
                          setQuery(q);
                          doSearch(q);
                        }
                      }}
                      className="w-full gradient-primary text-white border-0 h-9"
                    >
                      <Sparkles className="h-3.5 w-3.5 me-1.5" />
                      {t("refineSearch")}
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("suggestions")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <AnimatePresence mode="popLayout">
                        {aiSuggestions.map((s, i) => (
                          <motion.button
                            key={`sidebar-${s}-${aiTyped}`}
                            type="button"
                            initial={{ opacity: 0, x: isRTL ? 8 : -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            onClick={() => {
                              setQuery(s);
                              doSearch(s);
                            }}
                            data-ocid={`search.ai_sidebar_suggestion.${i + 1}`}
                            className="text-start text-sm text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors border border-transparent hover:border-primary/20 leading-snug"
                          >
                            <span className="text-primary me-1.5 font-semibold text-xs">
                              →
                            </span>
                            {s}
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {!hasSearched && (
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {isRTL ? "بحث سريع" : "Quick picks"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {quickSuggestions.slice(0, 5).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSuggestion(s)}
                            data-ocid="search.sidebar_quick_pick"
                            className="text-xs bg-muted hover:bg-primary/20 hover:text-primary text-foreground rounded-full px-2.5 py-1 transition-colors cursor-pointer"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <VideoPlayer
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        onShare={() => {
          if (activeVideo) setShareVideo(activeVideo);
        }}
      />

      <ShareModal video={shareVideo} onClose={() => setShareVideo(null)} />
    </div>
  );
}
