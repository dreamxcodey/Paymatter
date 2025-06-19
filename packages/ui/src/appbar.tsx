"use client";
import { Button } from "./button";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user?: {
    name?: string | null;
  };
  onSignin: () => void;
  onSignout: () => void;
}

export default function Navbar({ user, onSignout, onSignin }: NavbarProps) {
  const router = useRouter();

  const isLoggedIn = !user?.name;
  console.log(isLoggedIn)

  return (
    <nav className="flex items-center justify-between px-8 py-4 border rounded-xl border-white  shadow-md">
      <div
        className="text-3xl font-extrabold text-gray-900 cursor-pointer"
        onClick={() => router.push("/")}
      >
        PayChey
      </div>
      <div className="flex px-4 py-2 bg-gradient-to-r from-blue-300 to-emerald-400 rounded-3xl font-medium justify-center">
        <Button onClick={isLoggedIn ? onSignout : onSignin}>
          {isLoggedIn ? "Logout" : "Login"}
        </Button>
      </div>
    </nav>
  );
}
