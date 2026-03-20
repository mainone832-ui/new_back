"use client";

import { Card, CardBody } from "@heroui/react";

type StatsCardsProps = {
  activeDevicesCount: number;
  totalMessages: number;
  totalRegisteredDevices: number;
};

const cards = [
  {
    key: "active",
    title: "Active Devices",
    helper: "Currently online",
    icon: "●",
  },
  {
    key: "messages",
    title: "Total Messages",
    helper: "Collected from all devices",
    icon: "✉",
  },
  {
    key: "registered",
    title: "Registered Devices",
    helper: "Total enrolled endpoints",
    icon: "◻",
  },
] as const;

export default function StatsCards({
  activeDevicesCount,
  totalMessages,
  totalRegisteredDevices,
}: StatsCardsProps) {
  const valueByKey = {
    active: activeDevicesCount,
    messages: totalMessages,
    registered: totalRegisteredDevices,
  } as const;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.key}
          className="surface-card"
        >
          <CardBody className="gap-2">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-[var(--text-muted)]">
                {card.title}
              </p>
              <span className="text-sm text-[var(--accent)]">{card.icon}</span>
            </div>
            <p className="text-3xl font-semibold text-[var(--text-main)]">
              {valueByKey[card.key]}
            </p>
            <p className="text-xs text-[var(--text-muted)]">{card.helper}</p>
          </CardBody>
        </Card>
      ))}
    </section>
  );
}
