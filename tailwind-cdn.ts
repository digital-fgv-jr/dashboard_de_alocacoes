import { useEffect, useState } from "react";

declare global {
  interface Window {
    __twReady?: boolean;
    __twLoadingPromise?: Promise<void>;
  }
}

function loadTailwindOnce(): Promise<void> {
  if (window.__twReady) return Promise.resolve();
  if (window.__twLoadingPromise) return window.__twLoadingPromise;

  window.__twLoadingPromise = new Promise<void>((resolve, reject) => {
    const scriptId = "tw-cdn";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    // Config precisa existir ANTES do script (se for primeira vez)
    (window as any).tailwind = (window as any).tailwind ?? {};
    (window as any).tailwind.config = {
      theme: {
        extend: {
          boxShadow: {
            soft: "0 1px 2px rgba(0,0,0,0.06), 0 12px 30px rgba(0,0,0,0.06)",
          },
        },
      },
    };

    const markReady = () => {
      window.__twReady = true;
      resolve();
    };

    // Se já existe script, só assina eventos
    if (existing) {
      // Se já carregou antes, resolve
      if (window.__twReady) return markReady();

      existing.addEventListener("load", markReady, { once: true });
      existing.addEventListener("error", () => reject(new Error("Tailwind CDN failed")), { once: true });
      return;
    }

    const s = document.createElement("script");
    s.id = scriptId;
    s.src = "https://cdn.tailwindcss.com";
    s.async = true;

    s.addEventListener("load", markReady, { once: true });
    s.addEventListener("error", () => reject(new Error("Tailwind CDN failed")), { once: true });

    document.head.appendChild(s);
  });

  return window.__twLoadingPromise;
}

export function useTailwindReady() {
  const [ready, setReady] = useState<boolean>(() => Boolean(window.__twReady));

  useEffect(() => {
    let mounted = true;

    loadTailwindOnce()
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((e) => {
        console.error(e);
        // se falhar, não fica travado em "false"
        if (mounted) setReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return ready;
}
