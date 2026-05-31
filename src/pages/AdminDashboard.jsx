import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Users, Compass, ArrowUpRight, MapPin, Activity, Shield, BookOpen, Search, Heart, AlertTriangle, CheckCircle, XCircle, Clock, Trash2, UserCheck, Ban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { api } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";

const COLORS = ["#B5532A", "#7A8454", "#C26B4A", "#9C7330", "#5F7A3D", "#A38F75"];
const TABS = ["Overview", "Intelligence", "Trust & Safety", "Heritage", "Impact", "Users", "Verification"];

// ─── Scam Reports Component ─────────────────────────────────────
function ScamReportsTable() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const load = async () => {
    setLoading(true);
    try { setReports(await api.adminGetScamReports("")); }
    catch (e) { flash("Error: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleReview = async (id, status, impact) => {
    try {
      await api.adminReviewScamReport(id, { status, trust_score_impact: impact, admin_notes: "Reviewed via dashboard" });
      flash(`Report marked as ${status}`);
      load();
    } catch (e) { flash("Error: " + e.message); }
  };

  const handleDeleteHomestay = async (homestayId) => {
    if (!confirm("Delete this homestay from the platform? This cannot be undone.")) return;
    try {
      await api.deleteHomestay(homestayId);
      flash("Homestay deleted successfully.");
      load();
    } catch (e) { flash("Error deleting homestay: " + e.message); }
  };

  if (loading) return <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-[#B5532A] border-t-transparent animate-spin rounded-full"></div></div>;

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-[#2A2A2A] text-lg mb-4 flex items-center gap-2"><AlertTriangle className="size-5 text-red-500" /> Pending & Resolved Reports</h3>
      {msg && <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{msg}</div>}
      
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-neutral-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="font-semibold uppercase text-neutral-500 text-[10px] tracking-wider border-b border-[#EFE9DF] bg-neutral-50/50">
              <th className="py-3 pl-6 pr-4">Target (Homestay ID)</th>
              <th className="py-3 pr-4">Reporter ID</th>
              <th className="py-3 pr-4">Type & Description</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE9DF]">
            {reports.length === 0 ? (
              <tr><td colSpan={5} className="py-6 text-center text-sm text-neutral-500">No reports found.</td></tr>
            ) : reports.map(r => (
              <tr key={r.id} className="text-xs hover:bg-neutral-50 transition-colors">
                <td className="py-4 pl-6 pr-4 font-medium text-neutral-800">{r.target_id}</td>
                <td className="py-4 pr-4 text-neutral-500">{r.reporter_id}</td>
                <td className="py-4 pr-4 max-w-xs">
                  <div className="font-semibold text-[#B5532A] capitalize mb-1">{r.report_type.replace('_', ' ')}</div>
                  <div className="text-neutral-600 truncate" title={r.description}>{r.description}</div>
                </td>
                <td className="py-4 pr-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    r.status === "resolved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>{r.status}</span>
                </td>
                <td className="py-4 pr-6 flex items-center gap-2">
                  {r.status !== "resolved" && (
                    <button onClick={() => handleReview(r.id, "resolved", -5)} className="px-2.5 py-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold cursor-pointer">Resolve & Warn (-5 trust)</button>
                  )}
                  {r.status !== "dismissed" && (
                    <button onClick={() => handleReview(r.id, "dismissed", 0)} className="px-2.5 py-1.5 rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-semibold cursor-pointer">Dismiss</button>
                  )}
                  {r.target_type === "homestay" && (
                    <button onClick={() => handleDeleteHomestay(r.target_id)} className="px-2.5 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold cursor-pointer flex items-center gap-1">
                      <Trash2 className="size-3" /> Delete Stay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── User Management Tab ────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRole]   = useState("");
  const [statusFilter, setStatus] = useState("");
  const [msg, setMsg]           = useState("");

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.adminListUsers({ role: roleFilter, search, account_status: statusFilter });
      setUsers(data);
    } catch (e) { flash("Error: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [roleFilter, statusFilter]);

  const action = async (fn, successMsg) => {
    try { await fn(); flash(successMsg); load(); }
    catch (e) { flash("Error: " + e.message); }
  };

  const ROLE_COLORS = { admin: "bg-purple-100 text-purple-800", host: "bg-blue-100 text-blue-800", tourist: "bg-green-100 text-green-800" };
  const STATUS_COLORS = { active: "bg-green-100 text-green-700", suspended: "bg-amber-100 text-amber-700", deleted: "bg-red-100 text-red-700" };

  return (
    <div>
      {msg && <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{msg}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && load()}
          placeholder="Search name or email…"
          className="border border-neutral-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-[#B5532A]/20"
        />
        {[["All Roles", ""], ["Tourists", "tourist"], ["Hosts", "host"], ["Admins", "admin"]].map(([label, val]) => (
          <button key={val} onClick={() => setRole(val)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
              roleFilter === val ? "bg-[#B5532A] text-white border-[#B5532A]" : "bg-white text-neutral-600 border-neutral-200 hover:border-[#B5532A]"
            }`}>{label}</button>
        ))}
        {[["All Status", ""], ["Active", "active"], ["Suspended", "suspended"]].map(([label, val]) => (
          <button key={val} onClick={() => setStatus(val)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
              statusFilter === val ? "bg-neutral-800 text-white border-neutral-800" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
            }`}>{label}</button>
        ))}
        <button onClick={load} className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 cursor-pointer">Search</button>
      </div>

      {/* Country Demographics */}
      {!loading && users.length > 0 && (
        <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
          {Object.entries(users.reduce((acc, u) => {
            const c = u.country || "Unknown";
            acc[c] = (acc[c] || 0) + 1;
            return acc;
          }, {})).sort((a,b) => b[1] - a[1]).map(([country, count]) => (
            <div key={country} className="bg-white border border-neutral-200 rounded-lg px-4 py-2 flex flex-col min-w-[120px] shadow-sm">
              <span className="text-[10px] text-neutral-500 font-semibold uppercase">{country}</span>
              <span className="text-lg font-bold text-[#B5532A]">{count}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-dashed border-[#B5532A] border-t-transparent animate-spin rounded-full" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="font-semibold uppercase text-neutral-500 text-[10px] tracking-wider border-b border-[#EFE9DF]">
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Verified</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DF]">
              {users.map(u => (
                <tr key={u.id} className="text-xs hover:bg-neutral-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-neutral-800">{u.full_name || "—"}</div>
                    <div className="text-neutral-400 mt-0.5">{u.email}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${ROLE_COLORS[u.role] || "bg-neutral-100 text-neutral-600"}`}>{u.role}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${STATUS_COLORS[u.account_status || "active"]}`}>{u.account_status || "active"}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-1">
                      {u.verified_host && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Host</span>}
                      {u.women_led_verified && <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-bold">W-Led</span>}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {u.role === "host" && (
                        <button onClick={() => action(() => api.adminVerifyHost(u.id, !u.verified_host), u.verified_host ? "Host unverified" : "Host verified!")}
                          title={u.verified_host ? "Unverify host" : "Verify host"}
                          className={`p-1.5 rounded cursor-pointer border-0 transition-colors ${u.verified_host ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-neutral-100 text-neutral-600 hover:bg-blue-100 hover:text-blue-700"}`}>
                          <UserCheck className="size-3.5" />
                        </button>
                      )}
                      {u.role === "host" && (
                        <button onClick={() => action(() => api.adminVerifyWomenLed(u.id, !u.women_led_verified), u.women_led_verified ? "Women-led removed" : "Women-led verified!")}
                          title={u.women_led_verified ? "Remove women-led" : "Verify women-led"}
                          className={`p-1.5 rounded cursor-pointer border-0 transition-colors ${u.women_led_verified ? "bg-pink-100 text-pink-700 hover:bg-pink-200" : "bg-neutral-100 text-neutral-600 hover:bg-pink-100 hover:text-pink-700"}`}>
                          <Shield className="size-3.5" />
                        </button>
                      )}
                      {u.account_status !== "suspended" ? (
                        <button onClick={() => action(() => api.adminSetUserStatus(u.id, "suspended"), "User suspended")}
                          title="Suspend user" className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 cursor-pointer border-0">
                          <Ban className="size-3.5" />
                        </button>
                      ) : (
                        <button onClick={() => action(() => api.adminSetUserStatus(u.id, "active"), "User restored")}
                          title="Restore user" className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer border-0">
                          <CheckCircle className="size-3.5" />
                        </button>
                      )}
                      <button onClick={() => { if (confirm(`Delete ${u.full_name || u.email}? This is irreversible.`)) action(() => api.adminDeleteUser(u.id), "User deleted"); }}
                        title="Delete user" className="p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer border-0">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center py-8 text-neutral-400 text-sm">No users found.</p>}
        </div>
      )}
    </div>
  );
}

// ─── Verification Requests Tab ──────────────────────────────────
function VerificationTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("pending");
  const [msg, setMsg]           = useState("");

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const load = async () => {
    setLoading(true);
    try { setRequests(await api.adminListVerificationRequests(filter)); }
    catch (e) { flash("Error: " + e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const review = async (id, action) => {
    try { await api.adminReviewVerificationRequest(id, action); flash(`Request ${action}d!`); load(); }
    catch (e) { flash("Error: " + e.message); }
  };

  const STATUS_ICON = { pending: <Clock className="size-4 text-amber-500" />, approved: <CheckCircle className="size-4 text-green-600" />, rejected: <XCircle className="size-4 text-red-500" /> };

  return (
    <div>
      {msg && <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${msg.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{msg}</div>}

      <div className="flex gap-2 mb-5">
        {["pending", "approved", "rejected", ""].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all ${
              filter === s ? "bg-[#B5532A] text-white border-[#B5532A]" : "bg-white text-neutral-600 border-neutral-200 hover:border-[#B5532A]"
            }`}>{s || "All"}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-dashed border-[#B5532A] border-t-transparent animate-spin rounded-full" /></div>
      ) : requests.length === 0 ? (
        <p className="text-center py-12 text-neutral-400 text-sm">No verification requests.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map(r => {
            const host = r.users || {};
            return (
              <Card key={r.id} className="bg-white border border-neutral-100 shadow-sm rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {STATUS_ICON[r.status]}
                    <div>
                      <div className="font-semibold text-sm text-neutral-800">{host.full_name || host.email || r.host_id}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">Submitted: {r.created_at?.split("T")[0]}</div>
                      {r.notes && <div className="text-xs text-neutral-500 mt-1">{r.notes}</div>}
                    </div>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => review(r.id, "approve")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 cursor-pointer border-0">
                        <CheckCircle className="size-3.5" /> Approve
                      </button>
                      <button onClick={() => review(r.id, "reject")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 cursor-pointer border-0">
                        <XCircle className="size-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  usePageTitle("Admin Dashboard | Trip Mandala");
  const [data, setData] = useState(null);
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analyticsRes, intelRes] = await Promise.allSettled([
          api.getAdminAnalytics(),
          api.getIntelligenceDashboard(),
        ]);
        if (analyticsRes.status === "fulfilled") setData(analyticsRes.value);
        if (intelRes.status === "fulfilled") setIntel(intelRes.value);
      } catch (err) {
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-20 bg-[#FAF8F5] min-h-screen">
      <div className="w-10 h-10 border-4 border-dashed border-[#B5532A] border-t-transparent animate-spin rounded-full" />
    </div>
  );

  if (error || !data) return (
    <div className="text-center py-20 text-red-500 bg-[#FAF8F5] min-h-screen">{error || "Could not load analytics."}</div>
  );

  const { summary, booking_trends, destinations_ranking, low_tourism_insights } = data;
  const payoutData = [
    { name: "Host Income", value: summary.host_earnings_usd },
    { name: "Platform Fee", value: summary.platform_fee_revenue_usd },
  ];

  return (
    <div className="bg-[#FAF8F5] text-neutral-950 w-full min-h-screen">
      <div className="max-w-[1200px] mx-auto px-12 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-[#B5532A]" />
            <span className="font-semibold text-xs tracking-wider uppercase text-[#B5532A]">Platform Administration</span>
          </div>
          <h1 className="font-light text-[#2A2A2A] text-[28px] tracking-tight mt-1">Tourism Intelligence Center</h1>
          <p className="text-[#6B6B6B] text-[15px] mt-1">Real-time platform monitoring, heritage analytics, trust, and community impact.</p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 border border-neutral-100 shadow-sm w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer border-0 transition-all ${
                activeTab === tab ? "bg-[#B5532A] text-white shadow-sm" : "bg-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── TAB: Overview ─────────────────────────────── */}
        {activeTab === "Overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8 gap-6">
              {[
                { label: "Total Bookings", value: summary.total_bookings, sub: "+18% growth", icon: <Users className="size-5" />, bg: "bg-neutral-100", color: "text-neutral-600" },
                { label: "Gross Booking Volume", value: `NPR ${summary.total_revenue_usd.toLocaleString()}`, sub: "+22% monthly", icon: <DollarSign className="size-5" />, bg: "bg-green-50", color: "text-green-600" },
                { label: "Platform Commissions", value: `NPR ${summary.platform_fee_revenue_usd.toLocaleString()}`, sub: `Host payout: NPR ${summary.host_earnings_usd.toLocaleString()}`, icon: <TrendingUp className="size-5" />, bg: "bg-[#C26B4A]/10", color: "text-[#C26B4A]" },
                { label: "Women-Led Impact", value: `${summary.women_led_percent_revenue}%`, sub: `NPR ${summary.women_led_revenue_usd} host income`, icon: <Compass className="size-5" />, bg: "bg-green-100/70", color: "text-green-700" },
              ].map((s, i) => (
                <Card key={i} className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold uppercase text-neutral-500 text-[10px] tracking-wider block">{s.label}</span>
                      <span className="leading-tight font-bold text-[#2A2A2A] text-[26px] mt-2 block">{s.value}</span>
                    </div>
                    <div className={`p-2 ${s.bg} rounded-lg ${s.color}`}>{s.icon}</div>
                  </div>
                  <div className="flex mt-3 items-center gap-1">
                    <ArrowUpRight className="size-3.5 text-green-600" />
                    <span className="text-green-600 text-xs font-semibold">{s.sub}</span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
                <h3 className="font-semibold text-[#2A2A2A] text-base mb-1">Booking & Revenue Trends</h3>
                <p className="text-xs text-[#8A8A8A] mb-4">Monthly volume and gross values.</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={booking_trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE5" />
                      <XAxis dataKey="month" stroke="#8A8A8A" fontSize={11} />
                      <YAxis yAxisId="left" stroke="#B5532A" fontSize={11} />
                      <YAxis yAxisId="right" orientation="right" stroke="#7A8454" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #EFE9DF", borderRadius: 8 }} />
                      <Legend verticalAlign="top" height={36} fontSize={11} />
                      <Line yAxisId="left" type="monotone" dataKey="bookings" name="Bookings" stroke="#B5532A" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue (NPR)" stroke="#7A8454" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
                <h3 className="font-semibold text-[#2A2A2A] text-base mb-1">Regional Revenue Analysis</h3>
                <p className="text-xs text-[#8A8A8A] mb-4">Sales across active homestay municipalities.</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={destinations_ranking} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE5" />
                      <XAxis type="number" stroke="#8A8A8A" fontSize={11} />
                      <YAxis dataKey="location" type="category" stroke="#8A8A8A" fontSize={10} width={100} />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #EFE9DF", borderRadius: 8 }} />
                      <Legend verticalAlign="top" height={36} fontSize={11} />
                      <Bar dataKey="revenue" name="Revenue (NPR)" fill="#C26B4A" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="bookings" name="Bookings" fill="#7A8454" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
              <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
                <h3 className="font-semibold text-[#2A2A2A] text-base mb-1">Community Payout Split</h3>
                <p className="text-xs text-[#8A8A8A] mb-2">Funds retained locally by community hosts.</p>
                <div className="h-52 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={payoutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {payoutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `NPR ${Number(v).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col text-center">
                    <span className="text-xs font-semibold text-neutral-500 uppercase">Retention</span>
                    <span className="text-xl font-bold text-green-700">96.5%</span>
                  </div>
                </div>
              </Card>

              <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
                <h3 className="font-semibold text-[#2A2A2A] text-base mb-1">Regional Heat & Tourism Insights</h3>
                <p className="text-xs text-[#8A8A8A] mb-4">Identify low-tourism districts to boost regional exposure.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="font-semibold uppercase text-neutral-500 text-[10px] tracking-wider border-b border-[#EFE9DF]">
                        <th className="py-2">Nepal Region</th>
                        <th className="py-2 text-center">Bookings</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE9DF]">
                      {low_tourism_insights.map((ins, i) => (
                        <tr key={i} className="text-xs">
                          <td className="py-3 font-semibold text-neutral-800 flex items-center gap-1.5"><MapPin className="size-3.5 text-[#B5532A]" />{ins.region}</td>
                          <td className="py-3 text-center font-bold">{ins.bookings}</td>
                          <td className="py-3">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${ins.status === "Under-visited" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{ins.status}</span>
                          </td>
                          <td className="py-3 text-neutral-600 max-w-[200px]">{ins.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* ── TAB: Intelligence ─────────────────────────── */}
        {activeTab === "Intelligence" && intel && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="size-4 text-[#B5532A]" />
                <h3 className="font-semibold text-[#2A2A2A] text-base">Search Analytics</h3>
              </div>
              <div className="mb-3 text-xs text-neutral-500">Total Searches: <span className="font-bold text-neutral-800">{intel.search_analytics.total_searches}</span></div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={intel.search_analytics.top_destinations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE5" />
                    <XAxis dataKey="destination" fontSize={10} stroke="#8A8A8A" />
                    <YAxis fontSize={10} stroke="#8A8A8A" />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Bar dataKey="searches" fill="#B5532A" radius={[4, 4, 0, 0]} name="Searches" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Compass className="size-4 text-[#7A8454]" />
                <h3 className="font-semibold text-[#2A2A2A] text-base">Travel Interests</h3>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={intel.search_analytics.top_interests}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE5" />
                    <XAxis dataKey="interest" fontSize={10} stroke="#8A8A8A" />
                    <YAxis fontSize={10} stroke="#8A8A8A" />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#7A8454" radius={[4, 4, 0, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="size-4 text-amber-600" />
                <h3 className="font-semibold text-[#2A2A2A] text-base">Low Engagement Destinations</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(intel.low_engagement_destinations || []).slice(0, 6).map((d, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                    <div className="font-semibold text-amber-900 text-sm">{d.destination}</div>
                    <div className="text-xs text-amber-700 mt-0.5">{d.district} · {d.region}</div>
                    <div className="text-xs text-neutral-500 mt-1">Searches: <span className="font-bold text-amber-800">{d.search_count}</span></div>
                    <div className="text-[10px] text-neutral-500 mt-1">{d.recommendation}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB: Trust & Safety ───────────────────────── */}
        {activeTab === "Trust & Safety" && intel && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="size-4 text-blue-600" />
                <h3 className="font-semibold text-[#2A2A2A] text-base">Trust Score Overview</h3>
              </div>
              {[
                { label: "Entities Scored", value: intel.trust_analytics.total_scored, color: "text-neutral-800" },
                { label: "Avg Platform Trust", value: `${intel.trust_analytics.avg_platform_trust}/100`, color: "text-blue-700" },
                { label: "Verified Listings", value: intel.trust_analytics.verified_count, color: "text-green-700" },
                { label: "High Trust (80+)", value: intel.trust_analytics.high_trust_count, color: "text-green-700" },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-neutral-50 last:border-0">
                  <span className="text-sm text-neutral-600">{s.label}</span>
                  <span className={`font-bold text-base ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </Card>

            <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="size-4 text-red-500" />
                <h3 className="font-semibold text-[#2A2A2A] text-base">Scam Reports</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Total", value: intel.scam_analytics.total_reports, color: "text-neutral-800", bg: "bg-neutral-50" },
                  { label: "Pending", value: intel.scam_analytics.pending, color: "text-amber-700", bg: "bg-amber-50" },
                  { label: "Resolved", value: intel.scam_analytics.resolved, color: "text-green-700", bg: "bg-green-50" },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <div className={`font-bold text-xl ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-neutral-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={intel.scam_analytics.by_type}>
                    <XAxis dataKey="type" fontSize={9} stroke="#8A8A8A" />
                    <YAxis fontSize={9} stroke="#8A8A8A" />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <ScamReportsTable />
        </>
        )}

        {/* ── TAB: Heritage ─────────────────────────────── */}
        {activeTab === "Heritage" && intel && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="size-4 text-[#B5532A]" />
                <h3 className="font-semibold text-[#2A2A2A] text-base">Story Engagement</h3>
              </div>
              {[
                { label: "Total Story Views", value: intel.heritage_analytics.total_story_views },
                { label: "Total Completions", value: intel.heritage_analytics.total_completions },
                { label: "Stories Marked Helpful", value: `${intel.heritage_analytics.helpful_story_pct}%` },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-neutral-50 last:border-0">
                  <span className="text-sm text-neutral-600">{s.label}</span>
                  <span className="font-bold text-[#B5532A]">{s.value}</span>
                </div>
              ))}
            </Card>

            <Card className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
              <h3 className="font-semibold text-[#2A2A2A] text-base mb-4">Top Stories by Views</h3>
              <div className="flex flex-col gap-3">
                {(intel.heritage_analytics.top_stories || []).slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                    <div>
                      <div className="text-xs font-semibold text-neutral-700 truncate max-w-[180px]">{s.site_id?.slice(0, 8)}…</div>
                      <div className="text-[10px] text-neutral-400">Avg completion: {s.avg_completion_pct}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#B5532A]">{s.views} views</div>
                      <div className="text-[10px] text-neutral-400">{s.audio_plays} audio plays</div>
                    </div>
                  </div>
                ))}
                {(!intel.heritage_analytics.top_stories || intel.heritage_analytics.top_stories.length === 0) && (
                  <p className="text-xs text-neutral-400">No story data yet. Story views will appear here.</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB: Impact ───────────────────────────────── */}
        {activeTab === "Impact" && intel && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "Bookings Tracked", value: intel.community_impact.total_bookings, icon: "📊", color: "text-neutral-800" },
              { label: "Families Supported", value: intel.community_impact.families_supported, icon: "👨‍👩‍👧", color: "text-[#B5532A]" },
              { label: "Women-Led Stays", value: intel.community_impact.women_led_stays, icon: "👩", color: "text-pink-700" },
              { label: "Eco-Friendly Stays", value: intel.community_impact.eco_friendly_stays, icon: "🌿", color: "text-green-700" },
              { label: "Local Economy (NPR)", value: `${(intel.community_impact.total_local_economy_npr || 0).toLocaleString()}`, icon: "💰", color: "text-green-800" },
            ].map((s, i) => (
              <Card key={i} className="shadow-sm rounded-xl bg-white border border-neutral-100 p-6">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className={`font-bold text-2xl ${s.color}`}>{s.value}</div>
                <div className="text-xs text-neutral-500 mt-1 font-semibold uppercase tracking-wider">{s.label}</div>
              </Card>
            ))}
          </div>
        )}

        {/* ── TAB: Users ────────────────────────────────── */}
        {activeTab === "Users" && <UsersTab />}

        {/* ── TAB: Verification ─────────────────────────── */}
        {activeTab === "Verification" && <VerificationTab />}

      </div>
    </div>
  );
}