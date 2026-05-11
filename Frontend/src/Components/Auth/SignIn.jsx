import { Helmet } from "react-helmet-async";
import PasswordInput from "./PasswordInput";
import { getName } from "../../Service/GetAppName";

const SignIn = ({ onSwitch, userData, setUserData, handleSubmit }) => {
  const pageName = `Sign In | ${getName}`;
  return (
    <>
      <Helmet>
        <title>{pageName}</title>
      </Helmet>
      <div className="w-full">
        <div className="mb-7">
          <h2 className="text-[1.75rem] text-[#40514E] leading-tight mb-1 font-bold">
            Welcome back
          </h2>
          <p className="text-sm text-[#40514E]/50">Sign in to your account</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => handleSubmit(e)}>
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
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-[#11999E]/10 bg-white/75 backdrop-blur-md text-[#40514E] text-sm placeholder:text-[#40514E]/35 outline-none transition-all duration-300 focus:border-[#30E3CA] focus:ring-4 focus:ring-[#30E3CA]/15 focus:bg-white shadow-sm hover:border-[#11999E]/20"
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
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-1 flex items-center justify-center gap-2.5 py-3.5 bg-[#40514E] text-[#30E3CA] rounded-2xl text-sm font-semibold tracking-wide shadow-lg shadow-[#40514E]/25 hover:bg-[#2d3f3c] hover:-translate-y-px hover:shadow-xl hover:shadow-[#40514E]/30 active:translate-y-0 transition-all duration-200 group cursor-pointer"
          >
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
          </button>
        </form>

        <p className="text-center text-[0.82rem] text-[#40514E]/50 mt-5">
          Don't have an account?{" "}
          <button
            onClick={onSwitch}
            className="text-[#11999E] font-semibold hover:text-[#30E3CA] transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            Create one
          </button>
        </p>
      </div>
    </>
  );
};

export default SignIn;
