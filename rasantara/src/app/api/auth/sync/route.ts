import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session && (session as any).accessToken) {
      // Set Authorization cookie untuk kompatibilitas dengan sistem lama
      const cookieStore = await cookies();
      cookieStore.set("Authorization", `Bearer ${(session as any).accessToken}`, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      
      return NextResponse.json({ 
        success: true, 
        session,
        message: "Session synced"
      });
    }
    
    return NextResponse.json({ 
      success: false,
      message: "No session found" 
    }, { status: 401 });
  } catch (error) {
    console.error("Session sync error:", error);
    return NextResponse.json({ 
      error: "Failed to sync session" 
    }, { status: 500 });
  }
}
