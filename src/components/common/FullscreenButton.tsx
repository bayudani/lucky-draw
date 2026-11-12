import { useEffect, useState } from "react";
import { Maximize, Minimize } from "lucide-react";

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Browser memblokir fullscreen (mis. tanpa gesture) — abaikan.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={isFullscreen ? "Keluar fullscreen" : "Mode fullscreen"}
      aria-label={isFullscreen ? "Keluar fullscreen" : "Mode fullscreen"}
      className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-elevated hover:text-ink"
    >
      {isFullscreen ? <Minimize className="size-4" aria-hidden /> : <Maximize className="size-4" aria-hidden />}
      <span className="hidden lg:inline">{isFullscreen ? "Keluar" : "Fullscreen"}</span>
    </button>
  );
}
