import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Compass,
  Home,
  MapPin,
  User,
  LogOut,
  Activity } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { markSessionStart, clearUserCache, prefetchUserData } from "./services/apiClient";

// Page Imports
import Explore from "./pages/Explore";
import Planner from "./pages/Planner";
import Homestays from "./pages/Homestays";
import StoryMode from "./pages/StoryMode";
import Booking from "./pages/Booking";
import HostDashboard from "./pages/HostDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import AccountDashboard from "./pages/AccountDashboard";
import GoogleTranslate from "./components/GoogleTranslate";

function MainAppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("nepal_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("nepal_user", JSON.stringify(user));
    // Mark session active so cache kicks in for this tab session
    const uid = user?.user_id || user?.id;
    if (uid) {
      markSessionStart(uid);
      prefetchUserData(uid); // fire-and-forget prefetch
    }
  };

  const handleLogout = () => {
    const uid = currentUser?.user_id || currentUser?.id;
    clearUserCache(uid); // wipe all user-scoped localStorage cache
    setCurrentUser(null);
    localStorage.removeItem("nepal_user");
    localStorage.removeItem("nepal_token");
    navigate("/");
  };

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-[#FAF8F5] text-neutral-950 w-full min-h-screen flex flex-col overflow-visible">
      {/* Navigation Bar */}
      <nav className="border-neutral-200/60 border-t-0 border-r-0 border-b border-l-0 border-solid flex px-12 py-4 justify-between items-center w-full bg-white z-50 sticky top-0 shadow-sm">
        <Link to="/" className="flex items-center gap-2 no-underline text-neutral-950 cursor-pointer">
          <img src="/logo.png" className="w-7 h-7 object-contain" alt="Trip Mandala Logo" />
          <span className="font-semibold text-[#2C2C2C] text-lg tracking-tight">
            Trip Mandala
          </span>
        </Link>
        
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm flex pb-0.5 items-center gap-1.5 cursor-pointer no-underline font-medium transition-colors ${
            isActive("/") ?
            "text-[#C4714A] border-[#C4714A] border-t-0 border-r-0 border-b-2 border-l-0 border-solid" :
            "text-[#4A4A4A] hover:text-[#C4714A]"}`
            }>
            
            <Compass className="size-3.5" />
            Explore
          </Link>
          <Link
            to="/homestays"
            className={`text-sm flex pb-0.5 items-center gap-1.5 cursor-pointer no-underline font-medium transition-colors ${
            isActive("/homestays") ?
            "text-[#C4714A] border-[#C4714A] border-t-0 border-r-0 border-b-2 border-l-0 border-solid" :
            "text-[#4A4A4A] hover:text-[#C4714A]"}`
            }>
            
            <MapPin className="size-3.5" />
            Homestays
          </Link>
          <Link
            to="/stories"
            className={`text-sm flex pb-0.5 items-center gap-1.5 cursor-pointer no-underline font-medium transition-colors ${
            isActive("/stories") ?
            "text-[#C4714A] border-[#C4714A] border-t-0 border-r-0 border-b-2 border-l-0 border-solid" :
            "text-[#4A4A4A] hover:text-[#C4714A]"}`
            }>
            
            <BookOpen className="size-3.5" />
            Stories
          </Link>
          <Link
            to="/plan"
            className={`text-sm flex pb-0.5 items-center gap-1.5 cursor-pointer no-underline font-medium transition-colors ${
            isActive("/plan") ?
            "text-[#C4714A] border-[#C4714A] border-t-0 border-r-0 border-b-2 border-l-0 border-solid" :
            "text-[#4A4A4A] hover:text-[#C4714A]"}`
            }>
            
            <Home className="size-3.5" />
            Plan a Trip
          </Link>
          {currentUser && (currentUser.role === "host" || currentUser.role === "admin") &&
          <Link
            to={currentUser.role === "host" ? "/host" : "/admin"}
            className={`text-sm flex pb-0.5 items-center gap-1.5 cursor-pointer no-underline font-medium transition-colors ${
            isActive("/host") || isActive("/admin") ?
            "text-[#C4714A] border-[#C4714A] border-t-0 border-r-0 border-b-2 border-l-0 border-solid" :
            "text-[#4A4A4A] hover:text-[#C4714A]"}`
            }>
            
              {currentUser.role === "admin" ?
            <>
                  <Activity className="size-3.5" />
                  Admin Portal
                </> :

            <>
                  <User className="size-3.5" />
                  Host Portal
                </>
            }
            </Link>
          }
        </div>

        {/* User Account / CTA */}
        <div className="flex items-center gap-4">
          <GoogleTranslate />
          {currentUser ?
          <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/account")}
                className="flex items-center gap-2 hover:bg-neutral-50 rounded-lg px-2 py-1.5 transition-colors border-0 bg-transparent cursor-pointer"
                title="My Account"
              >
                {(currentUser.avatar_url || currentUser.profile_image_url) ? (
                  <img src={currentUser.avatar_url || currentUser.profile_image_url} alt="avatar"
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-[#C4714A]/30" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C4714A] to-[#8B3E1F] flex items-center justify-center text-white text-[10px] font-bold">
                    {(currentUser.name || currentUser.full_name || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold text-neutral-800 leading-none">{currentUser.name || currentUser.full_name}</span>
                  <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">{currentUser.role}</span>
                </div>
              </button>
              <button
              onClick={handleLogout}
              className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900 border-0 bg-transparent cursor-pointer flex items-center justify-center"
              title="Sign Out">
              
                <LogOut className="size-4" />
              </button>
            </div> :

          <Button
            onClick={() => navigate("/auth")}
            className="font-medium rounded-lg bg-[#C4714A] hover:bg-[#b05d38] text-white text-sm px-5 h-9">
            
              Get Started
            </Button>
          }
        </div>
      </nav>

      {/* Main Pages Router View */}
      <main className="flex-1 flex flex-col relative">
        <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-1 duration-500 flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Explore currentUser={currentUser} onLogout={handleLogout} />} />
            <Route path="/plan" element={<Planner />} />
            <Route path="/homestays" element={<Homestays />} />
            <Route path="/stories" element={<StoryMode />} />
            <Route path="/checkout/:id" element={<Booking currentUser={currentUser} />} />
            <Route path="/host" element={<HostDashboard currentUser={currentUser} />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/account" element={<AccountDashboard currentUser={currentUser} />} />
            <Route path="/auth" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
          </Routes>
        </div>
      </main>

      {/* Platform Footer */}
      <footer className="bg-[#EDEBE7] flex px-12 py-8 justify-between items-center border-t border-solid border-[#D9D4CC] flex-col sm:flex-row gap-6 mt-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="w-5 h-5 object-contain" alt="Trip Mandala Logo" />
          <span className="font-medium text-[#2C2C2C] text-sm">
            Trip Mandala
          </span>
          <span className="text-[#6B6B6B] text-xs ml-3">
            © 2026 · Kathmandu, Nepal
          </span>
        </div>
        
        {/* Helper Quick Jump links */}
        <div className="text-[#4A4A4A] text-[13px] flex items-center gap-6 flex-wrap justify-center">
          <Link to="/" className="no-underline text-inherit hover:underline">About</Link>
          <Link to="/homestays" className="no-underline text-inherit hover:underline">Marketplace</Link>
          <Link to="/stories" className="no-underline text-inherit hover:underline">Heritage mode</Link>
          <Link to="/plan" className="no-underline text-inherit hover:underline">AI Planner</Link>
          <Link to="/auth" className="no-underline text-inherit hover:underline font-bold text-[#C4714A]">Demo Login</Link>
        </div>
      </footer>
    </div>);

}

export default function App() {
  return (
    <Router>
      <MainAppShell />
    </Router>);

}