"use client";

import { Card, CardBody, Button } from "@heroui/react";

type ApkSupportCardProps = {
  panelId: string;
};

export default function ApkSupportCard({ panelId }: ApkSupportCardProps) {
  const handleContactSupport = () => {
    const message = `hello sir fixmy harmfull + ${panelId}`;
    // In a real app, this would open WhatsApp with the pre-filled message
    console.log("Opening WhatsApp with message:", message);
    alert(`WhatsApp would open with message: ${message}`);
  };

  return (
    <Card className="surface-card">
      <CardBody className="gap-4 p-6">
        <h3 className="text-lg font-bold text-[var(--text-main)]">
          Fix My Apk Harmfull
        </h3>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <p className="mb-2 text-sm font-semibold text-amber-700">
            Need help for harmful/fix issue?
          </p>
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            Click below and WhatsApp will open with auto message:{" "}
            <span className="font-mono text-amber-700">
              hello sir fixmy harmfull
            </span>{" "}
            + your panel id.
          </p>
        </div>

        <Button
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-base font-semibold text-[var(--text-main)] shadow-lg shadow-emerald-200/50 hover:shadow-xl"
          size="lg"
          radius="lg"
          onPress={handleContactSupport}
        >
          contact Harmfull team
        </Button>

        <p className="text-center text-xs text-[var(--text-muted)]">
          Panel ID:{" "}
          <span className="font-mono text-[var(--text-main)]">{panelId}</span>
        </p>
      </CardBody>
    </Card>
  );
}
