import type { ComponentType, SVGProps } from "react";

import { cn } from "@/lib/utils";
import {
  AppleIcon,
  GooglePlayIcon,
  MicrosoftIcon,
} from "@/components/shared/brand-icons";

type Store = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  top: string;
  name: string;
  href: string;
};

// No public listings yet, so these are placeholders. Swap href in when live.
const STORES: Store[] = [
  { Icon: GooglePlayIcon, top: "GET IT ON", name: "Google Play", href: "#" },
  { Icon: AppleIcon, top: "Download on the", name: "App Store", href: "#" },
  { Icon: MicrosoftIcon, top: "Get it from", name: "Microsoft Store", href: "#" },
];

export function StoreBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {STORES.map(({ Icon, top, name, href }) => (
        <a
          key={name}
          href={href}
          title="Coming soon"
          aria-label={`${name} - coming soon`}
          className="inline-flex items-center gap-2.5 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-black shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <Icon className="size-7 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] font-medium text-black/60">{top}</span>
            <span className="font-heading -mt-0.5 text-sm font-semibold">
              {name}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
