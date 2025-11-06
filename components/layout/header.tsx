import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex-1 min-w-0">
        <h2 className="text-xl md:text-2xl font-bold text-white truncate">
          {title}
        </h2>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            3
          </Badge>
        </Button>
      </div>
    </div>
  );
}
