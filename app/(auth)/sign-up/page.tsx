// app/sign-up/page.tsx (if using App Router) or pages/sign-up.tsx (for Pages Router)
"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({ emailAddress, password });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err) {
      console.error("Sign-up error:", err);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/");
      } else {
        console.error("Verification incomplete:", completeSignUp);
      }
    } catch (err) {
      console.error("Verification error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          {pendingVerification ? "Verify Your Email" : "Create Account"}
        </h1>

        {pendingVerification ? (
          <>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your verification code"
              className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white mb-4"
            />
            <button
              onClick={onVerifyPress}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
            >
              Verify Email
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Enter email"
                className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white"
              />
            </div>

            <button
              onClick={onSignUpPress}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
            >
              Create Account
            </button>

            <div className="text-center mt-6 text-gray-400">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-400 font-semibold">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
