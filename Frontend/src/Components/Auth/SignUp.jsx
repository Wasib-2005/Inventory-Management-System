import { Helmet } from "react-helmet-async";
import PasswordInput from "./PasswordInput";
import { getName } from "../../Service/GetAppName";

const SignUp = ({ onSwitch, userData, setUserData, handleSubmit }) => {
    const pageName = `Sign Up | ${getName}`;
  
  return (
    <>
     <Helmet>
        <title>{pageName}</title>
      </Helmet>
      <div className="w-full">
        <div className="mb-7">
          <h2 className="text-[1.75rem] text-[#40514E] leading-tight mb-1 font-bold">
            Create account
          </h2>
          <p className="text-sm text-[#40514E]/50">
            Join us — it only takes a minute
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => handleSubmit(e)}>
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#40514E]">
              Full Name
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 w-4 h-4 text-[#40514E]/30 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <input
                name="username"
                type="text"
                placeholder="Jane Smith"
                autoComplete="name"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-[#11999E]/10 bg-white/75 backdrop-blur-md text-[#40514E] text-sm placeholder:text-[#40514E]/35 outline-none transition-all duration-300 focus:border-[#30E3CA] focus:ring-4 focus:ring-[#30E3CA]/15 focus:bg-white shadow-sm hover:border-[#11999E]/20"
              />
            </div>
          </div>

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

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#40514E]">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 w-4 h-4 text-[#40514E]/30 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.05 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
              </svg>
              <input
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                autoComplete="tel"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-[#11999E]/10 bg-white/75 backdrop-blur-md text-[#40514E] text-sm placeholder:text-[#40514E]/35 outline-none transition-all duration-300 focus:border-[#30E3CA] focus:ring-4 focus:ring-[#30E3CA]/15 focus:bg-white shadow-sm hover:border-[#11999E]/20"
              />
            </div>
          </div>

          {/* Password row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#40514E]">
                Password
              </label>
              <PasswordInput
                name="password"
                placeholder="••••••••"
                autoComplete="new-password"
                iconVariant="lock"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#40514E]">
                Confirm
              </label>
              <PasswordInput
                name="cpassword"
                placeholder="••••••••"
                autoComplete="new-password"
                iconVariant="check"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-1 flex items-center justify-center gap-2.5 py-3.5 bg-[#40514E] text-[#30E3CA] rounded-2xl text-sm font-semibold tracking-wide shadow-lg shadow-[#40514E]/25 hover:bg-[#2d3f3c] hover:-translate-y-px hover:shadow-xl hover:shadow-[#40514E]/30 active:translate-y-0 transition-all duration-200 group cursor-pointer"
          >
            <span>Create Account</span>
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
          Already have an account?{" "}
          <button
            onClick={onSwitch}
            className="text-[#11999E] font-semibold hover:text-[#30E3CA] transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  );
};

export default SignUp;
