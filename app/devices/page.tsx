"use client";

import Sidebar from "@/components/Sidebar";
import DeviceTable from "@/components/DeviceTable";
import Device from "@/types/devicetype";
import { getDeviceStatusFromAvailability } from "@/lib/deviceStatus";
import { db } from "@/lib/firbase";
import {
  get,
  limitToFirst,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  orderByKey,
  query,
  ref,
  startAt,
} from "firebase/database";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

const INITIAL_PAGE_SIZE = 20;
const NEXT_PAGE_SIZE = 10;
const CHECKONLINE_SYNC_INTERVAL_MS = 5 * 60 * 1000;

type CheckOnlineRecord = Record<string, unknown>;

function normalizeJoinedAt(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed) {
      const numericValue = Number(trimmed);

      if (Number.isFinite(numericValue) && numericValue > 0) {
        return new Date(numericValue).toISOString();
      }

      const parsedDate = Date.parse(trimmed);

      if (!Number.isNaN(parsedDate)) {
        return new Date(parsedDate).toISOString();
      }
    }
  }

  return new Date(0).toISOString();
}

function normalizeCheckedAt(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    const numericValue = Number(trimmed);

    if (Number.isFinite(numericValue) && numericValue > 0) {
      return new Date(numericValue).toISOString();
    }

    const parsedDate = Date.parse(trimmed);

    if (!Number.isNaN(parsedDate)) {
      return new Date(parsedDate).toISOString();
    }
  }

  return "";
}

function getRegisteredCheckOnline(
  rawData: Record<string, unknown>,
): CheckOnlineRecord | undefined {
  const nestedCheckOnline = rawData.checkOnline;

  return nestedCheckOnline && typeof nestedCheckOnline === "object"
    ? (nestedCheckOnline as CheckOnlineRecord)
    : undefined;
}

function getOnlineStatus(
  checkOnline?: CheckOnlineRecord,
): Device["onlineStatus"] {
  return getDeviceStatusFromAvailability(checkOnline?.available);
}

