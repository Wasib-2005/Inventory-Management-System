import { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { getName } from "../Service/GetAppName";

const AuthPage = () => {
  const [view, setView] = useState("signin");

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const data = Object.fromEntries(formData.entries());

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{9,}$/;

    console.log("Form Data Submitted:", data);

    if (view === "signup") {
      if (view === "signup") {
        if (!passwordRegex.test(data.password) || data.password !== data.cpassword) {
          alert(
            "Password must be more than 8 characters and include at least one uppercase letter and one special character.",
          );
          return; 
        }

        console.log("Validation passed! Sending to signup API...", data);
        // Proceed with your API call here
      } else {
        // Logic for sign-in (usually less strict on the frontend)
        console.log("Signing in...", data);
      }
    }
  };

  const [userData, setUserData] = useState({});

  return (
    <div className="min-h-screen flex bg-[#40514E] overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#30E3CA]/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-16 w-[380px] h-[380px] rounded-full bg-[#11999E]/15 blur-[80px] pointer-events-none" />

      {/* ── Left brand panel ── */}
      <aside className="hidden lg:flex flex-col justify-between flex-[0_0_42%] px-14 py-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#30E3CA] rounded-xl flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#40514E]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <rect x="2" y="3" width="20" height="14" rx="3" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <span className="text-[#E4F9F5] text-lg font-bold tracking-tight">
            {getName}
          </span>
        </div>

        {/* Headline */}
        <div className="flex-1 flex flex-col justify-center">
          <span className="flex items-center gap-2 text-[#30E3CA] text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-6">
            <span className="block w-7 h-0.5 bg-[#30E3CA] rounded" />
            Inventory Management
          </span>

          <h1 className="text-[clamp(2.4rem,4vw,3.4rem)] leading-[1.08] text-[#E4F9F5] font-bold mb-5">
            Control your stock
            <br />
            with{" "}
            <span className="text-[#30E3CA] italic font-normal">clarity</span>
          </h1>

          <p className="text-sm leading-relaxed text-[#E4F9F5]/50 max-w-[300px]">
            A unified platform to track inventory, manage orders, and get
            real-time insights — all in one place.
          </p>

          {/* Feature chips */}
          <div className="flex flex-col gap-3 mt-10">
            {[
              {
                icon: (
                  <>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </>
                ),
                title: "Real-time tracking",
                sub: "Monitor stock levels as they change",
              },
              {
                icon: (
                  <>
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                  </>
                ),
                title: "Multi-warehouse",
                sub: "Manage multiple locations effortlessly",
              },
              {
                icon: (
                  <>
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </>
                ),
                title: "Smart analytics",
                sub: "Actionable reports at your fingertips",
              },
            ].map(({ icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-[#30E3CA]/10 backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-[#30E3CA]/12 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-[#30E3CA]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    {icon}
                  </svg>
                </div>
                <div>
                  <p className="text-[0.8rem] font-medium text-[#E4F9F5]">
                    {title}
                  </p>
                  <p className="text-[0.74rem] text-[#E4F9F5]/50">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[0.7rem] text-[#E4F9F5]/25 tracking-wide">
          © 2026 Inventra · All rights reserved
        </p>
      </aside>

      {/* ── Right form panel ── */}
      <main className="flex-1 flex items-center justify-center min-h-screen px-5 py-10 relative z-10">
        <div className="w-full max-w-[420px] bg-[#E4F9F5] rounded-[28px] p-10 shadow-2xl shadow-black/30 relative overflow-hidden">
          {/* Card glow accent */}
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[#11999E]/10 blur-2xl pointer-events-none" />

          {/* Tab switcher */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#40514E]/8 rounded-2xl p-1.5 mb-8">
            <button
              onClick={() => setView("signin")}
              className={`py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 cursor-pointer border-none ${
                view === "signin"
                  ? "bg-[#40514E] text-[#E4F9F5] shadow-md shadow-[#40514E]/25"
                  : "bg-transparent text-[#40514E]/40 hover:text-[#40514E]/70"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setView("signup")}
              className={`py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 cursor-pointer border-none ${
                view === "signup"
                  ? "bg-[#40514E] text-[#E4F9F5] shadow-md shadow-[#40514E]/25"
                  : "bg-transparent text-[#40514E]/40 hover:text-[#40514E]/70"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form swap */}
          {view === "signin" ? (
            <SignIn
              onSwitch={() => {
                setView("signup");
              }}
              userData={userData}
              setUserData={setUserData}
              handleSubmit={handleSubmit}
            />
          ) : (
            <SignUp
              onSwitch={() => setView("signin")}
              userData={userData}
              setUserData={setUserData}
              handleSubmit={handleSubmit}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
