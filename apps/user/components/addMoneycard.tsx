"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
// import { useState } from "react";
import { TextInput } from "@repo/ui/textInput";
import CreateOnRampTractions from "../app/lib/actions/onRampTransactions";
import { motion, AnimatePresence } from "framer-motion";
import {  FaTimesCircle, FaSpinner } from "react-icons/fa";
import {  useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import successAnimation from "../public/animations/success.json";
import { useRef } from "react";

const SUPPORTED_BANKS = [
  { name: "HDFC Bank", redirectUrl: "https://netbanking.hdfcbank.com" },
  { name: "Axis Bank", redirectUrl: "https://www.axisbank.com/" },
];

export const AddMoney = () => {

  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
  const playerRef = useRef<any>(null);
  const successAnimationLength = 90;
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");

  const handleAddMoney = async () => {
    setStatus("processing");
    try {
      const res = await CreateOnRampTractions(provider, amount);
      if (res?.message.includes("Updated")) {
        setStatus("success");
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      } else {
        throw new Error("Something went wrong");
      }
    } catch {
      setStatus("failed");
    }
  };

  return (
    <Card title="Add Money">
      <div className="w-full">
        <TextInput
          label="Amount"
          placeholder="Amount"
          onChange={(value) => setAmount(value)}
        />
        <div className="py-4 text-left">Bank</div>
        <Select
          onSelect={(value) => {
            const selected = SUPPORTED_BANKS.find((x) => x.name === value);
            // setRedirectUrl(selected?.redirectUrl || "");
            setProvider(selected?.name || "");
          }}
          options={SUPPORTED_BANKS.map((x) => ({
            key: x.name,
            value: x.name,
          }))}
        />
        <div className="flex justify-center pt-4">
          <Button onClick={handleAddMoney}>Add Money</Button>
        </div>
      </div>

      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40 backdrop-blur-sm"
            onClick={() => setStatus("idle")}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center space-y-6 w-80 text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              {status === "processing" && (
                <>
                  <FaSpinner className="animate-spin text-blue-500 text-4xl" />
                  <p className="text-lg font-semibold text-blue-600">
                    Processing your payment...
                  </p>
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                    className="h-1 w-full bg-blue-400 rounded-full"
                  />
                </>
              )}
              {status === "success" && (
                <>
                  <Player
                    ref={playerRef}
                    autoplay
                    loop={false}
                    speed={0.9}
                    src={successAnimation}
                    style={{ height: 250, width: 450 }}
                    onEvent={(event) => {
                      if (event === "complete" && playerRef.current) {
                        playerRef.current.goToAndStop(
                          successAnimationLength,
                          true
                        );
                      }
                    }}
                  />
                  <p className="text-xl font-bold text-green-600">
                    Payment Successful!
                  </p>
                  <p className="text-sm text-gray-500">
                    Funds added to your wallet 🎉
                  </p>
                </>
              )}
              {status === "failed" && (
                <>
                  <FaTimesCircle className="text-red-500 text-5xl animate-pulse" />
                  <p className="text-xl font-bold text-red-600">
                    Payment Failed
                  </p>
                  <p className="text-sm text-gray-500">Please try again</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
