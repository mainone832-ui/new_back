import { NextResponse } from "next/server";
import { markStaleDevicesOffline } from "@/lib/checkOnlineMaintenance";

export const runtime = "nodejs";

async function runMaintenance() {
  try {
    const result = await markStaleDevicesOffline();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Failed to run checkOnline maintenance", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to run checkOnline maintenance",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return runMaintenance();
}

export async function POST() {
  return runMaintenance();
}