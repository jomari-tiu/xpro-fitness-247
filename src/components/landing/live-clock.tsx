"use client";

import { useNow } from "@/hooks/use-now";

export function LiveClock() {
  const now = useNow();
  if (!now) return <span className="inline-block min-w-[7ch]">--:--</span>;
  return (
    <span suppressHydrationWarning>
      {new Date(now).toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Manila",
      })}
    </span>
  );
}
