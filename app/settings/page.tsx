"use client";

import { useState } from "react";
import { Card, CardBody, Button, Input, Divider } from "@heroui/react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [globalPhone, setGlobalPhone] = useState("");
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [updatingCode, setUpdatingCode] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSavePhone = async () => {
    try {
      const resp = await fetch("/api/updateglobalphone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: globalPhone }),
      });
      alert("Global phone number updated successfully");
      setGlobalPhone("");
      const data = await resp.json();
      if (!data.success) {
        alert(
          "Failed to update global phone number: " +
            (data.error || "Unknown error"),
        );
      } else {
        alert("Global phone number updated successfully");
      }
    } catch {
      alert("An error occurred while updating the global phone number");
    }
  };

  const handleClearPhone = async () => {
    try {
      if (
        !confirm(
          "Are you sure you want to clear the global phone number? This cannot be undone.",
        )
      ) {
        return;
      }
      const response = await fetch("/api/updateglobalphone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: "" }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(
          "Failed to clear global phone number: " +
            (data.error || "Unknown error"),
        );
      } else {
        alert("Global phone number cleared successfully");
        setGlobalPhone("");
      }
    } catch {
      alert("An error occurred while clearing the global phone number");
    }
  };

  const handleUpdateCode = async () => {
    if (!currentCode || !newCode || !confirmCode) {
      alert("Please fill in all code fields");
      return;
    }

    if (newCode !== confirmCode) {
      alert("New code and confirm code do not match");
      return;
    }

    try {
      setUpdatingCode(true);

      const response = await fetch("/api/updateAdminCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentCode,
          newCode,
          confirmCode,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to update code");
        return;
      }

      alert("Code updated successfully");
      setCurrentCode("");
      setNewCode("");
      setConfirmCode("");
    } catch {
      alert("An error occurred while updating code");
    } finally {
      setUpdatingCode(false);
    }
  };

  const handleClearCode = () => {
    setCurrentCode("");
    setNewCode("");
    setConfirmCode("");
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout from all devices?")) {
      return;
    }

    try {
      setLoggingOut(true);

      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        alert(
          data.message || "Failed to logout all devices. Please try again.",
        );
        return;
      }

      alert("Logged out from all devices successfully.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout from all devices", error);
      alert(
        "Failed to logout all devices. Please check your network and try again.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="page-shell">
      <div className="page-frame">
        <Sidebar />

        <main className="page-main">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">
                Settings
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Global number + access code
              </p>
            </div>
            <Button
              isIconOnly
              variant="bordered"
              className="border-[var(--border)] text-[var(--text-muted)]"
              onPress={handleRefresh}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
          </div>

          <div className="mx-auto max-w-2xl">
            <Card className="surface-card shadow-lg">
              <CardBody className="p-6 space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">
                    Configuration
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Manage global settings and security
                  </p>
                </div>

                <Divider className="bg-slate-700/50" />

                {/* Global Admin Phone Section */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">
                    Global Admin Phone
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Used for renew / global admin updates
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
                        Phone
                      </label>
                      <Input
                        value={globalPhone}
                        onValueChange={setGlobalPhone}
                        placeholder="+1234567890"
                        classNames={{
                          input:
                            "bg-white text-[var(--text-main)] placeholder:text-[var(--text-muted)]",
                          inputWrapper:
                            "bg-white border border-[var(--border)] shadow-sm rounded-xl",
                        }}
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        Tip: You can paste with or without spaces. It will be
                        normalized.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-teal-500 text-[var(--text-main)] hover:bg-teal-600 font-semibold"
                        size="lg"
                        onPress={handleSavePhone}
                      >
                        Save
                      </Button>
                      <Button
                        variant="bordered"
                        className="border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-semibold"
                        size="lg"
                        onPress={handleClearPhone}
                      >
                        Clear from Server
                      </Button>
                    </div>
                  </div>
                </div>

                <Divider className="bg-slate-700/50" />
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">
                    Change Access Code
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Use your current login code to set a new one.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
                        Current Code
                      </label>
                      <Input
                        type="password"
                        value={currentCode}
                        onValueChange={setCurrentCode}
                        placeholder="Enter current code"
                        classNames={{
                          input:
                            "bg-white text-[var(--text-main)] placeholder:text-[var(--text-muted)]",
                          inputWrapper:
                            "bg-white border border-[var(--border)] shadow-sm rounded-xl",
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
                        New Code
                      </label>
                      <Input
                        type="password"
                        value={newCode}
                        onValueChange={setNewCode}
                        placeholder="Enter new code"
                        classNames={{
                          input:
                            "bg-white text-[var(--text-main)] placeholder:text-[var(--text-muted)]",
                          inputWrapper:
                            "bg-white border border-[var(--border)] shadow-sm rounded-xl",
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
                        Confirm New Code
                      </label>
                      <Input
                        type="password"
                        value={confirmCode}
                        onValueChange={setConfirmCode}
                        placeholder="Re-enter new code"
                        classNames={{
                          input:
                            "bg-white text-[var(--text-main)] placeholder:text-[var(--text-muted)]",
                          inputWrapper:
                            "bg-white border border-[var(--border)] shadow-sm rounded-xl",
                        }}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-teal-500 text-[var(--text-main)] hover:bg-teal-600 font-semibold"
                        size="lg"
                        isLoading={updatingCode}
                        onPress={handleUpdateCode}
                      >
                        Update Code
                      </Button>
                      <Button
                        variant="bordered"
                        className="border-[var(--border)] text-[var(--text-muted)] hover:bg-white font-semibold"
                        size="lg"
                        onPress={handleClearCode}
                      >
                        Clear
                      </Button>
                    </div>

                    <p className="text-xs text-slate-500">
                      This updates admin login code used by the login API.
                    </p>
                  </div>
                </div>

                <Divider className="bg-slate-700/50" />

                {/* Logout Section */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)] mb-3">
                    Session
                  </h3>
                  <Button
                    className="w-full bg-rose-500 text-[var(--text-main)] hover:bg-rose-600 font-semibold"
                    size="lg"
                    isLoading={loggingOut}
                    onPress={handleLogout}
                  >
                    Logout
                  </Button>
                  <p className="mt-2 text-xs text-slate-500">
                    You will be redirected to the login page.
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
