"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { useState, useEffect } from "react";

type AdminLicenseCardProps = {
  activeUntil: Date;
  purchaseDate: Date;
  panelId: string;
};

export default function AdminLicenseCard({
  activeUntil,
  purchaseDate,
  panelId,
}: AdminLicenseCardProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = activeUntil.getTime() - now.getTime();

      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, [activeUntil]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card className="surface-card">
      <CardBody className="gap-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--text-main)]">
            Admin Expires in
          </h3>
          <Button
            size="sm"
            className="rounded-full bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-indigo-100"
            radius="full"
          >
            Renew (Telegram)
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--text-muted)]">Active until:</p>
            <p className="font-semibold text-[var(--text-main)]">
              {formatDate(activeUntil)}
            </p>
          </div>
          <div>
            <p className="text-[var(--text-muted)]">Purchase date:</p>
            <p className="font-semibold text-[var(--text-main)]">
              {formatDate(purchaseDate)}
            </p>
          </div>
        </div>

        <div className="my-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <div className="flex items-center justify-center gap-2 text-center text-3xl sm:text-4xl">
            <div className="flex flex-col items-center">
              <span className="font-bold text-[var(--text-main)] tabular-nums">
                {String(timeRemaining.days).padStart(2, "0")}
              </span>
            </div>
            <span className="font-bold text-[var(--text-muted)]">:</span>
            <div className="flex flex-col items-center">
              <span className="font-bold text-[var(--text-main)] tabular-nums">
                {String(timeRemaining.hours).padStart(2, "0")}
              </span>
            </div>
            <span className="font-bold text-[var(--text-muted)]">:</span>
            <div className="flex flex-col items-center">
              <span className="font-bold text-[var(--text-main)] tabular-nums">
                {String(timeRemaining.minutes).padStart(2, "0")}
              </span>
            </div>
            <span className="font-bold text-[var(--text-muted)]">:</span>
            <div className="flex flex-col items-center">
              <span className="font-bold text-[var(--text-main)] tabular-nums">
                {String(timeRemaining.seconds).padStart(2, "0")}
              </span>
            </div>
            <span className="ml-2 text-base font-medium text-[var(--text-muted)]">
              Sec
            </span>
          </div>
          <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
            Days until {formatDate(activeUntil)}
          </p>
        </div>

        <Button
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-base font-semibold text-[var(--text-main)] shadow-lg shadow-emerald-200/50 hover:shadow-xl"
          size="lg"
          radius="lg"
        >
          Renew License (Telegram)
        </Button>

        <p className="text-center text-xs text-[var(--text-muted)]">
          Panel ID:{" "}
          <span className="font-mono text-[var(--text-main)]">{panelId}</span>
        </p>
      </CardBody>
    </Card>
  );
}
