"use client";

import { Card, CardBody, Button } from "@heroui/react";

type FormSubmit = {
  label: string;
  count: number;
  icon: string;
  color: string;
};

type FormSubmitsCardProps = {
  formSubmits: FormSubmit[];
};

export default function FormSubmitsCard({ formSubmits }: FormSubmitsCardProps) {
  const totalSubmits = formSubmits.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="surface-card">
      <CardBody className="gap-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--text-main)]">
            All Form Submits
          </h3>
          <Button
            size="sm"
            variant="light"
            className="text-[var(--accent)] hover:bg-[var(--accent-soft)]"
            onPress={() => {
              window.location.href = "/forms";
            }}
          >
            View Forms →
          </Button>
        </div>

        <div className="grid gap-3">
          {formSubmits.map((submit, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 transition-colors hover:bg-white"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${submit.color} text-xl`}
                >
                  {submit.icon}
                </div>
                <span className="font-medium text-[var(--text-main)]">
                  {submit.label}
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] font-bold text-[var(--accent)]">
                {submit.count}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <span className="font-semibold text-[var(--text-main)]">
            Total Submits
          </span>
          <span className="text-2xl font-bold text-[var(--accent)]">
            {totalSubmits}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
