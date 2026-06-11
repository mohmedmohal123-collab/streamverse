import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    "data-ocid"?: string;
  };
  className?: string;
  "data-ocid"?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  "data-ocid": dataOcid,
}: EmptyStateProps) {
  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center",
        className,
      )}
    >
      <div className="rounded-2xl bg-muted/50 p-5">
        <Icon className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h3 className="font-display font-semibold text-lg text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xs">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button
          variant="outline"
          onClick={action.onClick}
          data-ocid={action["data-ocid"]}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
