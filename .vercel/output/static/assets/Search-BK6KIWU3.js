import { c as createLucideIcon, u as useTranslation, b as useActor, r as reactExports, i as getYouTubeApiKeySync, k as getVimeoApiKeySync, l as getTikTokApiKeySync, s as searchYouTube, n as searchVimeo, o as searchTikTok, j as jsxRuntimeExports, S as Search$1, X, B as Button, G as GridSkeleton } from "./index-B4P1PGaK.js";
import { B as Badge } from "./badge-B5FJUKjx.js";
import { I as Input } from "./input-DsF85mHK.js";
import { S as ScrollArea, V as VideoPlayer } from "./VideoPlayer-vt5cHaXc.js";
import { E as EmptyState } from "./EmptyState-_pyOxBUW.js";
import { V as VideoCard, S as ShareModal } from "./VideoCard-KugQnyPn.js";
import { L as LoaderCircle } from "./loader-circle-CD345DHk.js";
import { M as Mic } from "./mic-DdoyH1xa.js";
import { S as Sparkles } from "./sparkles-0JpH7AaU.js";
import { A as AnimatePresence } from "./index-B_vGwaJy.js";
import { m as motion } from "./proxy-qgqE2Kvk.js";
import { T as TrendingUp } from "./trending-up-C7qWBfVa.js";
import { C as ChevronDown } from "./index-BivI3RN0.js";
import "./index-KgqyCsxg.js";
import "./skeleton-BQhv6M21.js";
import "./textarea-BcmhiIIK.js";
import "./dialog-BTdr-nPe.js";
import "./index-C1nCKn3U.js";
import "./offlineStorage-B7iGHUae.js";
import "./circle-alert-umy4a3lv.js";
import "./film-CmhOy8TL.js";
import "./wifi-off-Dh_rJnac.js";
import "./external-link-CIWNqrEm.js";
import "./message-circle-BL4BDtUO.js";
import "./bookmark-plus-DCBfQUwu.js";
import "./upload-DDDpJKii.js";
import "./trash-2-QrZqrw48.js";
import "./check-C3_r_4Ww.js";
import "./mail-Cyv_7LGF.js";
import "./play-BCFueK3b.js";
import "./eye-DnC41Urw.js";
import "./plus-jmEHeo4F.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M12 8V4H8", key: "hb8ula" }],
  ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
  ["path", { d: "M2 14h2", key: "vft8re" }],
  ["path", { d: "M20 14h2", key: "4cs60a" }],
  ["path", { d: "M15 13v2", key: "1xurst" }],
  ["path", { d: "M9 13v2", key: "rq6x2g" }]
];
const Bot = createLucideIcon("bot", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "8", cy: "18", r: "4", key: "1fc0mg" }],
  ["path", { d: "M12 18V2l7 4", key: "g04rme" }]
];
const Music2 = createLucideIcon("music-2", __iconNode);
const AI_PATTERNS_EN = [
  {
    keys: ["movie", "film", "cinema", "أفلام", "فيلم"],
    suggestions: [
      "Top action movies 2025",
      "Award-winning drama films",
      "Best Arabic movies",
      "Hollywood blockbusters 2024"
    ]
  },
  {
    keys: ["music", "song", "موسيقى", "أغاني", "أغنية"],
    suggestions: [
      "Arabic pop hits 2025",
      "Top music videos this month",
      "Relaxing study music",
      "Best music releases 2024"
    ]
  },
  {
    keys: ["game", "gaming", "play", "ألعاب", "لعبة"],
    suggestions: [
      "Gaming highlights compilation",
      "Top 10 games 2025",
      "Minecraft survival guide",
      "Best game reviews"
    ]
  },
  {
    keys: ["tech", "technology", "review", "تقنية", "تقنيات", "مراجعة"],
    suggestions: [
      "Best smartphones 2025",
      "AI tools explained",
      "Laptop buying guide",
      "Latest tech news"
    ]
  },
  {
    keys: ["cook", "recipe", "food", "طبخ", "وصفة", "أكل"],
    suggestions: [
      "Authentic Arabic recipes",
      "Quick dinner ideas",
      "Healthy meal prep",
      "Dessert recipes easy"
    ]
  },
  {
    keys: ["learn", "tutorial", "course", "تعلم", "شرح", "دورة"],
    suggestions: [
      "Learn Python for beginners",
      "English speaking practice",
      "Drawing tutorial easy",
      "Arabic learning guide"
    ]
  }
];
const QUICK_SUGGESTIONS_EN = [
  "Top movies 2025",
  "Arabic music hits",
  "Tech reviews",
  "Cooking tutorials",
  "Gaming highlights",
  "Travel vlogs",
  "Documentary films"
];
const QUICK_SUGGESTIONS_AR = [
  "أفضل أفلام 2025",
  "موسيقى عربية",
  "مراجعات تقنية",
  "وصفات طبخ",
  "ألعاب فيديو",
  "رحلات سفر",
  "وثائقيات"
];
const PAGE_SIZE = 12;
const LOAD_MORE_SIZE = 8;
function getAiSuggestions(query) {
  const lower = query.toLowerCase();
  for (const { keys, suggestions } of AI_PATTERNS_EN) {
    if (keys.some((k) => lower.includes(k))) return suggestions;
  }
  if (query.length > 2) {
    return [
      `${query} tutorial`,
      `${query} 2025`,
      `Best ${query} videos`,
      `${query} beginners guide`
    ];
  }
  return [
    "Top trending 2025",
    "Most watched this week",
    "Best Arabic content",
    "Popular documentaries"
  ];
}
function getAiSuggestionsAr(query) {
  if (query.length > 1) {
    return [
      `${query} للمبتدئين`,
      `أفضل ${query} 2025`,
      `${query} شرح كامل`,
      `${query} تعليمي`
    ];
  }
  return [
    "الأكثر مشاهدة هذا الأسبوع",
    "أفلام عربية مميزة",
    "موسيقى هادئة للدراسة",
    "وثائقيات مثيرة"
  ];
}
function Search() {
  const { t, isRTL, language } = useTranslation();
  const { actor } = useActor();
  const initialQuery = new URLSearchParams(window.location.search).get("q") ?? "";
  const [query, setQuery] = reactExports.useState(initialQuery);
  const [aiQuery, setAiQuery] = reactExports.useState("");
  const [submittedQuery, setSubmittedQuery] = reactExports.useState("");
  const [allResults, setAllResults] = reactExports.useState([]);
  const [displayedCount, setDisplayedCount] = reactExports.useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isLoadingMore, setIsLoadingMore] = reactExports.useState(false);
  const [hasSearched, setHasSearched] = reactExports.useState(false);
  const [activeVideo, setActiveVideo] = reactExports.useState(null);
  const [shareVideo, setShareVideo] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [showAiPanel, setShowAiPanel] = reactExports.useState(false);
  const [aiTyped, setAiTyped] = reactExports.useState(false);
  const [sourceFilter, setSourceFilter] = reactExports.useState("all");
  const [voiceState, setVoiceState] = reactExports.useState(
    "idle"
  );
  const recognitionRef = reactExports.useRef(null);
  const [audioState, setAudioState] = reactExports.useState("idle");
  const [audioCountdown, setAudioCountdown] = reactExports.useState(0);
  const [audioStatusMsg, setAudioStatusMsg] = reactExports.useState("");
  const mediaRecorderRef = reactExports.useRef(null);
  const audioChunksRef = reactExports.useRef([]);
  const countdownTimerRef = reactExports.useRef(null);
  const handleVoiceSearch = () => {
    const win = window;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
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
      var _a, _b;
      const transcript = ((_b = (_a = event.results[0]) == null ? void 0 : _a[0]) == null ? void 0 : _b.transcript) ?? "";
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
      setVoiceState((s) => s === "listening" ? "idle" : s);
    };
    recognition.start();
  };
  const handleAudioSearch = async () => {
    var _a, _b;
    if (audioState !== "idle") {
      (_a = mediaRecorderRef.current) == null ? void 0 : _a.stop();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setAudioState("idle");
      setAudioCountdown(0);
      return;
    }
    if (!((_b = navigator.mediaDevices) == null ? void 0 : _b.getUserMedia)) {
      setAudioState("error");
      setAudioStatusMsg(t("search.audio.unsupported"));
      setTimeout(() => setAudioState("idle"), 3e3);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg"
      });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        var _a2;
        for (const trk of stream.getTracks()) trk.stop();
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        setAudioCountdown(0);
        setAudioState("identifying");
        setAudioStatusMsg(t("search.audio.identifying"));
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType
        });
        try {
          const fd = new FormData();
          fd.append("file", blob, "audio.webm");
          fd.append("return", "spotify,apple_music,deezer");
          const res = await fetch("https://api.audd.io/", {
            method: "POST",
            body: fd
          });
          const json = await res.json();
          if (json.status === "success" && ((_a2 = json.result) == null ? void 0 : _a2.title)) {
            const searchQ = `${json.result.artist ? `${json.result.artist} ` : ""}${json.result.title}`;
            setAudioStatusMsg(t("search.audio.matched") + searchQ);
            setAudioState("matched");
            setQuery(searchQ);
            doSearch(searchQ);
            setTimeout(() => {
              setAudioState("idle");
              setAudioStatusMsg("");
            }, 3e3);
          } else {
            setAudioState("nomatch");
            setAudioStatusMsg(t("search.audio.noMatch"));
            setTimeout(() => {
              setAudioState("idle");
              setAudioStatusMsg("");
            }, 3e3);
          }
        } catch {
          setAudioState("error");
          setAudioStatusMsg(t("search.audio.error"));
          setTimeout(() => {
            setAudioState("idle");
            setAudioStatusMsg("");
          }, 3e3);
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
          clearInterval(countdownTimerRef.current);
          recorder.stop();
        }
      }, 1e3);
    } catch {
      setAudioState("error");
      setAudioStatusMsg(t("search.audio.error"));
      setTimeout(() => {
        setAudioState("idle");
        setAudioStatusMsg("");
      }, 3e3);
    }
  };
  const hasYouTubeKey = !!getYouTubeApiKeySync();
  const hasVimeoKey = !!getVimeoApiKeySync();
  const hasTikTokKey = !!getTikTokApiKeySync();
  const hasApiKey = hasYouTubeKey || hasVimeoKey || hasTikTokKey;
  const quickSuggestions = language === "ar" ? QUICK_SUGGESTIONS_AR : QUICK_SUGGESTIONS_EN;
  const filteredResults = sourceFilter === "all" ? allResults : allResults.filter((v) => v.platform === sourceFilter);
  const visibleResults = filteredResults.slice(0, displayedCount);
  const hasMore = displayedCount < filteredResults.length;
  const loadMoreRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!submittedQuery) return;
    const url = new URL(window.location.href);
    url.searchParams.set("q", submittedQuery);
    window.history.replaceState(null, "", url.toString());
  }, [submittedQuery]);
  reactExports.useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
  }, [sourceFilter]);
  const doSearch = reactExports.useCallback(
    async (q) => {
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
        const promises = [];
        if (ytKey || !vimeoKey2) {
          promises.push(
            searchYouTube(q.trim(), 20, actor).then(
              (data) => data.map((v) => ({ ...v, platform: "youtube" }))
            ).catch(() => [])
          );
        }
        if (vimeoKey2) {
          promises.push(
            searchVimeo(q.trim(), 12, actor).then(
              (data) => data.map((v) => ({ ...v, platform: "vimeo" }))
            ).catch(() => [])
          );
        }
        if (ttKey) {
          promises.push(
            searchTikTok(q.trim(), 12, actor).then(
              (data) => data.map((v) => ({ ...v, platform: "tiktok" }))
            ).catch(() => [])
          );
        }
        if (promises.length === 0) {
          throw new Error(
            "No API keys configured. Add YouTube, Vimeo, or TikTok API key in Admin."
          );
        }
        const results = await Promise.all(promises);
        const merged = [];
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
    [actor]
  );
  const didAutoSearch = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!didAutoSearch.current && initialQuery) {
      didAutoSearch.current = true;
      doSearch(initialQuery);
    }
  }, [doSearch, initialQuery]);
  reactExports.useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        var _a;
        if (((_a = entries[0]) == null ? void 0 : _a.isIntersecting) && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayedCount(
              (c) => Math.min(c + LOAD_MORE_SIZE, filteredResults.length)
            );
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filteredResults.length]);
  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(query);
  };
  const handleSuggestion = (s) => {
    setQuery(s);
    doSearch(s);
  };
  const aiSuggestions = language === "ar" ? getAiSuggestionsAr(aiQuery || query) : getAiSuggestions(aiQuery || query);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-full bg-background pb-20 md:pb-8",
      dir: isRTL ? "rtl" : "ltr",
      "data-ocid": "search.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-20 bg-card border-b border-border shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex gap-2 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search$1, { className: "absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    "data-ocid": "search.search_input",
                    type: "search",
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    placeholder: t("searchPlaceholder"),
                    className: "ps-10 pe-10 h-10 bg-background border-border focus-visible:ring-primary text-sm",
                    autoFocus: true,
                    "aria-label": t("searchPlaceholder")
                  }
                ),
                query && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setQuery("");
                      setAllResults([]);
                      setHasSearched(false);
                      setError(null);
                      const url = new URL(window.location.href);
                      url.searchParams.delete("q");
                      window.history.replaceState(null, "", url.toString());
                    },
                    className: "absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                    "aria-label": "Clear search",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  "data-ocid": "search.submit_button",
                  disabled: !query.trim() || isLoading,
                  className: "gradient-primary text-white border-0 h-10 px-4 shrink-0",
                  "aria-label": t("search"),
                  children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Search$1, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  "data-ocid": "search.voice_button",
                  onClick: handleVoiceSearch,
                  className: `h-10 px-3 shrink-0 transition-colors ${voiceState === "listening" ? "border-red-500 text-red-500 bg-red-500/10 animate-pulse" : voiceState === "error" ? "border-destructive text-destructive" : ""}`,
                  "aria-label": voiceState === "listening" ? t("search.voice.listening") : t("search.voice.start"),
                  title: voiceState === "listening" ? t("search.voice.listening") : t("search.voice.start"),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  "data-ocid": "search.audio_button",
                  onClick: handleAudioSearch,
                  className: `h-10 px-3 shrink-0 transition-colors ${audioState === "recording" ? "border-primary text-primary bg-primary/10" : audioState === "identifying" ? "border-amber-500 text-amber-500 bg-amber-500/10" : audioState === "matched" ? "border-green-500 text-green-500 bg-green-500/10" : audioState === "nomatch" || audioState === "error" ? "border-destructive text-destructive" : ""}`,
                  "aria-label": t("search.audio.start"),
                  title: t("search.audio.start"),
                  children: audioState === "recording" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex items-center justify-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Music2, { className: "h-4 w-4" }),
                    audioCountdown > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-2.5 -end-2.5 text-[9px] font-bold leading-none bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center", children: audioCountdown })
                  ] }) : audioState === "identifying" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music2, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  "data-ocid": "search.ai_toggle_button",
                  onClick: () => setShowAiPanel((v) => !v),
                  className: `h-10 px-3 shrink-0 transition-colors ${showAiPanel ? "border-primary text-primary bg-primary/10" : ""}`,
                  "aria-label": t("aiAssistant"),
                  "aria-expanded": showAiPanel,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline ms-1.5 text-xs font-medium", children: "AI" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: (voiceState !== "idle" || audioState !== "idle" && audioStatusMsg) && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, height: 0 },
                animate: { opacity: 1, height: "auto" },
                exit: { opacity: 0, height: 0 },
                className: "overflow-hidden",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${voiceState === "listening" ? "bg-red-500/10 border border-red-500/30 text-red-400" : audioState === "recording" ? "bg-primary/10 border border-primary/30 text-primary" : audioState === "identifying" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" : audioState === "matched" ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-destructive/10 border border-destructive/30 text-destructive"}`,
                    "data-ocid": "search.audio_status",
                    children: [
                      (voiceState === "listening" || audioState === "recording" || audioState === "identifying") && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2.5 w-2.5 shrink-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-current" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-xs", children: voiceState === "listening" ? t("search.voice.listening") : voiceState === "error" ? t("search.voice.error") : audioStatusMsg }),
                      audioState === "recording" && audioCountdown > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ms-auto text-xs font-bold opacity-80", children: [
                        audioCountdown,
                        "s"
                      ] })
                    ]
                  }
                )
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: !hasSearched && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, height: 0 },
                animate: { opacity: 1, height: "auto" },
                exit: { opacity: 0, height: 0 },
                className: "flex flex-wrap gap-1.5 overflow-hidden",
                children: quickSuggestions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": "search.suggestion_button",
                    onClick: () => handleSuggestion(s),
                    className: "text-xs bg-muted hover:bg-primary/20 hover:text-primary text-foreground rounded-full px-3 py-1 transition-colors cursor-pointer border border-transparent hover:border-primary/30",
                    children: s
                  },
                  s
                ))
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: hasSearched && allResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, height: 0 },
                animate: { opacity: 1, height: "auto" },
                exit: { opacity: 0, height: 0 },
                className: "flex gap-1.5 overflow-hidden",
                children: ["all", "youtube", "vimeo", "tiktok"].map(
                  (f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      "data-ocid": `search.filter.${f}`,
                      onClick: () => setSourceFilter(f),
                      className: `flex items-center gap-1.5 text-xs rounded-full px-3 py-1 transition-colors border font-medium ${sourceFilter === f ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`,
                      children: [
                        f === "youtube" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-red-500 shrink-0" }),
                        f === "vimeo" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-[#1ab7ea] shrink-0" }),
                        f === "tiktok" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "w-2 h-2 rounded-full shrink-0",
                            style: { background: "#fe2c55" }
                          }
                        ),
                        f === "all" ? isRTL ? "الكل" : "All" : f === "youtube" ? "YouTube" : f === "vimeo" ? "Vimeo" : "TikTok",
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-60", children: [
                          "(",
                          f === "all" ? allResults.length : allResults.filter((v) => v.platform === f).length,
                          ")"
                        ] })
                      ]
                    },
                    f
                  )
                )
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showAiPanel && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { height: 0, opacity: 0 },
              animate: { height: "auto", opacity: 1 },
              exit: { height: 0, opacity: 0 },
              transition: { duration: 0.25, ease: "easeInOut" },
              className: "overflow-hidden border-t border-border",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": "search.ai_panel",
                  className: "px-4 py-4 bg-card/60 backdrop-blur-sm",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full gradient-accent flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4 text-white" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground font-display", children: t("aiAssistant") }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("searchRefineHint") })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setShowAiPanel(false),
                          className: "ms-auto text-muted-foreground hover:text-foreground transition-colors",
                          "aria-label": t("close"),
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "search.ai_input",
                          value: aiQuery,
                          onChange: (e) => {
                            setAiQuery(e.target.value);
                            setAiTyped(true);
                          },
                          placeholder: t("aiPlaceholder"),
                          className: "text-sm bg-background border-border h-9",
                          onKeyDown: (e) => {
                            if (e.key === "Enter" && aiQuery.trim()) {
                              setQuery(aiQuery);
                              doSearch(aiQuery);
                            }
                          }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          type: "button",
                          size: "sm",
                          "data-ocid": "search.ai_refine_button",
                          onClick: () => {
                            const q = aiQuery.trim() || query;
                            if (q) {
                              setQuery(q);
                              doSearch(q);
                            }
                          },
                          className: "gradient-primary text-white border-0 h-9 shrink-0",
                          children: t("refineSearch")
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3 text-primary" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: t("suggestions") })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "flex flex-wrap gap-1.5",
                          "data-ocid": "search.ai_suggestions_list",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "popLayout", children: aiSuggestions.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                            motion.div,
                            {
                              initial: { opacity: 0, scale: 0.9 },
                              animate: { opacity: 1, scale: 1 },
                              transition: { delay: i * 0.05 },
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                Badge,
                                {
                                  variant: "secondary",
                                  className: "cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors text-xs py-1 px-2.5 border border-transparent hover:border-primary/30",
                                  onClick: () => {
                                    setQuery(s);
                                    doSearch(s);
                                  },
                                  "data-ocid": `search.ai_suggestion.${i + 1}`,
                                  children: s
                                }
                              )
                            },
                            `${s}-${aiTyped}`
                          )) })
                        }
                      )
                    ] })
                  ]
                }
              )
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 px-4 pt-4 pb-8", children: [
            !hasApiKey && !hasSearched && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, y: -8 },
                animate: { opacity: 1, y: 0 },
                "data-ocid": "search.no_api_key_banner",
                className: "mb-5 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3.5",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-white" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-primary mb-0.5", children: isRTL ? "مفاتيح API غير مضبوطة" : "API Keys not configured" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: isRTL ? "أضف مفتاح YouTube أو Vimeo أو TikTok API في لوحة الإدارة لتفعيل البحث." : "Add your YouTube, Vimeo, or TikTok API key in the Admin panel to enable search." })
                  ] })
                ] })
              }
            ),
            isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(GridSkeleton, { count: 6 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: error && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.97 },
                animate: { opacity: 1, scale: 1 },
                "data-ocid": "search.error_state",
                className: "flex flex-col items-center justify-center py-16 gap-4 text-center",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Search$1,
                    {
                      className: "h-8 w-8 text-destructive/60",
                      strokeWidth: 1.5
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-semibold text-foreground", children: isRTL ? "فشل البحث" : "Search failed" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-xs", children: error })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      size: "sm",
                      "data-ocid": "search.retry_button",
                      onClick: () => doSearch(query),
                      children: t("retry")
                    }
                  )
                ]
              }
            ) }),
            !isLoading && hasSearched && filteredResults.length === 0 && !error && /* @__PURE__ */ jsxRuntimeExports.jsx(
              EmptyState,
              {
                "data-ocid": "search.empty_state",
                icon: Search$1,
                title: t("noResults"),
                description: t("noResultsHint"),
                action: {
                  label: isRTL ? "بحث جديد" : "New search",
                  onClick: () => {
                    setQuery("");
                    setHasSearched(false);
                    setAllResults([]);
                    setError(null);
                  },
                  "data-ocid": "search.new_search_button"
                }
              }
            ),
            !isLoading && visibleResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: "hidden",
                animate: "show",
                variants: {
                  hidden: {},
                  show: { transition: { staggerChildren: 0.04 } }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-sm text-foreground", children: t("searchResults") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Badge,
                        {
                          variant: "secondary",
                          className: "text-xs h-5 px-1.5",
                          "data-ocid": "search.results_count",
                          children: filteredResults.length
                        }
                      )
                    ] }),
                    submittedQuery && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground truncate ms-4 max-w-[160px]", children: [
                      isRTL ? "عن:" : "for:",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-medium", children: submittedQuery })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 2xl:gap-4", children: visibleResults.map((video, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      variants: {
                        hidden: { opacity: 0, y: 14 },
                        show: { opacity: 1, y: 0 }
                      },
                      "data-ocid": `search.result.${i + 1}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        VideoCard,
                        {
                          video,
                          onWatch: (v) => setActiveVideo(v),
                          onShare: (v) => setShareVideo(v),
                          onComment: (v) => setActiveVideo(v),
                          index: i
                        }
                      )
                    },
                    `${video.platform}-${video.videoId}`
                  )) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: loadMoreRef, className: "mt-6", children: [
                    isLoadingMore && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "flex justify-center py-4",
                        "data-ocid": "search.loading_more_state",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" })
                      }
                    ),
                    hasMore && !isLoadingMore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        variant: "outline",
                        size: "sm",
                        "data-ocid": "search.load_more_button",
                        onClick: () => setDisplayedCount(
                          (c) => Math.min(c + LOAD_MORE_SIZE, filteredResults.length)
                        ),
                        className: "gap-2 text-sm",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }),
                          isRTL ? `تحميل المزيد (${filteredResults.length - displayedCount})` : `Load more (${filteredResults.length - displayedCount})`
                        ]
                      }
                    ) })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: (hasSearched || query.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.aside,
            {
              initial: { opacity: 0, x: isRTL ? -20 : 20 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: isRTL ? -20 : 20 },
              transition: { duration: 0.3 },
              className: "hidden xl:flex flex-col w-72 shrink-0 border-s border-border bg-card/50 sticky top-[113px] h-[calc(100vh-113px)] overflow-hidden",
              "data-ocid": "search.ai_sidebar",
              "aria-label": t("aiAssistant"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl gradient-accent flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4 text-white" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground font-display", children: t("aiAssistant") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("searchRefineHint") })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: aiQuery,
                      onChange: (e) => {
                        setAiQuery(e.target.value);
                        setAiTyped(true);
                      },
                      placeholder: t("aiPlaceholder"),
                      className: "text-sm bg-background border-border h-9",
                      onKeyDown: (e) => {
                        if (e.key === "Enter" && aiQuery.trim()) {
                          setQuery(aiQuery);
                          doSearch(aiQuery);
                        }
                      },
                      "data-ocid": "search.ai_sidebar_input"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      size: "sm",
                      "data-ocid": "search.ai_sidebar_refine_button",
                      onClick: () => {
                        const q = aiQuery.trim() || query;
                        if (q) {
                          setQuery(q);
                          doSearch(q);
                        }
                      },
                      className: "w-full gradient-primary text-white border-0 h-9",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 me-1.5" }),
                        t("refineSearch")
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5 text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: t("suggestions") })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "popLayout", children: aiSuggestions.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.button,
                    {
                      type: "button",
                      initial: { opacity: 0, x: isRTL ? 8 : -8 },
                      animate: { opacity: 1, x: 0 },
                      transition: { delay: i * 0.06 },
                      onClick: () => {
                        setQuery(s);
                        doSearch(s);
                      },
                      "data-ocid": `search.ai_sidebar_suggestion.${i + 1}`,
                      className: "text-start text-sm text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors border border-transparent hover:border-primary/20 leading-snug",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary me-1.5 font-semibold text-xs", children: "→" }),
                        s
                      ]
                    },
                    `sidebar-${s}-${aiTyped}`
                  )) }) })
                ] }),
                !hasSearched && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: isRTL ? "بحث سريع" : "Quick picks" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: quickSuggestions.slice(0, 5).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleSuggestion(s),
                      "data-ocid": "search.sidebar_quick_pick",
                      className: "text-xs bg-muted hover:bg-primary/20 hover:text-primary text-foreground rounded-full px-2.5 py-1 transition-colors cursor-pointer",
                      children: s
                    },
                    s
                  )) })
                ] })
              ] }) })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          VideoPlayer,
          {
            video: activeVideo,
            onClose: () => setActiveVideo(null),
            onShare: () => {
              if (activeVideo) setShareVideo(activeVideo);
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShareModal, { video: shareVideo, onClose: () => setShareVideo(null) })
      ]
    }
  );
}
export {
  Search as default
};
