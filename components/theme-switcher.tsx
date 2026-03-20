"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
      aria-label="Toggle theme"
    >
      <span className="flex flex-col text-left">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Theme
        </span>
        <span className="text-sm font-semibold text-[var(--text-main)]">
          {isDark ? "Night" : "Day"}
        </span>
      </span>
      <span className="relative h-9 w-16 overflow-hidden rounded-full bg-gradient-to-r from-slate-200 via-white to-slate-100 transition group-hover:from-slate-100 group-hover:via-white group-hover:to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
        <span
          className={`absolute inset-1 flex items-center justify-center rounded-full text-xs font-bold transition ${
            isDark
              ? "translate-x-7 bg-slate-900 text-amber-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]"
              : "translate-x-0 bg-white text-sky-600 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.45)]"
          }`}
        >
          {isDark ? "☾" : "☼"}
        </span>
      </span>
    </button>
  );
};

export default ThemeSwitcher;
