import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Camera,
  CheckCircle2,
  Circle,
  Film,
  Loader2,
  Square,
  Tag,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../lib/backend";
import { useTranslation } from "../lib/i18n";

// ─── Filter definitions ────────────────────────────────────────────────────────

interface VideoFilter {
  id: string;
  labelEn: string;
  labelAr: string;
  cssFilter: string;
  preview: string;
}

const FILTERS: VideoFilter[] = [
  {
    id: "normal",
    labelEn: "Normal",
    labelAr: "عادي",
    cssFilter: "none",
    preview: "🎬",
  },
  {
    id: "grayscale",
    labelEn: "Grayscale",
    labelAr: "أبيض وأسود",
    cssFilter: "grayscale(100%)",
    preview: "🖤",
  },
  {
    id: "sepia",
    labelEn: "Sepia",
    labelAr: "سيبيا",
    cssFilter: "sepia(80%)",
    preview: "🟤",
  },
  {
    id: "vintage",
    labelEn: "Vintage",
    labelAr: "كلاسيكي",
    cssFilter: "sepia(50%) contrast(1.2) saturate(0.8)",
    preview: "🎞️",
  },
  {
    id: "blur",
    labelEn: "Dream",
    labelAr: "حلمي",
    cssFilter: "blur(1.5px) brightness(1.1)",
    preview: "🌫️",
  },
  {
    id: "contrast",
    labelEn: "High Contrast",
    labelAr: "تباين عالٍ",
    cssFilter: "contrast(1.8) saturate(1.3)",
    preview: "⚡",
  },
  {
    id: "invert",
    labelEn: "Invert",
    labelAr: "معكوس",
    cssFilter: "invert(100%)",
    preview: "🔄",
  },
];

const CATEGORIES = [
  { value: "Entertainment", labelEn: "Entertainment", labelAr: "ترفيه" },
  { value: "Music", labelEn: "Music", labelAr: "موسيقى" },
  { value: "Education", labelEn: "Education", labelAr: "تعليم" },
  { value: "Gaming", labelEn: "Gaming", labelAr: "ألعاب" },
  { value: "Sports", labelEn: "Sports", labelAr: "رياضة" },
  { value: "Other", labelEn: "Other", labelAr: "أخرى" },
];

// ─── Filter carousel ──────────────────────────────────────────────────────────

