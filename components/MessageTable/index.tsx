"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import type { DeviceMessage } from "@/data/mockMessages";

type MessageTableProps = {
  messages: DeviceMessage[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

const SearchIcon = () => (
  <svg
    className="h-4 w-4 text-slate-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      d="m21 21-4.2-4.2m1.2-4.8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
    />
  </svg>
);

export default function MessageTable({ messages }: MessageTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return messages.filter((message) => {
      if (!query) {
        return true;
      }

      return (
        message.deviceId.toLowerCase().includes(query) ||
        message.mobileModel.toLowerCase().includes(query) ||
        message.messageContent.toLowerCase().includes(query)
      );
    });
  }, [messages, searchQuery]);

  if (isLoading) {
    return (
      <Card className="surface-card">
        <CardBody className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-lg" />
          ))}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="surface-card">
      <CardBody>
        <div className="mb-4">
          <Input
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search by device ID, model, or message content"
            startContent={<SearchIcon />}
            className="max-w-xl"
            classNames={{
              inputWrapper:
                "bg-white border-[var(--border)] hover:border-slate-300 shadow-sm rounded-xl",
            }}
          />
        </div>

        <Table
          aria-label="Messages table for monitored devices"
          classNames={{
            wrapper: "bg-transparent",
            th: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
            td: "text-[var(--text-main)]",
          }}
        >
          <TableHeader>
            <TableColumn>DEVICE ID</TableColumn>
            <TableColumn>MOBILE MODEL</TableColumn>
            <TableColumn>MESSAGE CONTENT</TableColumn>
            <TableColumn>TIMESTAMP</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No messages found.">
            {filteredMessages.map((message) => (
              <TableRow key={message.messageId}>
                <TableCell>
                  <Link
                    href={`/devices/${encodeURIComponent(message.deviceId)}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {message.deviceId}
                  </Link>
                </TableCell>
                <TableCell>{message.mobileModel}</TableCell>
                <TableCell>
                  <div className="max-w-xl text-sm text-[var(--text-main)]">
                    {message.messageContent}
                  </div>
                </TableCell>
                <TableCell>{formatDate(message.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
