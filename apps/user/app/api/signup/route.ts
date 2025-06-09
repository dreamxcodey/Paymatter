// app/api/signup/route.ts
import { NextResponse } from "next/server";
import db from "@repo/db/client";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const { username, phonenumber, password } = await req.json();
  // console.log("kjfkldsjk;j")
  await getServerSession();
  if (!username || !phonenumber || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existingUser = await db.user.findFirst({
    where: {
      OR: [{ username }, { phonenumber }],
    },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // console.log('user ckfjsdkfjskl;df')
  try {
    const user = await db.user.create({
      data: {
        username,
        phonenumber,
        password: hashedPassword,
      },
    });

    await db.balance.create({
      data: {
        amount: 0,
        locked: 0,
        userId: user.id,

      }
    })
    // console.log(user);
    return NextResponse.json({ message: "User created", user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

}
