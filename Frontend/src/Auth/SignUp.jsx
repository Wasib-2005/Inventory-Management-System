const SignUp = ({ onSwitch, userData, setUserData, handleSubmit }) => {
  return (
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
              name="name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#40514E]/15 bg-white/70 text-[#40514E] text-sm placeholder:text-[#40514E]/30 outline-none focus:border-[#11999E] focus:ring-2 focus:ring-[#11999E]/15 focus:bg-white transition-all"
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
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#40514E]/15 bg-white/70 text-[#40514E] text-sm placeholder:text-[#40514E]/30 outline-none focus:border-[#11999E] focus:ring-2 focus:ring-[#11999E]/15 focus:bg-white transition-all"
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
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#40514E]/15 bg-white/70 text-[#40514E] text-sm placeholder:text-[#40514E]/30 outline-none focus:border-[#11999E] focus:ring-2 focus:ring-[#11999E]/15 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Password row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#40514E]">
              Password
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 w-4 h-4 text-[#40514E]/30 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="11" width="18" height="11" rx="3" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-9 pr-2 py-3 rounded-xl border border-[#40514E]/15 bg-white/70 text-[#40514E] text-sm placeholder:text-[#40514E]/30 outline-none focus:border-[#11999E] focus:ring-2 focus:ring-[#11999E]/15 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#40514E]">
              Confirm
            </label>
            <div className="relative flex items-center">
              <svg
                className="absolute left-3 w-4 h-4 text-[#40514E]/30 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="11" width="18" height="11" rx="3" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4M9 16l2 2 4-3" />
              </svg>
              <input
                name="cpassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full pl-9 pr-2 py-3 rounded-xl border border-[#40514E]/15 bg-white/70 text-[#40514E] text-sm placeholder:text-[#40514E]/30 outline-none focus:border-[#11999E] focus:ring-2 focus:ring-[#11999E]/15 focus:bg-white transition-all"
              />
            </div>
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
  );
};

export default SignUp;
