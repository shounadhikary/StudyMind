import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/shared/brand-mark";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <BrandIcon className="size-12" />
      <p className="mt-6 font-heading text-5xl font-semibold tracking-tight">
        404
      </p>
      <h1 className="mt-2 font-heading text-xl font-semibold">
        Page not found
      </h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button className="mt-6" render={<Link href="/" />}>
        Back home
      </Button>
    </div>
  );
}
