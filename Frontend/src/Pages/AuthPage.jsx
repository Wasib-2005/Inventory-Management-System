import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SignIn from "../Components/Auth/SignIn";
import SignUp from "../Components/Auth/SignUp";

const AuthPage = () => {
  const [view, setView] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    setTimeout(() => {
      toast.success(
        view === "signin"
          ? "Signed in successfully!"
          : "Account created successfully!",
      );

      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#E4F9F5] via-[#d9f8f3] to-[#c5f3eb] flex items-center justify-center relative px-4 py-10">
      {/* Glow blobs */}
      <div className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px] bg-[#30E3CA]/30 rounded-full blur-3xl" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-[#11999E]/20 rounded-full blur-3xl" />

      <ToastContainer position="top-right" theme="colored" />

      <div className="w-full max-w-[1150px] min-h-[700px] rounded-[38px] overflow-hidden shadow-2xl shadow-[#11999E]/15 grid lg:grid-cols-2 backdrop-blur-xl bg-white/40 border border-white/40">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-between p-14 bg-gradient-to-br from-[#40514E] to-[#2d3f3c] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 bg-[#30E3CA] rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#11999E] rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#30E3CA] to-[#11999E] flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="3" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>

              <div>
                <h2 className="text-[#E4F9F5] text-2xl font-bold tracking-tight">
                  Inventra
                </h2>

                <p className="text-[#E4F9F5]/50 text-sm">
                  Inventory Management
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-[#30E3CA] uppercase tracking-[0.2em] text-xs font-semibold mb-7">
              <span className="w-8 h-[2px] bg-[#30E3CA]" />
              Smart Dashboard
            </span>

            <h1 className="text-[4rem] leading-[1.05] font-bold text-[#E4F9F5] tracking-tight">
              Control your stock with clarity.
            </h1>

            <p className="mt-7 text-[#E4F9F5]/60 text-base leading-relaxed max-w-[420px]">
              Manage inventory, monitor sales, and track your entire business
              from one beautiful dashboard.
            </p>
          </div>

          <p className="relative z-10 text-[#E4F9F5]/30 text-sm">
            © 2026 Inventra. All rights reserved.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            {/* Tabs */}
            <div className="grid grid-cols-2 bg-[#40514E]/5 p-1.5 rounded-2xl mb-8">
              <button
                onClick={() => setView("signin")}
                className={`py-3 rounded-xl font-semibold transition-all duration-300 ${
                  view === "signin"
                    ? "bg-gradient-to-r from-[#11999E] to-[#30E3CA] text-white shadow-lg"
                    : "text-[#40514E]/45 hover:text-[#40514E]"
                }`}
              >
                Sign In
              </button>

              <button
                onClick={() => setView("signup")}
                className={`py-3 rounded-xl font-semibold transition-all duration-300 ${
                  view === "signup"
                    ? "bg-gradient-to-r from-[#11999E] to-[#30E3CA] text-white shadow-lg"
                    : "text-[#40514E]/45 hover:text-[#40514E]"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Forms */}
            <div className="animate-fadeIn">
              {view === "signin" ? (
                <SignIn
                  onSwitch={() => setView("signup")}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              ) : (
                <SignUp
                  onSwitch={() => setView("signin")}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
