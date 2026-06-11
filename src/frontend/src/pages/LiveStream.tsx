/**
 * LiveStream.tsx — Live streaming page for StreamVerse.
 * Supports starting a broadcast (camera preview + MediaRecorder)
 * and watching simulated live stream cards.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Camera,
  CameraOff,
  Eye,
  Mic,
  MicOff,
  Radio,
  Users,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "../lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveCard {
  id: string;
  streamer: string;
  title: string;
  viewers: number;
  category: string;
  gradient: string;
  avatar: string;
  live: boolean;
}

// ─── Fake live streams for display ───────────────────────────────────────────

const FAKE_STREAMS: LiveCard[] = [
  {
    id: "live_1",
    streamer: "Ahmed_Creator",
    title: "بث مباشر: موسيقى حية من القاهرة",
    viewers: 1_243,
    category: "موسيقى",
    gradient: "from-violet-600 to-purple-900",
    avatar: "🎵",
    live: true,
  },
  {
    id: "live_2",
    streamer: "Sara_Tech",
    title: "تعلم البرمجة مع React — مستوى مبتدئ",
    viewers: 876,
    category: "تقنية",
    gradient: "from-cyan-600 to-blue-900",
    avatar: "💻",
    live: true,
  },
  {
    id: "live_3",
    streamer: "Omar_Games",
    title: "FIFA 25 — كأس العالم الافتراضي",
    viewers: 3_102,
    category: "ألعاب",
    gradient: "from-emerald-600 to-green-900",
    avatar: "🎮",
    live: true,
  },
  {
    id: "live_4",
    streamer: "Lina_Art",
    title: "رسم تجريدي مباشر — جلسة إبداعية",
    viewers: 521,
    category: "فن",
    gradient: "from-rose-600 to-pink-900",
    avatar: "🎨",
    live: true,
  },
  {
    id: "live_5",
    streamer: "Khaled_Fitness",
    title: "تمارين الصباح — كارديو مع خالد",
    viewers: 1_890,
    category: "رياضة",
    gradient: "from-amber-600 to-orange-900",
    avatar: "💪",
    live: true,
  },
  {
    id: "live_6",
    streamer: "Noura_Cooking",
    title: "طبخ شرقي أصيل — حلقة عيد",
    viewers: 2_310,
    category: "طبخ",
    gradient: "from-red-600 to-rose-900",
    avatar: "🍳",
    live: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LiveStream() {
  const { isRTL } = useTranslation();

  // Camera / broadcast state
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const [isLive, setIsLive] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Viewer count simulation when live
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setViewerCount((v) => Math.max(0, v + Math.floor(Math.random() * 7) - 2));
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Cleanup on unmount
  useEffect(() => {
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
          height: { ideal: 720 },
        },
        audio: micEnabled,
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
          isRTL
            ? "تم رفض إذن الكاميرا. يرجى السماح للمتصفح بالوصول للكاميرا."
            : "Camera permission denied. Please allow camera access in your browser.",
        );
      } else if (msg.includes("NotFound")) {
        setCameraError(
          isRTL ? "لم يتم العثور على كاميرا." : "No camera found.",
        );
      } else {
        setCameraError(
          isRTL ? "تعذر الوصول للكاميرا." : "Could not access camera.",
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
      toast.error(
        isRTL ? "يرجى تشغيل الكاميرا أولاً" : "Please enable camera first",
      );
      return;
    }
    if (!broadcastTitle.trim()) {
      toast.error(
        isRTL ? "يرجى إدخال عنوان للبث" : "Please enter a broadcast title",
      );
      return;
    }

    // Start MediaRecorder (simulated — chunks go nowhere in this demo)
    try {
      const recorder = new MediaRecorder(mediaStreamRef.current);
      recorder.ondataavailable = () => {
        // In production: send chunks to a streaming server
      };
      recorder.start(1000);
      recorderRef.current = recorder;
    } catch {
      // MediaRecorder may not support current codec — still show as live
    }

    setIsLive(true);
    setViewerCount(1);
    setElapsedSeconds(0);
    // Save to localStorage
    const stored = getLocalStreams();
    stored.unshift({
      id: `user_live_${Date.now()}`,
      streamer: localStorage.getItem("streamverse_admin_username") ?? "You",
      title: broadcastTitle,
      viewers: 1,
      category: isRTL ? "بث مباشر" : "Live",
      gradient: "from-primary/80 to-primary/30",
      avatar: "📡",
      live: true,
    });
    setLocalStreams(stored.slice(0, 10));
    toast.success(isRTL ? "🔴 أنت الآن على الهواء!" : "🔴 You are now live!");
  }

  function handleStopLive() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setIsLive(false);
    setViewerCount(0);
    toast.info(isRTL ? "انتهى البث المباشر" : "Live stream ended");
  }

  function formatElapsed(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const allStreams = [...getLocalStreams(), ...FAKE_STREAMS];

  return (
    <div
      className="min-h-screen bg-background"
      dir={isRTL ? "rtl" : "ltr"}
      data-ocid="live_stream.page"
    >
      {/* Page header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Radio className="h-4 w-4 text-red-500" />
        </div>
        <div>
          <h1 className="text-base font-display font-bold text-foreground">
            {isRTL ? "البث المباشر" : "Live Stream"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isRTL
              ? `${allStreams.length} بث نشط الآن`
              : `${allStreams.length} streams live now`}
          </p>
        </div>
        {isLive && (
          <Badge className="ms-auto bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
            🔴 {isRTL ? "على الهواء" : "LIVE"}
          </Badge>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* ─── Broadcast section ─── */}
        <section data-ocid="live_stream.broadcast_section">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {isRTL ? "ابدأ البث" : "Start Broadcasting"}
          </h2>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Camera preview */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-muted/30 border ${
                isLive ? "border-red-500/50" : "border-border"
              } aspect-video flex items-center justify-center`}
              data-ocid="live_stream.camera_preview"
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${
                  cameraEnabled ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300`}
              />
              {!cameraEnabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <CameraOff className="h-12 w-12 opacity-30" />
                  <p className="text-sm">
                    {isRTL ? "الكاميرا مغلقة" : "Camera is off"}
                  </p>
                </div>
              )}
              {/* Live overlay */}
              {isLive && (
                <div className="absolute top-3 start-3 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-600 text-white text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                  <span className="px-2 py-1 rounded-md bg-black/60 text-white text-xs font-mono">
                    {formatElapsed(elapsedSeconds)}
                  </span>
                </div>
              )}
              {isLive && (
                <div className="absolute top-3 end-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs">
                  <Eye className="h-3 w-3" />
                  <span>{viewerCount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4">
              {/* Camera error */}
              {cameraError && (
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive"
                  data-ocid="live_stream.camera_error"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="broadcast-title"
                  className="text-sm font-medium text-foreground"
                >
                  {isRTL ? "عنوان البث" : "Broadcast Title"}
                </label>
                <input
                  id="broadcast-title"
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder={
                    isRTL
                      ? "اكتب عنوان بثك المباشر..."
                      : "Enter your live stream title..."
                  }
                  disabled={isLive}
                  data-ocid="live_stream.title_input"
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                />
              </div>

              {/* Camera & Mic toggles */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCameraToggle}
                  disabled={isCameraLoading}
                  data-ocid="live_stream.camera_toggle"
                  className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-medium transition-all ${
                    cameraEnabled
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  } disabled:opacity-50`}
                >
                  {isCameraLoading ? (
                    <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : cameraEnabled ? (
                    <Camera className="h-4 w-4" />
                  ) : (
                    <CameraOff className="h-4 w-4" />
                  )}
                  {isRTL
                    ? cameraEnabled
                      ? "إيقاف الكاميرا"
                      : "تشغيل الكاميرا"
                    : cameraEnabled
                      ? "Camera On"
                      : "Camera Off"}
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  data-ocid="live_stream.mic_toggle"
                  className={`flex items-center justify-center w-10 h-10 rounded-xl border text-sm font-medium transition-all ${
                    micEnabled
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-destructive/10 border-destructive/30 text-destructive"
                  }`}
                  aria-label={micEnabled ? "Mute" : "Unmute"}
                >
                  {micEnabled ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Go Live / Stop buttons */}
              {!isLive ? (
                <Button
                  type="button"
                  onClick={handleGoLive}
                  disabled={!cameraEnabled}
                  data-ocid="live_stream.go_live_button"
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white border-0 font-bold text-base shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all"
                >
                  <Radio className="h-5 w-5 me-2" />
                  {isRTL ? "ابدأ البث المباشر" : "Go Live"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
                    <Wifi className="h-4 w-4 text-red-400 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-400">
                        {isRTL ? "أنت على الهواء" : "You are live"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatElapsed(elapsedSeconds)} ·{" "}
                        <Users className="h-3 w-3 inline" /> {viewerCount}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleStopLive}
                    data-ocid="live_stream.stop_button"
                    variant="destructive"
                    className="w-full h-10"
                  >
                    {isRTL ? "إنهاء البث" : "End Stream"}
                  </Button>
                </div>
              )}

              {/* Info note */}
              <p className="text-xs text-muted-foreground bg-muted/30 rounded-xl px-3 py-2.5 border border-border">
                {isRTL
                  ? "💡 البث المباشر يستخدم كاميرا جهازك مباشرةً. تأكد من اتصالك بالإنترنت لأفضل جودة."
                  : "💡 Live streaming uses your device camera directly. Ensure a stable internet connection for the best quality."}
              </p>
            </div>
          </div>
        </section>

        {/* ─── Watch Live section ─── */}
        <section data-ocid="live_stream.watch_section">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {isRTL ? "مشاهدة البث المباشر" : "Watch Live"}
            </h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              {allStreams.length} {isRTL ? "مباشر" : "LIVE"}
            </span>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="live_stream.streams_grid"
          >
            {allStreams.map((stream, i) => (
              <button
                key={stream.id}
                type="button"
                data-ocid={`live_stream.stream_card.${i + 1}`}
                onClick={() =>
                  toast.info(
                    isRTL
                      ? `جاري الانضمام لبث ${stream.streamer}...`
                      : `Joining ${stream.streamer}'s stream...`,
                    { duration: 2000 },
                  )
                }
                className="group text-start rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Thumbnail */}
                <div
                  className={`relative aspect-video bg-gradient-to-br ${stream.gradient} flex items-center justify-center overflow-hidden`}
                >
                  <span className="text-5xl opacity-60 group-hover:scale-110 transition-transform duration-300">
                    {stream.avatar}
                  </span>
                  {/* Live badge */}
                  <div className="absolute top-2 start-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </div>
                  {/* Viewer count */}
                  <div className="absolute bottom-2 end-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-xs">
                    <Eye className="h-3 w-3" />
                    <span>{stream.viewers.toLocaleString()}</span>
                  </div>
                </div>

                {/* Meta */}
                <div className="bg-card px-3 py-2.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {stream.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground truncate">
                      {stream.streamer}
                    </span>
                    <Badge className="text-[10px] border bg-primary/10 text-primary border-primary/20 ms-auto shrink-0">
                      {stream.category}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-muted/30 px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground/50">
          &copy; {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

// ─── localStorage helpers for user-created streams ───────────────────────────

const LS_KEY = "streamverse_live_streams";

function getLocalStreams(): LiveCard[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LiveCard[];
  } catch {
    return [];
  }
}

function setLocalStreams(streams: LiveCard[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(streams));
  } catch {
    /* ignore */
  }
}
