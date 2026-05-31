import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Sparkles, User, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";
import TouristOnboarding from "../components/TouristOnboarding";

export default function Auth({ onLoginSuccess }) {
  usePageTitle("Login | Trip Mandala");
  const navigate = useNavigate();
  
  // Modes: "login", "signup", "otp", "forgot"
  const [mode, setMode] = useState("login");

  // Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tourist");
  const [otpToken, setOtpToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pendingUser, setPendingUser] = useState(null); // holds user while onboarding shows
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        const response = await api.login({ email, password });
        
        // Save token immediately so protected routes work
        localStorage.setItem("nepal_token", response.access_token);
        if (response.refresh_token) {
          localStorage.setItem("nepal_refresh", response.refresh_token);
        }
        
        // Backend now returns role/full_name at top level (with public.users fallback to JWT metadata)
        const user = {
          id:    response.user_id || response.user?.id,
          email: response.email  || response.user?.email || email,
          name:  response.full_name || response.user?.user_metadata?.full_name || email,
          role:  response.role  || response.user?.user_metadata?.role || "tourist",
        };
        localStorage.setItem("nepal_user", JSON.stringify(user));

        // Show onboarding for first-time tourists
        const onboardingDone = localStorage.getItem(`onboarding_done_${user.id}`);
        if (user.role === "tourist" && !onboardingDone) {
          setPendingUser(user);
          setShowOnboarding(true);
          return; // Don't navigate yet — wait for onboarding
        }

        onLoginSuccess(user);
        if (user.role === "admin") navigate("/admin");
        else if (user.role === "host") navigate("/host");
        else navigate("/");
      } 
      else if (mode === "signup") {
        await api.signup({ full_name: name, email, password, role });
        setSuccessMsg("Signup successful. Please enter the OTP sent to your email.");
        setMode("otp");
      }
      else if (mode === "otp") {
        await api.verifyOtp({ email, token: otpToken, type: "signup" });
        setSuccessMsg("Email verified! You can now log in.");
        setMode("login");
      }
      else if (mode === "forgot") {
        await api.forgotPassword(email);
        setSuccessMsg("If this email is registered, a reset OTP has been sent.");
        setMode("reset_otp");
      }
      else if (mode === "reset_otp") {
        await api.verifyOtp({ email, token: otpToken, type: "recovery" });
        setSuccessMsg("OTP Verified. Please enter your new password.");
        setMode("new_password");
      }
      else if (mode === "new_password") {
        await api.resetPassword({ email, new_password: password });
        setSuccessMsg("Password reset successfully. Please log in.");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    let title, desc;
    if (mode === "login") {
      title = "Welcome to Trip Mandala";
      desc = "Sign in to manage bookings, plans, and listings.";
    } else if (mode === "signup") {
      title = "Create your Account";
      desc = "Support local families and explore heritage tours.";
    } else if (mode === "otp") {
      title = "Verify your Email";
      desc = "Enter the One Time Password sent to your email.";
    } else if (mode === "forgot") {
      title = "Reset Password";
      desc = "Enter your email to receive a password reset link.";
    } else if (mode === "reset_otp") {
      title = "Verify Reset OTP";
      desc = "Enter the One Time Password sent to your email.";
    } else if (mode === "new_password") {
      title = "Create New Password";
      desc = "Enter your new password to secure your account.";
    }

    return (
      <div className="text-center flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-[#C26B4A]/10 text-[#C26B4A] flex justify-center items-center mb-2">
          <Sparkles className="size-6 text-[#C26B4A]" />
        </div>
        <h2 className="font-light text-[#2A2A2A] text-2xl tracking-tight">
          {title}
        </h2>
        <p className="text-[#6B6B6B] text-xs max-w-[280px] mx-auto">
          {desc}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-[#FAF8F5] text-neutral-950 w-full h-fit min-h-screen overflow-visible flex items-center justify-center py-16 px-12">
      <Card className="max-w-md w-full shadow-lg rounded-2xl bg-white border border-neutral-100 p-8 flex flex-col gap-6">
        {renderHeader()}

        {error && (
          <div className="bg-red-50 text-red-600 rounded-lg p-3 text-xs text-center font-medium">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-50 text-green-700 rounded-lg p-3 text-xs text-center font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-[#7A8466] tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-md border border-[#E0DDD8] bg-white text-sm pl-9 w-full h-10 text-neutral-900"
                  placeholder="Dawa Tamang" />
                <User className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {(mode === "login" || mode === "signup" || mode === "forgot" || mode === "otp" || mode === "reset_otp") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-[#7A8466] tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={mode === "otp" || mode === "reset_otp" || mode === "new_password"} // Don't allow changing email during OTP
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-md border border-[#E0DDD8] bg-white text-sm pl-9 w-full h-10 text-neutral-900 disabled:opacity-50"
                  placeholder="email@example.com" />
                <Mail className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {(mode === "otp" || mode === "reset_otp") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-[#7A8466] tracking-wider">Verification OTP</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  className="rounded-md border border-[#E0DDD8] bg-white text-sm pl-9 w-full h-10 text-neutral-900 tracking-widest font-mono"
                  placeholder="123456" />
                <Key className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {(mode === "login" || mode === "signup" || mode === "new_password") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-[#7A8466] tracking-wider">
                {mode === "new_password" ? "New Password" : "Password"}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-md border border-[#E0DDD8] bg-white text-sm pl-9 w-full h-10 text-neutral-900"
                  placeholder="••••••••" />
                <Lock className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-[10px] text-right text-[#C26B4A] hover:underline bg-transparent border-none cursor-pointer mt-1 font-semibold"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          )}

          {mode === "signup" && (
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-[10px] font-bold uppercase text-[#7A8466] tracking-wider mb-1">I am registering as a:</label>
              <div className="grid grid-cols-2 gap-2">
                {["tourist", "host"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`h-9 rounded-md border border-solid text-xs font-semibold uppercase transition-colors cursor-pointer ${
                      role === r
                        ? "bg-[#C26B4A] text-white border-[#C26B4A]"
                        : "bg-transparent text-neutral-600 border-neutral-300 hover:bg-[#FAF8F5]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="font-semibold text-white bg-[#C26B4A] hover:bg-[#a55233] rounded-lg mt-2 h-11 border-0 cursor-pointer w-full">
            {loading ? "Please wait..." : 
             mode === "login" ? "Sign In" : 
             mode === "signup" ? "Register" : 
             (mode === "otp" || mode === "reset_otp") ? "Verify OTP" :
             mode === "new_password" ? "Set New Password" : "Send Reset Link"}
          </Button>
        </form>

        <div className="text-center text-xs text-neutral-500 font-semibold mt-2">
          {mode === "login" ? "New to Trip Mandala? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setSuccessMsg("");
            }}
            className="text-[#C26B4A] hover:text-[#a55233] underline bg-transparent border-0 cursor-pointer font-bold">
            {mode === "login" ? "Register here" : "Sign in here"}
          </button>
        </div>
      </Card>

      {/* Tourist onboarding modal */}
      {showOnboarding && pendingUser && (
        <TouristOnboarding
          onComplete={(answers) => {
            // Mark onboarding as done for this user
            localStorage.setItem(`onboarding_done_${pendingUser.id}`, "true");
            setShowOnboarding(false);
            // Proceed to navigation
            onLoginSuccess(pendingUser);
            if (pendingUser.role === "admin") navigate("/admin");
            else if (pendingUser.role === "host") navigate("/host");
            else navigate("/");
          }}
          onSkip={() => {
            localStorage.setItem(`onboarding_done_${pendingUser.id}`, "true");
            setShowOnboarding(false);
            onLoginSuccess(pendingUser);
            if (pendingUser.role === "admin") navigate("/admin");
            else if (pendingUser.role === "host") navigate("/host");
            else navigate("/");
          }}
        />
      )}
    </div>
  );
}