import { useState } from "react";
import { Helmet } from "react-helmet-async";
import PasswordInput from "../Common/PasswordInput";
import { useGetName } from "../../Hooks/userGetAppName";

const INITIAL = { email: "", password: "" };

const SignIn = ({ onSwitch, onSubmit, isLoading }) => {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    // Hand validated data up — AuthPage does the API call
    onSubmit(form);
  };

  return (
    <>
      <Helmet>
        <title>{`Sign In | ${useGetName}`}</title>
      </Helmet>

      <div className="w-full">
        <div className="mb-7">
          <h2 className="text-[1.75rem] text-[#40514E] leading-tight mb-1 font-bold">
            Welcome back
          </h2>
          <p className="text-sm text-[#40514E]/50">Sign in to your account</p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#40514E]">
              Email
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 w-4 h-4 text-[#40514E]/30 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m2 7 10 6 10-6" />
              </svg>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-[#11999E]/10 bg-white/75 backdrop-blur-md text-[#40514E] text-sm placeholder:text-[#40514E]/35 outline-none transition-all duration-300 focus:border-[#30E3CA] focus:ring-4 focus:ring-[#30E3CA]/15 focus:bg-white shadow-sm hover:border-[#11999E]/20 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="flex justify-between items-center text-[0.7rem] font-semibold uppercase tracking-widest text-[#40514E]">
              Password
              <a
                href="#"
                className="text-[#11999E] text-[0.72rem] font-medium normal-case tracking-normal hover:text-[#30E3CA] transition-colors"
              >
                Forgot?
              </a>
            </label>
            <PasswordInput
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              iconVariant="lock"
              value={form.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Inline error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 flex items-center justify-center gap-2.5 py-3.5 bg-[#40514E] text-[#30E3CA] rounded-2xl text-sm font-semibold tracking-wide shadow-lg shadow-[#40514E]/25 hover:bg-[#2d3f3c] hover:-translate-y-px hover:shadow-xl hover:shadow-[#40514E]/30 active:translate-y-0 transition-all duration-200 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default SignIn;
