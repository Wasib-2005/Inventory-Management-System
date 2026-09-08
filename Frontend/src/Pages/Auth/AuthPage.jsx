import { useState, useEffect, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignIn from "../../Components/Auth/SignIn";
import { signInFunc } from "../../Service/auth/auth";
import { useLocation, useNavigate } from "react-router";
import { UserContext } from "../../Contexts/UserContexts/UserContext";

const AuthPage = () => {
  const [view, setView] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser } = useContext(UserContext);

  const location = useLocation();
  const navigate = useNavigate();

  // 1. Identify where the user was trying to go.
  // If no previous page is found, default to home ('/').
  const from = location.state?.from?.pathname || "/";

  // 2. Effect to handle users who are already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const payload =
        view === "signin"
          ? {
              email: formData.email.trim().toLowerCase(),
              password: formData.password,
            }
          : { ...formData, email: formData.email.trim().toLowerCase() };

      const fn = view === "signin" ? signInFunc : "";
      const body = await fn(payload);

      // 3. Update state and notify user
      setUser(body.user);
      toast.success(
        view === "signin" ? "Signed in successfully!" : "Account created!",
      );

      // 4. Navigate immediately on success
      // 'replace: true' removes the login page from the history stack
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message ?? err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#effcf8] via-[#e8f7f5] to-[#d8eef0] flex items-center justify-center relative px-4 py-10">
      <div className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px] bg-[#1d9e75]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-[#287f91]/15 rounded-full blur-3xl" />
      <ToastContainer position="top-right" theme="colored" />

      <div className="w-full max-w-[1150px] min-h-[700px] rounded-[38px] overflow-hidden shadow-2xl shadow-[#287f91]/15 grid lg:grid-cols-2 backdrop-blur-xl bg-white/65 border border-white/80">
        {/* LEFT SIDE - Branding */}
        <div className="hidden lg:flex flex-col justify-between p-14 bg-gradient-to-br from-[#064e3b] via-[#0f6e56] to-[#155e75] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 bg-[#30E3CA] rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#11999E] rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6ee7b7] to-[#2dd4bf] flex items-center justify-center shadow-lg shadow-black/20">
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
                <h2 className="text-white text-2xl font-bold tracking-tight">
                  Inventra
                </h2>
                <p className="text-emerald-100/70 text-sm">
                  Inventory Management
                </p>
              </div>
            </div>
          </div>
          <div className="relative z-10">
              <span className="inline-flex items-center gap-2 text-emerald-200 uppercase tracking-[0.2em] text-xs font-semibold mb-7">
              <span className="w-8 h-[2px] bg-emerald-300" />
              Smart Dashboard
            </span>
            <h1 className="text-[4rem] leading-[1.05] font-bold text-white tracking-tight">
              Control your stock with clarity.
            </h1>
            <p className="mt-7 text-emerald-100/75 text-base leading-relaxed max-w-[420px]">
              Manage inventory, monitor sales, and track your entire business
              from one beautiful dashboard.
            </p>
          </div>
          <p className="relative z-10 text-emerald-100/50 text-sm">
            © 2026 Inventra. All rights reserved.
          </p>
        </div>

        {/* RIGHT SIDE - Forms */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            {/* Sign In Form Only */}
            <div className="animate-fadeIn">
              <SignIn onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
