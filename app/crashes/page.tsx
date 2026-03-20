"use client";

import { useState } from "react";
import { Card, CardBody, Input, Button } from "@heroui/react";
import Sidebar from "@/components/Sidebar";
import { getCrashLogsByDeviceId, type CrashLog } from "@/data/mockCrashLogs";

export default function CrashesPage() {
  const [deviceId, setDeviceId] = useState("");
  const [crashes, setCrashes] = useState<CrashLog[]>([]);
  const [selectedCrash, setSelectedCrash] = useState<CrashLog | null>(null);

  const handleLoadCrashes = () => {
    if (deviceId.trim()) {
      const logs = getCrashLogsByDeviceId(deviceId.trim());
      setCrashes(logs);
      setSelectedCrash(null);
    }
  };

  const handleClear = () => {
    setDeviceId("");
    setCrashes([]);
    setSelectedCrash(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    
    });
  };

  return (
    <div className="page-shell">
      <div className="page-frame">
        <Sidebar />

        <main className="page-main">
          <div className="mx-auto max-w-5xl">
            <Card className="surface-card shadow-lg mb-6">
              <CardBody className="p-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-[var(--text-main)] mb-1">
                    Crashes
                  </h1>
                  <p className="text-sm text-[var(--text-muted)]">
                    Per-device crash logs
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter deviceId (uniqueid)"
                    value={deviceId}
                    onValueChange={setDeviceId}
                    classNames={{
                      input:
                        "bg-white text-[var(--text-main)] placeholder:text-[var(--text-muted)]",
                      inputWrapper:
                        "bg-white border border-[var(--border)] shadow-sm rounded-xl",
                    }}
                    className="flex-1"
                  />
                  <Button
                    className="bg-[var(--accent)] text-white hover:bg-indigo-600 shadow-sm"
                    onPress={handleLoadCrashes}
                  >
                    Load Crashes
                  </Button>
                  <Button
                    variant="bordered"
                    className="border-[var(--border)] text-[var(--text-muted)]"
                    onPress={handleClear}
                  >
                    Clear
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Crash List and Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crash List */}
              <Card className="surface-card shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--text-main)]">Crash List</h2>
                    <span className="text-xs text-[var(--text-muted)]">
                      {crashes.length}
                    </span>
                  </div>

                  {crashes.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {crashes.map((crash) => (
                        <button
                          key={crash.id}
                          onClick={() => setSelectedCrash(crash)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            selectedCrash?.id === crash.id
                              ? "bg-[var(--accent-soft)] border-[var(--accent)]"
                              : "bg-[var(--surface-muted)] border-[var(--border)] hover:bg-white"
                          }`}
                        >
                          <p className="text-sm font-medium text-[var(--text-main)] truncate">
                            {crash.errorMessage}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {formatDate(crash.timestamp)}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            v{crash.appVersion}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-[var(--text-muted)]">No crashes loaded.</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Crash Viewer */}
              <Card className="surface-card shadow-lg">
                <CardBody className="p-6">
                  <h2 className="text-lg font-bold text-[var(--text-main)] mb-4">
                    Crash Viewer
                  </h2>

                  {selectedCrash ? (
                    <div className="space-y-4">
                      <div className="bg-[var(--surface-muted)] p-4 rounded-lg border border-[var(--border)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">
                          Error Message
                        </p>
                        <p className="text-sm text-[var(--text-main)]">
                          {selectedCrash.errorMessage}
                          </p>
                        </div>

                      <div className="bg-[var(--surface-muted)] p-4 rounded-lg border border-[var(--border)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">Device ID</p>
                        <p className="text-sm text-[var(--text-main)] break-all">
                          {selectedCrash.deviceId}
                        </p>
                      </div>

                      <div className="bg-[var(--surface-muted)] p-4 rounded-lg border border-[var(--border)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">Timestamp</p>
                        <p className="text-sm text-[var(--text-main)]">
                          {formatDate(selectedCrash.timestamp)}
                        </p>
                      </div>

                      <div className="bg-[var(--surface-muted)] p-4 rounded-lg border border-[var(--border)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">
                          App Version
                        </p>
                        <p className="text-sm text-[var(--text-main)]">
                          v{selectedCrash.appVersion}
                        </p>
                      </div>

                      <div className="bg-[var(--surface-muted)] p-4 rounded-lg border border-[var(--border)]">
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                          Stack Trace
                        </p>
                        <pre className="text-xs text-[var(--text-main)] whitespace-pre-wrap font-mono overflow-x-auto">
                          {selectedCrash.stackTrace}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-[var(--text-muted)]">Select a crash</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
