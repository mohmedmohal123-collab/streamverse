import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Download, Film, X } from "lucide-react";
import { useState } from "react";
import { DownloadPageInline } from "../components/DownloadPageInline";
import { useTranslation } from "../lib/i18n";

export interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
  platform?: string;
  videoUrl?: string;
}

function getPlatformLabel(platform: string | undefined): {
  label: string;
  color: string;
} {
  switch (platform) {
    case "vimeo":
      return {
        label: "Vimeo",
        color: "bg-sky-500/15 text-sky-400 border-sky-500/30",
      };
    case "tiktok":
      return {
        label: "TikTok",
        color: "bg-pink-500/15 text-pink-400 border-pink-500/30",
      };
    default:
      return {
        label: "YouTube",
        color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      };
  }
}

export function DownloadModal({
  open,
  onClose,
  videoId,
  title,
  platform,
}: DownloadModalProps) {
  const { isRTL } = useTranslation();
  const [showDownloadPage, setShowDownloadPage] = useState(false);
  const meta = getPlatformLabel(platform);

  // If user opts into the full download page, show inline
  if (showDownloadPage) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          className="max-w-2xl w-full mx-2 p-0 bg-background border-border shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
          data-ocid="download.dialog"
        >
          <DownloadPageInline
            videoId={videoId}
            title={title}
            platform={platform}
            onBack={() => setShowDownloadPage(false)}
            onClose={onClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm w-full mx-4 bg-card border-border shadow-2xl"
        data-ocid="download.dialog"
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Download className="h-4.5 w-4.5 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-display font-semibold text-foreground leading-tight">
                  {isRTL ? "تحميل الفيديو" : "Download Video"}
                </DialogTitle>
                {title && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                    {title}
                  </p>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground -mt-1 -me-1"
              onClick={onClose}
              aria-label="Close"
              data-ocid="download.close_button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Platform badge */}
        <div className="flex items-center gap-2 -mt-1 mb-1">
          <Film className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {isRTL ? "المنصة:" : "Platform:"}
          </span>
          <Badge className={cn("text-xs font-medium border", meta.color)}>
            {meta.label}
          </Badge>
        </div>

        {/* Open full download page */}
        <Button
          type="button"
          onClick={() => setShowDownloadPage(true)}
          className="w-full gradient-primary text-white border-0 gap-2"
          data-ocid="download.open_download_page_button"
        >
          <Download className="h-4 w-4" />
          {isRTL ? "اختر الجودة وحمّل" : "Choose Quality & Download"}
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/70 leading-relaxed pt-1 border-t border-border">
          {isRTL
            ? "يتم جلب رابط التحميل مباشرةً. تأكد من الالتزام بشروط خدمة المنصة."
            : "Download link is fetched directly. Please comply with the platform's terms of service."}
        </p>
      </DialogContent>
    </Dialog>
  );
}
