"use client";

import { Avatar, Chip } from "@heroui/react";

type NavbarProps = {
  title: string;
  subtitle?: string;
};

export default function Navbar({ title, subtitle }: NavbarProps) {
  return (
    <header className="surface-card mb-5 flex flex-col gap-4 rounded-[24px] border border-(--border) bg-(--surface-glass) p-4 backdrop-blur-xl sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-(--accent)">
          Operations
        </p>
        <h1 className="text-xl font-bold tracking-tight text-(--text-main) sm:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-(--text-muted)">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Chip
          color="primary"
          variant="flat"
          size="sm"
          className="border border-(--border) bg-(--accent-soft) px-3 font-semibold text-(--accent)"
        >
          Admin Panel
        </Chip>
        <Avatar
          name="Admin"
          size="sm"
          classNames={{
            base: "bg-(--accent-soft) text-(--accent)",
            name: "text-(--accent)",
          }}
        />
      </div>
    </header>
  );
}
