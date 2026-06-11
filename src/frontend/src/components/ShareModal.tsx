import { Button } from "@/components/ui/button";
import { Check, Copy, Mail, MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "../lib/i18n";
import type { VideoMetadata } from "../types";

interface ShareModalProps {
  video: VideoMetadata | null;
  onClose: () => void;
}

function getShareUrl(video: VideoMetadata): string {
  return `${window.location.origin}/watch?v=${video.videoId}`;
}

function getPlatformUrl(video: VideoMetadata): string {
  if (video.platform === "vimeo") return `https://vimeo.com/${video.videoId}`;
  return `https://www.youtube.com/watch?v=${video.videoId}`;
}

export function ShareModal({ video, onClose }: ShareModalProps) {
  const { isRTL } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!video) return null;

  const shareUrl = getShareUrl(video);
  const platformUrl = getPlatformUrl(video);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      navigator.clipboard.writeText(platformUrl).catch(() => {});
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${video.title}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(video.title);
    const body = encodeURIComponent(
      `${isRTL ? "شاهد هذا الفيديو" : "Check out this video"}:\n${video.title}\n${shareUrl}`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <AnimatePresence>
      {video && (
        <div
          className="modal-overlay"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          tabIndex={-1}
          data-ocid="share_modal.dialog"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-foreground">
                {isRTL ? "مشاركة الفيديو" : "Share Video"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                onClick={onClose}
                data-ocid="share_modal.close_button"
                aria-label={isRTL ? "إغلاق" : "Close"}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Video preview */}
            <div className="flex gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
              <div className="relative flex-shrink-0 w-20 aspect-video rounded overflow-hidden bg-muted">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 end-1">
                  <span
                    className={`text-[9px] font-bold px-1 py-0.5 rounded text-white ${
                      video.platform === "vimeo"
                        ? "bg-primary/90"
                        : "bg-destructive/90"
                    }`}
                  >
                    {video.platform === "vimeo" ? "V" : "YT"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                  {video.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {video.channelTitle}
                </p>
              </div>
            </div>

            {/* Copy URL */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isRTL ? "رابط المشاركة" : "Share link"}
              </p>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0 px-3 py-2 rounded-md bg-muted/50 border border-border text-xs text-muted-foreground truncate font-mono">
                  {shareUrl}
                </div>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  data-ocid="share_modal.copy_button"
                  className={`shrink-0 transition-all duration-300 ${
                    copied
                      ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                      : "gradient-primary text-white border-0"
                  }`}
                  aria-label={isRTL ? "نسخ الرابط" : "Copy link"}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 me-1" />
                      {isRTL ? "تم النسخ" : "Copied!"}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 me-1" />
                      {isRTL ? "نسخ" : "Copy"}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Share options */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isRTL ? "مشاركة عبر" : "Share via"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="share-option"
                  onClick={handleWhatsApp}
                  data-ocid="share_modal.whatsapp_button"
                >
                  <span className="text-green-400">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span className="share-option-label">WhatsApp</span>
                </button>

                <button
                  type="button"
                  className="share-option"
                  onClick={handleEmail}
                  data-ocid="share_modal.email_button"
                >
                  <span className="text-primary">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span className="share-option-label">
                    {isRTL ? "بريد إلكتروني" : "Email"}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
