"use server";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export default async function CreateOnRampTractions(
  provider: string,
  amount: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user?.id) {
    return {
      message: "User is not authenticated.",
    };
  }

  const token = (Math.random() * 1000).toString();
  const userID = Number(session?.user?.id);
  await prisma.onRamptransactions.create({
    data: {
      provider: provider,
      status: "Proccesing",
      amount: Number(amount) * 100,
      userId: userID,
      token: token,
      startTime: new Date(),
    },
  });
  try {
    const response = await fetch("http://localhost:3003/hdfcWebhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        userId: userID,
        amount: Number(amount) * 100,
      }),
    });

    const json = await response.json();
    console.log("Webhook response:", json);

  } catch (e) {
    console.error("Error calling webhook:", e);
  }

  return {
    message: "Transaction is Updated!",
  };
}
