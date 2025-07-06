// app/sign-in/page.tsx or pages/sign-in.tsx depending on your setup
"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error("Additional steps required:", signInAttempt);
      }
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          Welcome Back
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white"
              placeholder="Enter email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={onSignInPress}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold mt-4"
          >
            Sign In
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don&apos;t have an account?
            <Link href="/sign-up" className="text-blue-400 font-semibold ml-1">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
