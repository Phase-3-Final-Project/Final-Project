import UserModel from "@/db/models/UserModel";
import { compareSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const userExists = await UserModel.findByEmail(email);
    if (!userExists)
      throw { message: "invalid email or password", status: 401 };

    const isValid = compareSync(password, userExists.password);
    if (!isValid) throw { message: "invalid email or password", status: 401 };

    const accessToken = sign(
      { _id: userExists._id, email: userExists.email },
      process.env.SECRET_KEY as string
    );

    const cookieStore = await cookies();
    cookieStore.set("Authorization", `Bearer ${accessToken}`);

    return Response.json({ accessToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
