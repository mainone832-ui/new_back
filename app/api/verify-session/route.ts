import { NextRequest, NextResponse } from "next/server";
import { getValidSession, SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET(request: NextRequest) {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value?.trim();

    if (!sessionToken) {
        return NextResponse.json({ valid: false }, { status: 401 });
    }

    try {
        const session = await getValidSession(sessionToken);

        if (session) {
            return NextResponse.json({ valid: true }, { status: 200 });
        } else {
            return NextResponse.json({ valid: false }, { status: 401 });
        }
    } catch (error) {
        console.error("Session verification error:", error);
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
