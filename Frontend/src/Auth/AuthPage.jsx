import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { getName } from "../Service/GetAppName";
import { signInFunc, signUpFunc } from "../Service/auth/auth";

const AuthPage = () => {
  const [view, setView] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);

  const isWeakPassword = (pw) => {
    const commonSequences = /1234|abcd|qwerty|112233|password/i;
    const hasLetter = /[a-zA-Z]/.test(pw);
    const isLongEnough = pw.length >= 8;
    return !hasLetter || !isLongEnough || commonSequences.test(pw);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // ── Validation ──────────────────────────────────────────────────────────
    if (!data.email || !data.password) {
      return toast.warn("Please fill in all fields.");
    }

    if (view === "signup") {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{9,}$/;
      if (!passwordRegex.test(data.password)) {
        return toast.error(
          "Signup requires 9+ chars, 1 uppercase, and 1 special char."
        );
      }
      if (data.password !== data.cpassword) {
        return toast.error("Passwords do not match!");
      }
    } else {
      if (isWeakPassword(data.password)) {
        return toast.error("Password is too weak. Must be 8+ chars with letters.");
      }
    }

    // ── API Call ─────────────────────────────────────────────────────────────
    setIsLoading(true);
    const toastId = toast.loading(
      view === "signin" ? "Signing in..." : "Creating account..."
    );

    try {
      // ✅ Actually call the function and await the result
      const response =
        view === "signup" ? await signUpFunc(data) : await signInFunc(data);

      // Tokens are in HttpOnly cookies — no localStorage needed.
      // response contains { user, ... } from sendResponse()
      toast.update(toastId, {
        render: `Welcome back, ${response.user?.name ?? response.user?.email}!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // TODO: store user info in global state (Redux / Zustand / Context) here
      // e.g. dispatch(setUser(response.user));

    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Authentication failed. Please try again.";
      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#40514E] overflow-hidden relative">
      <ToastContainer position="top-right" theme="colored" />

      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#30E3CA]/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-16 w-[380px] h-[380px] rounded-full bg-[#11999E]/15 blur-[80px] pointer-events-none" />

      <aside className="hidden lg:flex flex-col justify-between flex-[0_0_42%] px-14 py-14 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#30E3CA] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-[#40514E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="3" width="20" height="14" rx="3" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <span className="text-[#E4F9F5] text-lg font-bold tracking-tight">{getName}</span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <span className="flex items-center gap-2 text-[#30E3CA] text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-6">
            <span className="block w-7 h-0.5 bg-[#30E3CA] rounded" /> Inventory Management
          </span>
          <h1 className="text-[clamp(2.4rem,4vw,3.4rem)] leading-[1.08] text-[#E4F9F5] font-bold mb-5">
            Control your stock<br />
            with <span className="text-[#30E3CA] italic font-normal">clarity</span>
          </h1>
          <p className="text-sm leading-relaxed text-[#E4F9F5]/50 max-w-[300px]">
            A unified platform to track inventory, manage orders, and get real-time insights.
          </p>
        </div>
        <p className="text-[0.7rem] text-[#E4F9F5]/25 tracking-wide">© 2026 Inventra · All rights reserved</p>
      </aside>

      <main className="flex-1 flex items-center justify-center min-h-screen px-5 py-10 relative z-10">
        <div className="w-full max-w-[420px] bg-[#E4F9F5] rounded-[28px] p-10 shadow-2xl shadow-black/30 relative overflow-hidden">
          <div className="grid grid-cols-2 gap-1.5 bg-[#40514E]/8 rounded-2xl p-1.5 mb-8">
            <button
              onClick={() => setView("signin")}
              className={`py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 cursor-pointer border-none ${
                view === "signin" ? "bg-[#40514E] text-[#E4F9F5]" : "bg-transparent text-[#40514E]/40"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setView("signup")}
              className={`py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 cursor-pointer border-none ${
                view === "signup" ? "bg-[#40514E] text-[#E4F9F5]" : "bg-transparent text-[#40514E]/40"
              }`}
            >
              Sign Up
            </button>
          </div>

          {view === "signin" ? (
            <SignIn onSwitch={() => setView("signup")} handleSubmit={handleSubmit} isLoading={isLoading} />
          ) : (
            <SignUp onSwitch={() => setView("signin")} handleSubmit={handleSubmit} isLoading={isLoading} />
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthPage;