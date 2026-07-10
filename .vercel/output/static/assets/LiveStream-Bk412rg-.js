import { c as createLucideIcon, u as useTranslation, r as reactExports, j as jsxRuntimeExports, aw as Radio, B as Button, v as ue } from "./index-B4P1PGaK.js";
import { B as Badge } from "./badge-B5FJUKjx.js";
import { E as Eye } from "./eye-DnC41Urw.js";
import { C as CircleAlert } from "./circle-alert-umy4a3lv.js";
import { C as Camera } from "./camera-2KGI6336.js";
import { M as Mic } from "./mic-DdoyH1xa.js";
import { W as Wifi } from "./wifi-luZYvcNG.js";
import { U as Users } from "./users-DyqbZ55O.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["line", { x1: "2", x2: "22", y1: "2", y2: "22", key: "a6p6uj" }],
  ["path", { d: "M7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16", key: "qmtpty" }],
  ["path", { d: "M9.5 4h5L17 7h3a2 2 0 0 1 2 2v7.5", key: "1ufyfc" }],
  ["path", { d: "M14.121 15.121A3 3 0 1 1 9.88 10.88", key: "11zox6" }]
];
const CameraOff = createLucideIcon("camera-off", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["line", { x1: "2", x2: "22", y1: "2", y2: "22", key: "a6p6uj" }],
  ["path", { d: "M18.89 13.23A7.12 7.12 0 0 0 19 12v-2", key: "80xlxr" }],
  ["path", { d: "M5 10v2a7 7 0 0 0 12 5", key: "p2k8kg" }],
  ["path", { d: "M15 9.34V5a3 3 0 0 0-5.68-1.33", key: "1gzdoj" }],
  ["path", { d: "M9 9v3a3 3 0 0 0 5.12 2.12", key: "r2i35w" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }]
];
const MicOff = createLucideIcon("mic-off", __iconNode);
const FAKE_STREAMS = [
  {
    id: "live_1",
    streamer: "Ahmed_Creator",
    title: "بث مباشر: موسيقى حية من القاهرة",
    viewers: 1243,
    category: "موسيقى",
    gradient: "from-violet-600 to-purple-900",
    avatar: "🎵",
    live: true
  },
  {
    id: "live_2",
    streamer: "Sara_Tech",
    title: "تعلم البرمجة مع React — مستوى مبتدئ",
    viewers: 876,
    category: "تقنية",
    gradient: "from-cyan-600 to-blue-900",
    avatar: "💻",
    live: true
  },
  {
    id: "live_3",
    streamer: "Omar_Games",
    title: "FIFA 25 — كأس العالم الافتراضي",
    viewers: 3102,
    category: "ألعاب",
    gradient: "from-emerald-600 to-green-900",
    avatar: "🎮",
    live: true
  },
  {
    id: "live_4",
    streamer: "Lina_Art",
    title: "رسم تجريدي مباشر — جلسة إبداعية",
    viewers: 521,
    category: "فن",
    gradient: "from-rose-600 to-pink-900",
    avatar: "🎨",
    live: true
  },
  {
    id: "live_5",
    streamer: "Khaled_Fitness",
    title: "تمارين الصباح — كارديو مع خالد",
    viewers: 1890,
    category: "رياضة",
    gradient: "from-amber-600 to-orange-900",
    avatar: "💪",
    live: true
  },
  {
    id: "live_6",
    streamer: "Noura_Cooking",
    title: "طبخ شرقي أصيل — حلقة عيد",
    viewers: 2310,
    category: "طبخ",
    gradient: "from-red-600 to-rose-900",
    avatar: "🍳",
    live: true
  }
];
function LiveStream() {
  const { isRTL } = useTranslation();
  const videoRef = reactExports.useRef(null);
  const mediaStreamRef = reactExports.useRef(null);
  const recorderRef = reactExports.useRef(null);
  const [isLive, setIsLive] = reactExports.useState(false);
  const [cameraEnabled, setCameraEnabled] = reactExports.useState(false);
  const [micEnabled, setMicEnabled] = reactExports.useState(true);
  const [isCameraLoading, setIsCameraLoading] = reactExports.useState(false);
  const [cameraError, setCameraError] = reactExports.useState(null);
  const [broadcastTitle, setBroadcastTitle] = reactExports.useState("");
  const [viewerCount, setViewerCount] = reactExports.useState(0);
  const [elapsedSeconds, setElapsedSeconds] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setViewerCount((v) => Math.max(0, v + Math.floor(Math.random() * 7) - 2));
      setElapsedSeconds((s) => s + 1);
    }, 1e3);
    return () => clearInterval(interval);
  }, [isLive]);
  reactExports.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  function stopCamera() {
    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        track.stop();
      }
      mediaStreamRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }
  async function startCamera() {
    setIsCameraLoading(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: micEnabled
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraEnabled(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setCameraError(
          isRTL ? "تم رفض إذن الكاميرا. يرجى السماح للمتصفح بالوصول للكاميرا." : "Camera permission denied. Please allow camera access in your browser."
        );
      } else if (msg.includes("NotFound")) {
        setCameraError(
          isRTL ? "لم يتم العثور على كاميرا." : "No camera found."
        );
      } else {
        setCameraError(
          isRTL ? "تعذر الوصول للكاميرا." : "Could not access camera."
        );
      }
    } finally {
      setIsCameraLoading(false);
    }
  }
  function handleCameraToggle() {
    if (cameraEnabled) {
      stopCamera();
      setCameraEnabled(false);
      if (isLive) {
        handleStopLive();
      }
    } else {
      void startCamera();
    }
  }
  function toggleMic() {
    setMicEnabled((prev) => {
      const next = !prev;
      if (mediaStreamRef.current) {
        for (const track of mediaStreamRef.current.getAudioTracks()) {
          track.enabled = next;
        }
      }
      return next;
    });
  }
  function handleGoLive() {
    if (!cameraEnabled || !mediaStreamRef.current) {
      ue.error(
        isRTL ? "يرجى تشغيل الكاميرا أولاً" : "Please enable camera first"
      );
      return;
    }
    if (!broadcastTitle.trim()) {
      ue.error(
        isRTL ? "يرجى إدخال عنوان للبث" : "Please enter a broadcast title"
      );
      return;
    }
    try {
      const recorder = new MediaRecorder(mediaStreamRef.current);
      recorder.ondataavailable = () => {
      };
      recorder.start(1e3);
      recorderRef.current = recorder;
    } catch {
    }
    setIsLive(true);
    setViewerCount(1);
    setElapsedSeconds(0);
    const stored = getLocalStreams();
    stored.unshift({
      id: `user_live_${Date.now()}`,
      streamer: localStorage.getItem("streamverse_admin_username") ?? "You",
      title: broadcastTitle,
      viewers: 1,
      category: isRTL ? "بث مباشر" : "Live",
      gradient: "from-primary/80 to-primary/30",
      avatar: "📡",
      live: true
    });
    setLocalStreams(stored.slice(0, 10));
    ue.success(isRTL ? "🔴 أنت الآن على الهواء!" : "🔴 You are now live!");
  }
  function handleStopLive() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setIsLive(false);
    setViewerCount(0);
    ue.info(isRTL ? "انتهى البث المباشر" : "Live stream ended");
  }
  function formatElapsed(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor(sec % 3600 / 60);
    const s = sec % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  const allStreams = [...getLocalStreams(), ...FAKE_STREAMS];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen bg-background",
      dir: isRTL ? "rtl" : "ltr",
      "data-ocid": "live_stream.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-4 w-4 text-red-500" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-display font-bold text-foreground", children: isRTL ? "البث المباشر" : "Live Stream" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: isRTL ? `${allStreams.length} بث نشط الآن` : `${allStreams.length} streams live now` })
          ] }),
          isLive && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "ms-auto bg-red-500/20 text-red-400 border-red-500/30 animate-pulse", children: [
            "🔴 ",
            isRTL ? "على الهواء" : "LIVE"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 py-6 space-y-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ocid": "live_stream.broadcast_section", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4", children: isRTL ? "ابدأ البث" : "Start Broadcasting" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `relative rounded-2xl overflow-hidden bg-muted/30 border ${isLive ? "border-red-500/50" : "border-border"} aspect-video flex items-center justify-center`,
                  "data-ocid": "live_stream.camera_preview",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "video",
                      {
                        ref: videoRef,
                        autoPlay: true,
                        muted: true,
                        playsInline: true,
                        className: `w-full h-full object-cover ${cameraEnabled ? "opacity-100" : "opacity-0"} transition-opacity duration-300`
                      }
                    ),
                    !cameraEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CameraOff, { className: "h-12 w-12 opacity-30" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: isRTL ? "الكاميرا مغلقة" : "Camera is off" })
                    ] }),
                    isLive && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 start-3 flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-600 text-white text-xs font-bold", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-white animate-ping" }),
                        "LIVE"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded-md bg-black/60 text-white text-xs font-mono", children: formatElapsed(elapsedSeconds) })
                    ] }),
                    isLive && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 end-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: viewerCount.toLocaleString() })
                    ] })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
                cameraError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-start gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive",
                    "data-ocid": "live_stream.camera_error",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 mt-0.5 shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cameraError })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: "broadcast-title",
                      className: "text-sm font-medium text-foreground",
                      children: isRTL ? "عنوان البث" : "Broadcast Title"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "broadcast-title",
                      type: "text",
                      value: broadcastTitle,
                      onChange: (e) => setBroadcastTitle(e.target.value),
                      placeholder: isRTL ? "اكتب عنوان بثك المباشر..." : "Enter your live stream title...",
                      disabled: isLive,
                      "data-ocid": "live_stream.title_input",
                      className: "w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: handleCameraToggle,
                      disabled: isCameraLoading,
                      "data-ocid": "live_stream.camera_toggle",
                      className: `flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-medium transition-all ${cameraEnabled ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"} disabled:opacity-50`,
                      children: [
                        isCameraLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" }) : cameraEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CameraOff, { className: "h-4 w-4" }),
                        isRTL ? cameraEnabled ? "إيقاف الكاميرا" : "تشغيل الكاميرا" : cameraEnabled ? "Camera On" : "Camera Off"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: toggleMic,
                      "data-ocid": "live_stream.mic_toggle",
                      className: `flex items-center justify-center w-10 h-10 rounded-xl border text-sm font-medium transition-all ${micEnabled ? "bg-primary/10 border-primary/30 text-primary" : "bg-destructive/10 border-destructive/30 text-destructive"}`,
                      "aria-label": micEnabled ? "Mute" : "Unmute",
                      children: micEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "h-4 w-4" })
                    }
                  )
                ] }),
                !isLive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "button",
                    onClick: handleGoLive,
                    disabled: !cameraEnabled,
                    "data-ocid": "live_stream.go_live_button",
                    className: "w-full h-11 bg-red-600 hover:bg-red-700 text-white border-0 font-bold text-base shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-5 w-5 me-2" }),
                      isRTL ? "ابدأ البث المباشر" : "Go Live"
                    ]
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-4 w-4 text-red-400 animate-pulse" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-red-400", children: isRTL ? "أنت على الهواء" : "You are live" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                        formatElapsed(elapsedSeconds),
                        " ·",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3 inline" }),
                        " ",
                        viewerCount
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      onClick: handleStopLive,
                      "data-ocid": "live_stream.stop_button",
                      variant: "destructive",
                      className: "w-full h-10",
                      children: isRTL ? "إنهاء البث" : "End Stream"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground bg-muted/30 rounded-xl px-3 py-2.5 border border-border", children: isRTL ? "💡 البث المباشر يستخدم كاميرا جهازك مباشرةً. تأكد من اتصالك بالإنترنت لأفضل جودة." : "💡 Live streaming uses your device camera directly. Ensure a stable internet connection for the best quality." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ocid": "live_stream.watch_section", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider", children: isRTL ? "مشاهدة البث المباشر" : "Watch Live" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" }),
                allStreams.length,
                " ",
                isRTL ? "مباشر" : "LIVE"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                "data-ocid": "live_stream.streams_grid",
                children: allStreams.map((stream, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "data-ocid": `live_stream.stream_card.${i + 1}`,
                    onClick: () => ue.info(
                      isRTL ? `جاري الانضمام لبث ${stream.streamer}...` : `Joining ${stream.streamer}'s stream...`,
                      { duration: 2e3 }
                    ),
                    className: "group text-start rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: `relative aspect-video bg-gradient-to-br ${stream.gradient} flex items-center justify-center overflow-hidden`,
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-5xl opacity-60 group-hover:scale-110 transition-transform duration-300", children: stream.avatar }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 start-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-bold", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-white animate-ping" }),
                              "LIVE"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 end-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-xs", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3 w-3" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: stream.viewers.toLocaleString() })
                            ] })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card px-3 py-2.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: stream.title }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground truncate", children: stream.streamer }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[10px] border bg-primary/10 text-primary border-primary/20 ms-auto shrink-0", children: stream.category })
                        ] })
                      ] })
                    ]
                  },
                  stream.id
                ))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "mt-16 border-t border-border bg-muted/30 px-4 py-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground/50", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          ".",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "hover:text-muted-foreground transition-colors",
              children: "Built with love using caffeine.ai"
            }
          )
        ] }) })
      ]
    }
  );
}
const LS_KEY = "streamverse_live_streams";
function getLocalStreams() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function setLocalStreams(streams) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(streams));
  } catch {
  }
}
export {
  LiveStream as default
};