function FilterCarousel({
  activeFilter,
  onSelect,
  isRTL,
  language,
}: {
  activeFilter: string;
  onSelect: (id: string) => void;
  isRTL: boolean;
  language: string;
}) {
  return (
    <div
      className="filter-carousel scrollbar-hide"
      dir={isRTL ? "rtl" : "ltr"}
      data-ocid="create.filter_carousel"
    >
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          data-ocid={`create.filter.${f.id}`}
          onClick={() => onSelect(f.id)}
          className={cn(
            "filter-item flex flex-col items-center justify-center gap-1 px-2",
            activeFilter === f.id && "filter-item-active",
          )}
          aria-label={language === "ar" ? f.labelAr : f.labelEn}
          aria-pressed={activeFilter === f.id}
        >
          <span className="text-xl">{f.preview}</span>
          <span className="text-[9px] font-medium text-foreground leading-none text-center truncate w-full">
            {language === "ar" ? f.labelAr : f.labelEn}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Tag chip input ────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          data-ocid="create.tag_input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addTag}
          data-ocid="create.add_tag_button"
        >
          <Tag className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              data-ocid={`create.tag.${tag}`}
            >
              #{tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Metadata form ─────────────────────────────────────────────────────────────

interface MetaForm {
  title: string;
  description: string;
  thumbnailUrl: string;
  tags: string[];
  category: string;
}

function MetadataForm({
  form,
  onChange,
  isRTL,
  language,
  videoObjectUrl,
}: {
  form: MetaForm;
  onChange: (patch: Partial<MetaForm>) => void;
  isRTL: boolean;
  language: string;
  videoObjectUrl: string;
}) {
  const labels = {
    title: language === "ar" ? "العنوان" : "Title",
    description: language === "ar" ? "الوصف" : "Description",
    thumbnail: language === "ar" ? "رابط الصورة المصغرة" : "Thumbnail URL",
    orCapture:
      language === "ar"
        ? "أو اترك فارغاً للتقاط تلقائي"
        : "Leave blank to auto-capture",
    tags:
      language === "ar"
        ? "الوسوم (اضغط Enter للإضافة)"
        : "Tags (press Enter to add)",
    category: language === "ar" ? "التصنيف" : "Category",
    titlePh:
      language === "ar" ? "أدخل عنوان الفيديو..." : "Enter video title...",
    descPh:
      language === "ar"
        ? "صف محتوى الفيديو..."
        : "Describe your video content...",
    thumbPh:
      language === "ar"
        ? "https://example.com/thumb.jpg"
        : "https://example.com/thumb.jpg",
    selectCat: language === "ar" ? "اختر التصنيف" : "Select category",
    preview: language === "ar" ? "معاينة" : "Preview",
    tagPh: language === "ar" ? "أضف وسماً..." : "Add a tag...",
  };

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="space-y-1.5">
        <Label htmlFor="create-title">{labels.title} *</Label>
        <Input
          id="create-title"
          data-ocid="create.title_input"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={labels.titlePh}
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="create-desc">{labels.description}</Label>
        <Textarea
          id="create-desc"
          data-ocid="create.description_textarea"
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={labels.descPh}
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="create-thumb">
          {labels.thumbnail}
          <span className="text-muted-foreground text-xs ms-1">
            ({labels.orCapture})
          </span>
        </Label>
        {videoObjectUrl && !form.thumbnailUrl && (
          <div className="relative">
            <video
              src={videoObjectUrl}
              className="w-full max-h-24 object-cover rounded-md bg-muted"
              muted
            >
              <track kind="captions" />
            </video>
            <span className="absolute bottom-1 end-2 text-[10px] text-muted-foreground bg-card/80 px-1.5 py-0.5 rounded">
              {labels.preview}
            </span>
          </div>
        )}
        <Input
          id="create-thumb"
          data-ocid="create.thumbnail_input"
          value={form.thumbnailUrl}
          onChange={(e) => onChange({ thumbnailUrl: e.target.value })}
          placeholder={labels.thumbPh}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{labels.tags}</Label>
        <TagInput
          tags={form.tags}
          onChange={(tags) => onChange({ tags })}
          placeholder={labels.tagPh}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="create-category">{labels.category} *</Label>
        <select
          id="create-category"
          data-ocid="create.category_select"
          value={form.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="w-full px-3 py-2 rounded-md bg-input text-foreground border border-border focus:border-primary focus:ring-2 focus:ring-ring/30 transition-colors text-sm"
        >
          <option value="">{labels.selectCat}</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {language === "ar" ? c.labelAr : c.labelEn}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Upload tab ────────────────────────────────────────────────────────────────

function UploadTab({
  isRTL,
  language,
  onVideoReady,
}: {
  isRTL: boolean;
  language: string;
  onVideoReady: (objectUrl: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const errorMsg =
    language === "ar"
      ? "الملف المحدد ليس فيديو"
      : "Selected file is not a video";

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/")) {
        toast.error(errorMsg);
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setFileName(file.name);
      onVideoReady(url);
    },
    [errorMsg, onVideoReady],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const labels = {
    dropzone:
      language === "ar"
        ? "اسحب وأفلت ملف الفيديو هنا"
        : "Drag & drop your video here",
    or: language === "ar" ? "أو" : "or",
    browse: language === "ar" ? "تصفح الملفات" : "Browse Files",
    supported:
      language === "ar"
        ? "MP4 · WebM · MOV · حتى 500 MB"
        : "MP4 · WebM · MOV · up to 500 MB",
    selected: language === "ar" ? "تم اختيار الفيديو" : "Video selected",
    change: language === "ar" ? "تغيير الفيديو" : "Change video",
  };

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {!videoUrl ? (
        <button
          type="button"
          data-ocid="create.upload_dropzone"
          className={cn(
            "w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/60 hover:bg-muted/30",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{labels.dropzone}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{labels.or}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              tabIndex={-1}
              type="button"
            >
              {labels.browse}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{labels.supported}</p>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
            <video
              src={videoUrl}
              className="w-full h-full object-contain"
              controls
              data-ocid="create.upload_preview"
            >
              <track kind="captions" />
            </video>
            <div className="absolute top-2 end-2 flex items-center gap-1.5 bg-card/90 rounded-md px-2 py-1 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="text-foreground">{labels.selected}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground truncate max-w-[70%]">
              {fileName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              data-ocid="create.upload_change_button"
              onClick={() => {
                setVideoUrl(null);
                setFileName("");
              }}
            >
              {labels.change}
            </Button>
          </div>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={onFileChange}
        data-ocid="create.upload_file_input"
      />
    </div>
  );
}

// ─── Camera tab ────────────────────────────────────────────────────────────────

function CameraTab({
  isRTL,
  language,
  onVideoReady,
}: {
  isRTL: boolean;
  language: string;
  onVideoReady: (objectUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const [activeFilter, setActiveFilter] = useState("normal");
  const [isRecording, setIsRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const labels = {
    startCamera: language === "ar" ? "تشغيل الكاميرا" : "Start Camera",
    stopCamera: language === "ar" ? "إيقاف الكاميرا" : "Stop Camera",
    startRecord: language === "ar" ? "بدء التسجيل" : "Start Recording",
    stopRecord: language === "ar" ? "إيقاف التسجيل" : "Stop Recording",
    recording: language === "ar" ? "جارٍ التسجيل" : "Recording",
    filters: language === "ar" ? "الفلاتر" : "Filters",
    cameraErr:
      language === "ar"
        ? "تعذّر الوصول إلى الكاميرا. تأكد من منح الإذن."
        : "Could not access camera. Please allow camera permission.",
    retake: language === "ar" ? "إعادة التسجيل" : "Retake",
  };

  const activeFilterCSS =
    FILTERS.find((f) => f.id === activeFilter)?.cssFilter ?? "none";

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setCameraError(labels.cameraErr);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9,opus",
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      onVideoReady(url);
    };
    recorder.start(250);
    recorderRef.current = recorder;
    setIsRecording(true);
    setRecordSeconds(0);
    timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(
    () => () => {
      stopCamera();
    },
    [stopCamera],
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Camera preview */}
      <div className="filter-preview relative">
        {!cameraReady && !recordedUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/60 rounded-lg">
            <Video className="h-12 w-12 text-muted-foreground" />
            {cameraError ? (
              <p
                className="text-sm text-destructive text-center px-4"
                data-ocid="create.camera_error_state"
              >
                {cameraError}
              </p>
            ) : (
              <Button
                data-ocid="create.start_camera_button"
                onClick={startCamera}
                className="gradient-primary text-primary-foreground"
                type="button"
              >
                <Camera className="h-4 w-4 me-2" />
                {labels.startCamera}
              </Button>
            )}
          </div>
        )}

        {recordedUrl && !cameraReady && (
          <video
            src={recordedUrl}
            className="w-full h-full object-contain rounded-lg"
            controls
            data-ocid="create.recorded_preview"
          >
            <track kind="captions" />
          </video>
        )}

        <video
          ref={videoRef}
          className={cn(
            "w-full h-full object-cover rounded-lg",
            !cameraReady && "hidden",
          )}
          style={{ filter: activeFilterCSS, transform: "scaleX(-1)" }}
          muted
          playsInline
          data-ocid="create.camera_live"
        >
          <track kind="captions" />
        </video>

        {isRecording && (
          <div className="absolute top-3 start-3 flex items-center gap-2 bg-card/90 rounded-full px-3 py-1.5">
            <span className="record-indicator" />
            <span className="text-sm font-mono text-foreground">
              {formatTime(recordSeconds)}
            </span>
            <span className="text-xs text-muted-foreground">
              {labels.recording}
            </span>
          </div>
        )}
      </div>

      {/* Camera controls */}
      {cameraReady && (
        <div className="camera-controls" data-ocid="create.camera_controls">
          {!isRecording ? (
            <button
              type="button"
              className="record-button"
              data-ocid="create.record_button"
              onClick={startRecording}
              aria-label={labels.startRecord}
            >
              <Circle className="h-6 w-6 fill-primary-foreground" />
            </button>
          ) : (
            <button
              type="button"
              className="record-button animate-pulse"
              data-ocid="create.stop_record_button"
              onClick={stopRecording}
              aria-label={labels.stopRecord}
            >
              <Square className="h-5 w-5 fill-primary-foreground" />
            </button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={stopCamera}
            type="button"
            data-ocid="create.stop_camera_button"
          >
            {labels.stopCamera}
          </Button>
        </div>
      )}

      {recordedUrl && (
        <Button
          variant="outline"
          size="sm"
          type="button"
          data-ocid="create.retake_button"
          onClick={() => {
            setRecordedUrl(null);
            startCamera();
          }}
        >
          {labels.retake}
        </Button>
      )}

      {/* Filter carousel — shown when camera is active */}
      {cameraReady && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {labels.filters}
          </p>
          <FilterCarousel
            activeFilter={activeFilter}
            onSelect={setActiveFilter}
            isRTL={isRTL}
            language={language}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function Create() {
  const { language, isRTL } = useTranslation();
  const { actor, isFetching } = useActor();

  const [videoObjectUrl, setVideoObjectUrl] = useState("");
  const [form, setForm] = useState<MetaForm>({
    title: "",
    description: "",
    thumbnailUrl: "",
    tags: [],
    category: "",
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishDone, setPublishDone] = useState(false);

  const labels = {
    pageTitle: language === "ar" ? "إنشاء فيديو" : "Create Video",
    tabUpload: language === "ar" ? "رفع فيديو" : "Upload",
    tabCamera: language === "ar" ? "الكاميرا" : "Camera",
    metaSection: language === "ar" ? "تفاصيل الفيديو" : "Video Details",
    publish: language === "ar" ? "نشر الفيديو" : "Publish Video",
    publishing: language === "ar" ? "جارٍ النشر..." : "Publishing...",
    published:
      language === "ar" ? "تم النشر بنجاح! 🎉" : "Published successfully! 🎉",
    subtitle:
      language === "ar"
        ? "ارفع أو سجّل فيديو وشاركه مع العالم"
        : "Upload or record a video and share it with the world",
    needVideo:
      language === "ar" ? "اختر فيديو أولاً" : "Please select a video first",
    needTitle: language === "ar" ? "العنوان مطلوب" : "Title is required",
    needCat: language === "ar" ? "التصنيف مطلوب" : "Category is required",
    publishErr:
      language === "ar"
        ? "فشل النشر. حاول مرة أخرى."
        : "Publish failed. Please try again.",
    noActor:
      language === "ar"
        ? "الاتصال بالخادم غير متاح. تأكد من تسجيل الدخول."
        : "Backend unavailable. Make sure you're signed in.",
  };

  const handleVideoReady = (url: string) => {
    setVideoObjectUrl(url);
    setPublishDone(false);
  };

  const handlePublish = async () => {
    if (!videoObjectUrl) {
      toast.error(labels.needVideo);
      return;
    }
    if (!form.title.trim()) {
      toast.error(labels.needTitle);
      return;
    }
    if (!form.category) {
      toast.error(labels.needCat);
      return;
    }
    if (!actor || isFetching) {
      toast.error(labels.noActor);
      return;
    }

    setIsPublishing(true);
    try {
      await actor.createVideoPost({
        title: form.title.trim(),
        description: form.description.trim(),
        videoUrl: videoObjectUrl,
        thumbnailUrl: form.thumbnailUrl.trim(),
        tags: form.tags,
        category: form.category,
      });
      setPublishDone(true);
      toast.success(labels.published);
      setForm({
        title: "",
        description: "",
        thumbnailUrl: "",
        tags: [],
        category: "",
      });
      setVideoObjectUrl("");
    } catch (err) {
      console.error(err);
      toast.error(labels.publishErr);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div
      className="min-h-full bg-background pb-20 md:pb-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className="max-w-2xl mx-auto px-4 py-6 space-y-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Film className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              {labels.pageTitle}
            </h1>
            <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
          </div>
        </div>

        {/* Source tabs */}
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList className="w-full" data-ocid="create.source_tabs">
            <TabsTrigger
              value="upload"
              className="flex-1 gap-2"
              data-ocid="create.upload_tab"
            >
              <Upload className="h-4 w-4" />
              {labels.tabUpload}
            </TabsTrigger>
            <TabsTrigger
              value="camera"
              className="flex-1 gap-2"
              data-ocid="create.camera_tab"
            >
              <Camera className="h-4 w-4" />
              {labels.tabCamera}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0">
            <UploadTab
              isRTL={isRTL}
              language={language}
              onVideoReady={handleVideoReady}
            />
          </TabsContent>

          <TabsContent value="camera" className="mt-0">
            <CameraTab
              isRTL={isRTL}
              language={language}
              onVideoReady={handleVideoReady}
            />
          </TabsContent>
        </Tabs>

        {/* Metadata form */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            {labels.metaSection}
          </h2>
          {isFetching ? (
            <div className="space-y-3" data-ocid="create.form_loading_state">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <MetadataForm
              form={form}
              onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
              isRTL={isRTL}
              language={language}
              videoObjectUrl={videoObjectUrl}
            />
          )}
        </div>

        {/* Publish button */}
        <div className="pb-6">
          {publishDone ? (
            <div
              className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
              data-ocid="create.publish_success_state"
            >
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="font-semibold">{labels.published}</span>
            </div>
          ) : (
            <Button
              className="w-full gradient-primary text-primary-foreground font-bold py-6 text-base rounded-xl hover:opacity-90 transition-opacity"
              onClick={handlePublish}
              disabled={isPublishing || isFetching}
              data-ocid="create.publish_button"
              type="button"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-5 w-5 me-2 animate-spin" />
                  {labels.publishing}
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 me-2" />
                  {labels.publish}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
