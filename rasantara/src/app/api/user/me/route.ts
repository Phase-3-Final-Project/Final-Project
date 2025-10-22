import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import UserModel from "@/db/models/UserModel";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const auth = cookieStore.get("Authorization")?.value;
    
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.replace("Bearer ", "");
    const payload = verify(token, process.env.SECRET_KEY as string) as { email?: string; _id?: string };

    if (!payload?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await UserModel.findByEmail(payload.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data without password (safely)
    const userObj = user as Record<string, unknown> | null;
    if (!userObj) return NextResponse.json({ error: 'User data invalid' }, { status: 500 });
    const safeUserData = { ...userObj } as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(safeUserData, 'password')) {
      // remove sensitive field if present in a type-safe way
      delete safeUserData['password'];
    }
    return NextResponse.json({ user: safeUserData }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/user/me:", err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