function mapToDevice(
  deviceId: string,
  rawData: Record<string, unknown>,
): Device {
  const checkOnline = getRegisteredCheckOnline(rawData);

  return {
    deviceId,
    model: typeof rawData.model === "string" ? rawData.model : "Unknown",
    brand: typeof rawData.brand === "string" ? rawData.brand : "Unknown",
    forwardingSim: null,
    androidVersion:
      typeof rawData.androidVersion === "number"
        ? String(rawData.androidVersion)
        : "Unknown",
    joinedAt: normalizeJoinedAt(rawData.joinedAt),
    fcmToken: typeof rawData.fcmToken === "string" ? rawData.fcmToken : "",
    adminPhoneNumber: [],
    manufacturer:
      typeof rawData.manufacturer === "string"
        ? rawData.manufacturer
        : "Unknown",
    sim1Carrier:
      typeof rawData.sim1Carrier === "string" ? rawData.sim1Carrier : "N/A",
    sim1number:
      typeof rawData.sim1Number === "string" ? rawData.sim1Number : "N/A",
    sim2Carrier:
      typeof rawData.sim2Carrier === "string" ? rawData.sim2Carrier : "N/A",
    sim2number:
      typeof rawData.sim2Number === "string" ? rawData.sim2Number : "N/A",
    onlineStatus: getOnlineStatus(checkOnline),
    lastChecked: normalizeCheckedAt(
      checkOnline?.checkedAt ?? checkOnline?.lastChecked,
    ),
    isfavorite: Boolean(rawData.isfavorite),
  };
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastKey, setLastKey] = useState<string | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const lastKeyRef = useRef<string | null>(null);

  const loadDevices = useCallback(async (batchSize: number) => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const devicesRef = ref(db, "registeredDevices");

      const cursor = lastKeyRef.current;

      const pagedQuery = cursor
        ? query(
            devicesRef,
            orderByKey(),
            startAt(cursor),
            limitToFirst(batchSize + 1),
          )
        : query(devicesRef, orderByKey(), limitToFirst(batchSize));

      const devicesSnapshot = await get(pagedQuery);

      if (!devicesSnapshot.exists()) {
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }

      const fetchedDevices: Device[] = [];

      devicesSnapshot.forEach((childSnapshot) => {
        const deviceId = childSnapshot.key;
        const deviceData = childSnapshot.val();

        if (!deviceId || !deviceData) return;

        const device = mapToDevice(deviceId, deviceData);

        fetchedDevices.push(device);
        console.log(device.fcmToken);
      });

      const nextBatch = cursor
        ? fetchedDevices.filter((d) => d.deviceId !== cursor)
        : fetchedDevices;

      if (nextBatch.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }

      setDevices((prev) => {
        const existingIds = new Set(prev.map((d) => d.deviceId));

        const uniqueNew = nextBatch.filter((d) => !existingIds.has(d.deviceId));

        return [...prev, ...uniqueNew];
      });

      const nextLastKey = nextBatch[nextBatch.length - 1]?.deviceId;

      if (nextLastKey) {
        lastKeyRef.current = nextLastKey;
        setLastKey(nextLastKey);
      }

      if (nextBatch.length < batchSize) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch devices", error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDevices(INITIAL_PAGE_SIZE);
  }, [loadDevices]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (
          !entry?.isIntersecting ||
          loadingRef.current ||
          !hasMoreRef.current
        ) {
          return;
        }

        void loadDevices(NEXT_PAGE_SIZE);
      },
      {
        root: null,
        rootMargin: "0px 0px 240px 0px",
        threshold: 0,
      },
    );

    const currentLoader = loaderRef.current;

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
      observer.disconnect();
    };
  }, [loadDevices]);

  useEffect(() => {
    const devicesRef = ref(db, "registeredDevices");

    const unsubscribeChanged = onChildChanged(devicesRef, (snapshot) => {
      const childKey = snapshot.key;
      const childValue = snapshot.val();

      if (!childKey || !childValue || typeof childValue !== "object") {
        return;
      }

      const updatedDevice = mapToDevice(
        childKey,
        childValue as Record<string, unknown>,
      );

      setDevices((prevDevices) => {
        const deviceIndex = prevDevices.findIndex(
          (device) => device.deviceId === childKey,
        );

        if (deviceIndex < 0) {
          return prevDevices;
        }

        const nextDevices = [...prevDevices];
        nextDevices[deviceIndex] = updatedDevice;
        return nextDevices;
      });
    });

    const unsubscribeRemoved = onChildRemoved(devicesRef, (snapshot) => {
      const childKey = snapshot.key;

      if (!childKey) {
        return;
      }

      setDevices((prevDevices) =>
        prevDevices.filter((device) => device.deviceId !== childKey),
      );
    });

    return () => {
      unsubscribeChanged();
      unsubscribeRemoved();
    };
  }, []);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    lastKeyRef.current = lastKey;
  }, [lastKey]);

  useEffect(() => {
    if (hasMore || !lastKey) {
      return;
    }

    const devicesRef = ref(db, "registeredDevices");
    const tailQuery = query(devicesRef, orderByKey(), startAt(lastKey));

    const unsubscribeAdded = onChildAdded(tailQuery, (snapshot) => {
      const childKey = snapshot.key;
      const childValue = snapshot.val();

      if (
        !childKey ||
        childKey === lastKey ||
        !childValue ||
        typeof childValue !== "object"
      ) {
        return;
      }

      const appendedDevice = mapToDevice(
        childKey,
        childValue as Record<string, unknown>,
      );

      setDevices((prevDevices) => {
        if (prevDevices.some((device) => device.deviceId === childKey)) {
          return prevDevices;
        }

        return [...prevDevices, appendedDevice];
      });

      if (childKey.localeCompare(lastKeyRef.current ?? "") > 0) {
        lastKeyRef.current = childKey;
        setLastKey(childKey);
      }
    });

    return () => unsubscribeAdded();
  }, [hasMore, lastKey]);

  useEffect(() => {
    let isCancelled = false;

    const syncStaleOfflineDevices = async () => {
      try {
        const response = await fetch("/api/checkonline-maintenance", {
          method: "POST",
          cache: "no-store",
        });

        if (!response.ok && !isCancelled) {
          console.error("checkOnline maintenance request failed");
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to trigger checkOnline maintenance", error);
        }
      }
    };

    void syncStaleOfflineDevices();

    const intervalId = window.setInterval(() => {
      void syncStaleOfflineDevices();
    }, CHECKONLINE_SYNC_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="page-shell">
      <div className="page-frame">
        <Sidebar />

        <main className="page-main">
          <div className="space-y-6">
            <div className="surface-card rounded-[30px] border border-(--border) bg-linear-to-br from-white/92 via-white/84 to-(--surface-subtle) p-5 shadow-(--shadow-sm) sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--accent)">
                Device Operations
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--text-main) sm:text-3xl">
                Device Management
              </h1>
              <p className="mt-2 text-sm text-(--text-muted)">
                Review device health, monitor live status, and jump into
                device-level actions from a single premium control surface.
              </p>
            </div>

            {/* Device Table */}
            <div className="rounded-[28px] border border-(--border) bg-(--surface-glass) p-1 shadow-(--shadow-sm) backdrop-blur-xl">
              <Suspense
                fallback={
                  <div className="p-6 text-sm text-(--text-muted)">
                    Loading devices...
                  </div>
                }
              >
                <DeviceTable devices={devices} />
              </Suspense>
            </div>

            <div ref={loaderRef} className="h-1 w-full" />

            {loading && devices.length > 0 && (
              <div className="flex items-center justify-center gap-3 py-6 text-sm text-(--text-muted)">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-(--border) border-t-(--accent)" />
                <span>Loading more devices...</span>
              </div>
            )}

            {!hasMore && devices.length > 0 && (
              <p className="py-6 text-center text-sm text-(--text-muted)">
                No more devices to load.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
