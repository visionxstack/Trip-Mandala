import { useState, useEffect, useRef } from "react";
import { Camera, User, MapPin, Globe, BookOpen, Star, CheckCircle, Clock, Edit3, Save, X, Shield, Award, AlertTriangle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

const TABS = ["Profile", "Bookings", "Verification", "Stats"];

const PREFERENCE_OPTIONS = ["Trekking", "Culture", "Wildlife", "Spirituality", "Adventure", "Photography", "Food", "Festivals"];

const STATUS_COLORS = {
  confirmed: "bg-green-100 text-green-800",
  pending:   "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

function Avatar({ src, name, size = "lg" }) {
  const dim = size === "lg" ? "w-24 h-24 text-3xl" : "w-10 h-10 text-sm";
  if (src) return <img src={src} alt={name} className={`${dim} rounded-full object-cover ring-4 ring-white shadow-md`} />;
  const initials = (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-[#C4714A] to-[#8B3E1F] flex items-center justify-center text-white font-bold ring-4 ring-white shadow-md`}>
      {initials}
    </div>
  );
}

export default function AccountDashboard({ currentUser }) {
  usePageTitle("My Account | Trip Mandala");
  const navigate = useNavigate();
  const [tab, setTab]         = useState("Profile");
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [verif, setVerif]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm]       = useState({});
  const [msg, setMsg]         = useState("");
  const fileRef = useRef();

  useEffect(() => {
    if (!currentUser) { navigate("/auth"); return; }
    loadAll();
  }, [currentUser]);

  async function loadAll() {
    setLoading(true);
    try {
      const [prof, bks] = await Promise.allSettled([
        api.getMyProfile(),
        api.getBookings(),
      ]);
      if (prof.status === "fulfilled") { setProfile(prof.value); setForm(prof.value); }
      if (bks.status  === "fulfilled") setBookings(bks.value || []);

      if (currentUser?.role === "host") {
        try { const v = await api.getVerificationStatus(); setVerif(v); } catch {}
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await api.updateMyProfile({
        full_name:          form.full_name,
        bio:                form.bio,
        country:            form.country,
        travel_preferences: form.travel_preferences,
        phone:              form.phone,
      });
      setProfile(updated);
      setEditing(false);
      setMsg("Profile updated successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMsg("Image must be under 5 MB"); return; }
    if (!file.type.startsWith("image/")) { setMsg("Please select an image file"); return; }
    setAvatarUploading(true);
    try {
      const { url } = await api.uploadAvatar(file);
      await api.updateMyProfile({ profile_image_url: url });
      setProfile(p => ({ ...p, profile_image_url: url, avatar_url: url }));
      setMsg("Profile picture updated!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("Upload failed: " + e.message);
    } finally {
      setAvatarUploading(false);
    }
  }

  async function submitVerificationRequest() {
    try {
      const res = await api.submitVerificationRequest({ notes: "Requesting host verification." });
      setVerif(res);
      setMsg("Verification request submitted!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("Error: " + e.message);
    }
  }

  const togglePref = (pref) => {
    const curr = form.travel_preferences || [];
    setForm(f => ({
      ...f,
      travel_preferences: curr.includes(pref)
        ? curr.filter(p => p !== pref)
        : [...curr, pref]
    }));
  };

  if (!currentUser) return null;

  if (loading) return (
    <div className="flex justify-center items-center py-24 bg-[#FAF8F5] min-h-screen">
      <div className="w-10 h-10 border-4 border-dashed border-[#C4714A] border-t-transparent animate-spin rounded-full" />
    </div>
  );

  const avatarSrc = profile?.profile_image_url || profile?.avatar_url;
  const displayName = profile?.full_name || currentUser?.name || "User";
  const role = profile?.role || currentUser?.role;

  const totalSpend = bookings.filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + (b.total_amount || 0), 0);

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 mb-6 border-0 bg-transparent cursor-pointer">
          <ArrowLeft className="size-4" /> Back
        </button>

        {/* Header card */}
        <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 mb-6">
          <div className="flex items-end gap-5">
            <div className="relative">
              <Avatar src={avatarSrc} name={displayName} size="lg" />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#C4714A] text-white flex items-center justify-center border-2 border-white shadow cursor-pointer hover:bg-[#b05d38] transition-colors"
                title="Change photo"
              >
                {avatarUploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="size-3.5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-[#2C2C2C] text-xl">{displayName}</h1>
                {profile?.verified_host && (
                  <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    <CheckCircle className="size-3" /> Verified Host
                  </span>
                )}
                {profile?.women_led_verified && (
                  <span className="text-[10px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Women-Led</span>
                )}
              </div>
              <p className="text-sm text-neutral-500 mt-0.5 capitalize">{role} · {profile?.email || currentUser?.email}</p>
              {profile?.country && (
                <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                  <MapPin className="size-3" /> {profile.country}
                </p>
              )}
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <div className="font-bold text-lg text-[#C4714A]">{bookings.length}</div>
                <div className="text-[10px] text-neutral-500 uppercase font-semibold">Bookings</div>
              </div>
              <div>
                <div className="font-bold text-lg text-green-700">NPR {totalSpend.toLocaleString()}</div>
                <div className="text-[10px] text-neutral-500 uppercase font-semibold">Spent</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Message banner */}
        {msg && (
          <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {msg}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-neutral-100 shadow-sm w-fit">
          {TABS.filter(t => t !== "Verification" || role === "host").map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer border-0 transition-all ${tab === t ? "bg-[#C4714A] text-white shadow-sm" : "bg-transparent text-neutral-500 hover:text-neutral-800"}`}
            >{t}</button>
          ))}
        </div>

        {/* ── Profile tab ── */}
        {tab === "Profile" && (
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-semibold text-[#2C2C2C] text-base">Profile Information</h2>
              {!editing
                ? <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="gap-1.5 text-xs"><Edit3 className="size-3.5" /> Edit</Button>
                : <div className="flex gap-2">
                    <Button onClick={() => { setEditing(false); setForm(profile); }} variant="outline" size="sm" className="gap-1.5 text-xs"><X className="size-3.5" /> Cancel</Button>
                    <Button onClick={saveProfile} disabled={saving} size="sm" className="gap-1.5 text-xs bg-[#C4714A] hover:bg-[#b05d38] text-white">
                      {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="size-3.5" />}
                      Save
                    </Button>
                  </div>
              }
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name", key: "full_name", type: "text" },
                { label: "Country", key: "country", type: "text" },
                { label: "Phone", key: "phone", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">{label}</label>
                  {editing
                    ? <input type={type} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4714A]/30" />
                    : <p className="text-sm text-neutral-800">{profile?.[key] || <span className="text-neutral-400 italic">Not set</span>}</p>
                  }
                </div>
              ))}

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Bio</label>
                {editing
                  ? <textarea value={form.bio || ""} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4714A]/30 resize-none" />
                  : <p className="text-sm text-neutral-800">{profile?.bio || <span className="text-neutral-400 italic">No bio yet</span>}</p>
                }
              </div>

              {(role === "tourist" || editing) && (
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">Travel Interests</label>
                  {editing
                    ? <div className="flex flex-wrap gap-2">
                        {PREFERENCE_OPTIONS.map(p => (
                          <button key={p} type="button" onClick={() => togglePref(p)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all ${(form.travel_preferences || []).includes(p) ? "bg-[#C4714A] text-white border-[#C4714A]" : "bg-white text-neutral-600 border-neutral-200 hover:border-[#C4714A]"}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    : <div className="flex flex-wrap gap-2">
                        {(profile?.travel_preferences || []).length > 0
                          ? profile.travel_preferences.map(p => <span key={p} className="px-3 py-1 bg-[#C4714A]/10 text-[#C4714A] rounded-full text-xs font-semibold">{p}</span>)
                          : <span className="text-neutral-400 italic text-sm">No interests set</span>
                        }
                      </div>
                  }
                </div>
              )}
            </div>

            {/* Verification status row */}
            <div className="mt-5 pt-5 border-t border-neutral-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Account Status</h3>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 font-semibold px-3 py-1.5 rounded-full">
                  <CheckCircle className="size-3.5" /> Email Verified
                </span>
                {profile?.verified_host && (
                  <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-full">
                    <Shield className="size-3.5" /> Verified Host
                  </span>
                )}
                {profile?.women_led_verified && (
                  <span className="flex items-center gap-1.5 text-xs bg-pink-50 text-pink-700 font-semibold px-3 py-1.5 rounded-full">
                    <Award className="size-3.5" /> Women-Led Verified
                  </span>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* ── Bookings tab ── */}
        {tab === "Bookings" && (
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6">
            <h2 className="font-semibold text-[#2C2C2C] text-base mb-5">Booking History</h2>
            {bookings.length === 0
              ? <div className="text-center py-12 text-neutral-400">
                  <BookOpen className="size-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No bookings yet.</p>
                </div>
              : <div className="flex flex-col gap-3">
                  {bookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div>
                        <div className="font-semibold text-sm text-neutral-800">{b.homestay_id}</div>
                        <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                          <Clock className="size-3" /> {b.check_in} → {b.check_out}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-[#C4714A]">NPR {Number(b.total_amount || 0).toLocaleString()}</div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status] || "bg-neutral-100 text-neutral-600"}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </Card>
        )}

        {/* ── Verification tab (hosts only) ── */}
        {tab === "Verification" && role === "host" && (
          <Card className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="size-5 text-[#C4714A]" />
              <h2 className="font-semibold text-[#2C2C2C] text-base">Host Verification</h2>
            </div>

            {profile?.verified_host ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <CheckCircle className="size-12 text-green-600" />
                <p className="font-semibold text-green-800">You are a Verified Host!</p>
                <p className="text-sm text-neutral-500">Your listings get priority placement and a verified badge.</p>
              </div>
            ) : verif?.status === "pending" ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <Clock className="size-12 text-amber-500" />
                <p className="font-semibold text-amber-800">Verification Under Review</p>
                <p className="text-sm text-neutral-500">Our team will review your request shortly.</p>
                <p className="text-xs text-neutral-400">Submitted: {verif.created_at?.split("T")[0]}</p>
              </div>
            ) : verif?.status === "rejected" ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <AlertTriangle className="size-12 text-red-500" />
                <p className="font-semibold text-red-800">Verification Rejected</p>
                {verif.admin_notes && <p className="text-sm text-neutral-600 text-center max-w-xs">{verif.admin_notes}</p>}
                <Button onClick={submitVerificationRequest} className="bg-[#C4714A] hover:bg-[#b05d38] text-white text-sm mt-2">
                  Re-apply for Verification
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 gap-4">
                <Shield className="size-12 text-neutral-300" />
                <p className="font-semibold text-neutral-700">Get Verified as a Host</p>
                <p className="text-sm text-neutral-500 text-center max-w-sm">Verified hosts get priority placement, a badge on listings, and more bookings.</p>
                <Button onClick={submitVerificationRequest} className="bg-[#C4714A] hover:bg-[#b05d38] text-white text-sm">
                  Request Verification
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* ── Stats tab ── */}
        {tab === "Stats" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Bookings", value: bookings.length, icon: "📋", color: "text-neutral-800" },
              { label: "Confirmed Stays", value: bookings.filter(b => b.status === "confirmed" || b.status === "completed").length, icon: "✅", color: "text-green-700" },
              { label: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length, icon: "❌", color: "text-red-600" },
              { label: "Total Spend (NPR)", value: totalSpend.toLocaleString(), icon: "💰", color: "text-[#C4714A]" },
              { label: "Interests", value: (profile?.travel_preferences || []).length, icon: "🎯", color: "text-blue-700" },
              { label: "Account Role", value: role?.toUpperCase(), icon: "👤", color: "text-neutral-700" },
            ].map((s, i) => (
              <Card key={i} className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-5">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`font-bold text-xl ${s.color}`}>{s.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mt-1">{s.label}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
