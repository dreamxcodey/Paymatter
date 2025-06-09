import { AddMoney } from "../../../components/addMoneycard";
import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRamptransactions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";



async function getBalance() {
  const session = await getServerSession(authOptions);
  // console.log(session);

  const balance = await prisma.balance.findFirst({
    where: {
      userId: Number(session?.user?.id)
    }
  });
  return {
    amount: balance?.amount || 0,
    locked: balance?.locked || 0
  }
}
// console.log(balance)

async function getOnRampTransactions() {
  const session = await getServerSession(authOptions);
  const txns = await prisma.onRamptransactions.findMany({
    where: {

      userId: Number(session?.user?.id)
    }
  });
  return txns.map(t => ({
    time: t.startTime,
    amount: t.amount,
    status: t.status,
    provider: t.provider
  }))
}

// eslint-disable-next-line react/display-name
export default async function () {
  const balance = await getBalance();
  const transactions = await getOnRampTransactions();

  return <div className="w-10xl">
    <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
      Transfer
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4 md:gap-10">
      <div>
        <AddMoney />
      </div>
      <div>
        <BalanceCard amount={balance.amount} locked={balance.locked} />
        <div className="pt-4">
          <OnRampTransactions transactions={transactions} />
        </div>
      </div>
    </div>
  </div>
}
