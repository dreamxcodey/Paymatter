import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";
import { format } from "date-fns";
import { AddMoney } from "../../../components/addMoneycard";

async function getBalance() {
  const session = await getServerSession(authOptions);
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

async function getOnRampTransactions() {
  const session = await getServerSession(authOptions);
  const txns = await prisma.onRamptransactions.findMany({
    where: {
      userId: Number(session?.user?.id)
    },
    orderBy: {
      startTime: "desc"
    }
  });
  return txns.map(t => ({
    id: t.id,
    time: t.startTime,
    amount: t.amount,
    status: t.status,
    provider: t.provider,
    currency: "RUP"
  }))
}

export default async function TransferDashboard() {
  const balance = await getBalance();
  const transactions = await getOnRampTransactions();

  return (
    <div className="container min-w-300 mx-auto pt-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#6a51a6]">
            Money Transfer
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your funds and transactions
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Balance</p>
            <h2 className="text-2xl font-bold">
              ${(balance.amount + balance.locked).toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Add Money Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Add Money</h2>
              <p className="text-gray-600 text-sm">
                Fund your account using various payment methods
              </p>
            </div>
            <AddMoney />
            {/* Add your AddMoney form components here */}
            {/* <div className="space-y-4"> */}
            {/*   <div> */}
            {/*     <label className="block text-sm font-medium text-gray-700 mb-1"> */}
            {/*       Amount */}
            {/*     </label> */}
            {/*     <input */}
            {/*       type="number" */}
            {/*       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" */}
            {/*       placeholder="Enter amount" */}
            {/*     /> */}
            {/*   </div> */}
            {/*   <div> */}
            {/*     <label className="block text-sm font-medium text-gray-700 mb-1"> */}
            {/*       Payment Method */}
            {/*     </label> */}
            {/*     <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"> */}
            {/*       <option>Bank Transfer</option> */}
            {/*       <option>Credit Card</option> */}
            {/*       <option>PayPal</option> */}
            {/*     </select> */}
            {/*   </div> */}
            {/*   <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"> */}
            {/*     Add Money */}
            {/*   </button> */}
            {/* </div> */}
          </div>
        </div>

        {/* Balance and Transactions Section */}
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Your Balance</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Available</span>
                <span className="font-medium">${balance.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Locked</span>
                <span className="font-medium">${balance.locked.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(balance.amount + balance.locked).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <p className="text-gray-600 text-sm">
                Your last 5 on-ramp transactions
              </p>
            </div>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{txn.provider}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(txn.time), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {txn.currency} {txn.amount.toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${txn.status === "Success"
                        ? "bg-green-100 text-green-800"
                        : txn.status === "Processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                        }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length > 5 && (
                <button className="text-blue-600 text-sm font-medium hover:underline">
                  View all transactions
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Transaction History (Desktop only) */}
      <div className="mt-8 hidden lg:block">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <p className="text-gray-600 text-sm">
              Complete record of all your transactions
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(txn.time), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {txn.currency} {txn.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {txn.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${txn.status === "Success"
                        ? "bg-green-100 text-green-800"
                        : txn.status === "Processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                        }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
