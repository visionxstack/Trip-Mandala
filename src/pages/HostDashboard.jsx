import { useState, useEffect } from "react";
import { ArrowUpRight, Bell, Home, MapPin, Plus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";
import ImageUploader from "../components/ImageUploader";
import { resolveHomestayImage } from "../utils/homestayImages";
import { getLocationImage } from "../utils/imageBank";





export default function HostDashboard({ currentUser }) {
  usePageTitle("Host Dashboard | Trip Mandala");
  // If no logged in user or role isn't host, default to Dawa Tamang for demo flow
  const hostId = currentUser?.role === "host" ? currentUser.id : "host_dawa";
  const hostName = currentUser?.role === "host" ? currentUser.name : "Dawa Tamang";

  const [bookings, setBookings] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Form state to list a new homestay
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newPrice, setNewPrice] = useState(40);
  const [newLat, setNewLat] = useState(27.7);
  const [newLng, setNewLng] = useState(85.3);
  const [newWL, setNewWL] = useState(false);
  const [newEco, setNewEco] = useState(4.8);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let hostHomestays;
        if (currentUser?.role === "host" && currentUser?.token) {
          // Authenticated host: use server-side filtered endpoint
          hostHomestays = await api.getMyHomestays();
        } else {
          // Demo mode: fetch all and filter client-side
          const allHomestays = await api.getHomestays();
          hostHomestays = currentUser?.role === "host"
            ? allHomestays.filter((h) => h.host_id === currentUser.id)
            : allHomestays;
        }
        setHomestays(hostHomestays);

        const hostBookings = await api.getBookings();
        setBookings(hostBookings);

        // Load notifications (non-blocking)
        if (currentUser?.token) {
          api.getNotifications().then(setNotifications).catch(() => {});
        }
      } catch (err) {
        console.error("Error loading host data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const handleAddHomestay = async (e) => {
    e.preventDefault();
    try {
      // TODO (Supabase Storage): 
      // 1. Iterate over newImages (which are File objects).
      // 2. Upload each file to Supabase Storage bucket.
      // 3. Collect the returned public URLs into an array.
      // 4. Pass the array of public URLs to images below instead of these temporary blobs.
      
      const imageUrls = newImages.length > 0 
        ? newImages.map(file => URL.createObjectURL(file)) 
        : ["https://images.unsplash.com/photo-1755015347473-7ed3e57569f0?w=600&auto=format&fit=crop&q=80"];

      await api.createHomestay({
        title: newTitle,
        description: newDesc,
        location: newLoc,
        price_per_night: Number(newPrice),
        latitude: Number(newLat),
        longitude: Number(newLng),
        women_led: newWL,
        eco_score: Number(newEco),
        images: imageUrls,
        amenities: []
      });

      // Clear form
      setNewTitle("");
      setNewDesc("");
      setNewLoc("");
      setNewPrice(40);
      setNewWL(false);
      setNewEco(4.8);
      setNewImages([]);
      setShowAddForm(false);

      // Refresh list using the same logic since fetchData is now in useEffect
      api.getHomestays().then(allHomestays => {
        const hostHomestays = currentUser?.role === "host"
          ? allHomestays.filter((h) => h.host_id === currentUser.id)
          : allHomestays;
        setHomestays(hostHomestays);
      });
      alert("Homestay listed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to list homestay.");
    }
  };

  // Metrics aggregation
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.host_payout || 0), 0);
  const activeBookingsCount = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-[#FAF8F5] min-h-screen">
        <div className="w-10 h-10 border-4 border-dashed border-[#C26B4A] border-t-transparent animate-spin rounded-full" />
      </div>);

  }

  return (
    <div className="bg-[#FAF8F5] text-neutral-950 w-full h-fit min-h-screen overflow-visible">
      {/* Top Banner */}
      <div className="max-w-[1140px] mx-auto px-12 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-light text-[#2A2A2A] text-[28px] tracking-tight">
              Good morning, {hostName.split(" ")[0]}.
            </h1>
            <p className="text-[#6B6B6B] text-[15px] mt-1">
              Here's how your community homestays are doing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className="relative p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 cursor-pointer text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C26B4A] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {/* Notifications panel */}
              {showNotifPanel && (
                <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-100">
                    <span className="font-semibold text-sm text-neutral-800">Notifications</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            api.markAllNotificationsRead();
                            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                          }}
                          className="text-[10px] text-[#C26B4A] font-semibold cursor-pointer bg-transparent border-0 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotifPanel(false)} className="text-neutral-400 hover:text-neutral-700 cursor-pointer bg-transparent border-0">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-50">
                    {notifications.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-neutral-400">No notifications yet.</div>
                    )}
                    {notifications.slice(0, 12).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.is_read) {
                            api.markNotificationRead(n.id);
                            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
                          }
                        }}
                        className={`px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors ${!n.is_read ? "bg-[#FDF7F5]" : ""}`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-[#C26B4A] mt-1.5 shrink-0" />}
                          <div className={!n.is_read ? "" : "pl-3.5"}>
                            <div className="text-xs font-semibold text-neutral-800">{n.title}</div>
                            <div className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">{n.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-lg bg-[#C26B4A] hover:bg-[#a55233] text-white text-xs px-4 h-9 gap-1">
              <Plus className="size-4" />
              Add New Listing
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8 gap-6">
          <div className="shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl bg-white px-7 py-6 border border-neutral-100/60">
            <div className="font-medium uppercase text-[#7A8454] text-[11px] tracking-wider mb-3">
              Total Host Payout
            </div>
            <div className="leading-tight font-medium text-[#2A2A2A] text-[26px]">
              ${totalEarnings.toLocaleString()}
            </div>
            <div className="flex mt-2 items-center gap-1">
              <ArrowUpRight className="size-3 text-[#7BA67B]" />
              <span className="text-[#7BA67B] text-xs font-semibold">+12% this month</span>
            </div>
          </div>
          
          <div className="shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl bg-white px-7 py-6 border border-neutral-100/60">
            <div className="font-medium uppercase text-[#7A8454] text-[11px] tracking-wider mb-3">
              Active Bookings
            </div>
            <div className="leading-tight font-medium text-[#2A2A2A] text-[26px]">
              {activeBookingsCount}
            </div>
            <div className="text-[#8A8A8A] text-xs mt-2 font-medium">Guest arrivals upcoming</div>
          </div>

          <div className="shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl bg-white px-7 py-6 border border-neutral-100/60">
            <div className="font-medium uppercase text-[#7A8454] text-[11px] tracking-wider mb-3">
              My Listed Homes
            </div>
            <div className="leading-tight font-medium text-[#2A2A2A] text-[26px]">
              {homestays.length}
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-block cursor-pointer text-[#C26B4A] hover:text-[#a55233] text-xs mt-2 border-0 bg-transparent font-medium">
              
              Add New +
            </button>
          </div>

          <div className="shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl bg-white px-7 py-6 border border-neutral-100/60">
            <div className="font-medium uppercase text-[#7A8454] text-[11px] tracking-wider mb-3">
              Avg. Guest Rating
            </div>
            <div className="leading-tight font-medium text-[#2A2A2A] text-[26px] flex items-center gap-1">
              4.9 <Star className="size-5 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-[#8A8A8A] text-xs mt-2 font-medium">Based on 38 community reviews</div>
          </div>
        </div>

        {/* Dynamic add listing Form panel */}
        {showAddForm &&
        <div className="shadow-lg rounded-2xl bg-white border border-neutral-200 p-8 mb-8 transition-all animate-in slide-in-from-top-5 duration-300">
            <h2 className="font-medium text-[#2A2A2A] text-xl mb-6 flex items-center gap-2">
              <Home className="size-5 text-[#C26B4A]" />
              List a New Community Homestay
            </h2>
            <form onSubmit={handleAddHomestay} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase text-neutral-600">Homestay Title</label>
                  <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white h-10 text-neutral-900"
                  placeholder="e.g. Tamang Mountain View Lodge" />
                
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase text-neutral-600">Description</label>
                  <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white text-neutral-900"
                  placeholder="Explain the local environment, traditional meals, cultural exchange, etc." />
                
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase text-neutral-600">Location (City, Region)</label>
                  <input
                  type="text"
                  required
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  className="border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white h-10 text-neutral-900"
                  placeholder="e.g. Ghandruk, Annapurna" />
                
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-neutral-600">Price / Night (NPR)</label>
                    <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white h-10 text-neutral-900" />
                  
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-neutral-600">Eco Certification Score</label>
                    <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={newEco}
                    onChange={(e) => setNewEco(Number(e.target.value))}
                    className="border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white h-10 text-neutral-900" />
                  
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-neutral-600">Latitude</label>
                    <input
                    type="number"
                    step="0.0001"
                    value={newLat}
                    onChange={(e) => setNewLat(Number(e.target.value))}
                    className="border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white h-10 text-neutral-900" />
                  
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase text-neutral-600">Longitude</label>
                    <input
                    type="number"
                    step="0.0001"
                    value={newLng}
                    onChange={(e) => setNewLng(Number(e.target.value))}
                    className="border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white h-10 text-neutral-900" />
                  
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <ImageUploader 
                    maxImages={5} 
                    onImagesChange={(files) => setNewImages(files)}
                    initialPreviews={[]}
                  />
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                  type="checkbox"
                  id="women_led"
                  checked={newWL}
                  onChange={(e) => setNewWL(e.target.checked)}
                  className="size-4 text-[#C26B4A] border-neutral-300 rounded cursor-pointer" />
                
                  <label htmlFor="women_led" className="text-sm font-semibold text-neutral-700 cursor-pointer">
                    This is a Women-Led homestay (Qualifies for 3% reduced platform fee)
                  </label>
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 h-10 px-4 rounded-md border-0">
                  
                    Cancel
                  </Button>
                  <Button
                  type="submit"
                  className="bg-[#C26B4A] hover:bg-[#a55233] text-white h-10 px-6 rounded-md border-0">
                  
                    List Homestay
                  </Button>
                </div>
              </div>
            </form>
          </div>
        }

        {/* Split Section: Bookings & Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
          {/* Upcoming Bookings Table */}
          <div className="shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl bg-white p-7 border border-neutral-100/60 overflow-x-auto">
            <div className="flex mb-5 justify-between items-center shrink-0">
              <h2 className="font-medium text-[#2A2A2A] text-lg">
                Upcoming Guest Bookings
              </h2>
            </div>
            
            {bookings.length === 0 ?
            <div className="text-center py-10 text-[#8A8A8A] text-sm">
                No guest bookings registered yet.
              </div> :

            <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="font-semibold uppercase text-[#7A8454] text-[10px] tracking-wider border-b border-[#EFE9DF] pb-3">
                    <th className="py-2">Guest</th>
                    <th className="py-2">Homestay</th>
                    <th className="py-2">Check-in</th>
                    <th className="py-2">Nights</th>
                    <th className="py-2">Host Payout</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DF]">
                  {bookings.map((booking) =>
                <tr key={booking.id} className="text-sm">
                      <td className="py-3 flex items-center gap-3">
                        <div className="size-8 rounded-full bg-[#E8E2D6] text-[#5C5346] text-[11px] font-bold flex justify-center items-center shrink-0">
                          {booking.tourist_name?.split(" ").map((n) => n[0]).join("") || "G"}
                        </div>
                        <span className="text-[#2A2A2A] font-medium">{booking.tourist_name || "Guest"}</span>
                      </td>
                      <td className="py-3 text-neutral-600 truncate max-w-[120px]">{booking.homestay_title}</td>
                      <td className="py-3 text-[#6B6B6B]">{booking.check_in}</td>
                      <td className="py-3 text-[#6B6B6B]">{booking.nights}</td>
                      <td className="py-3 text-[#2A2A2A] font-bold">${booking.host_amount}</td>
                      <td className="py-3">
                        <span className={`rounded-full text-[11px] px-2.5 py-0.5 font-semibold ${
                    booking.status === "Confirmed" ?
                    "bg-[#E8EFD9] text-[#5F7A3D]" :
                    "bg-[#F7E8CC] text-[#9C7330]"}`
                    }>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            }
          </div>

          {/* Listed Homestays */}
          <div className="shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-xl bg-white p-7 border border-neutral-100/60 flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h2 className="font-medium text-[#2A2A2A] text-lg">
                Active Listings
              </h2>
              <Plus
                onClick={() => setShowAddForm(true)}
                className="size-4 cursor-pointer text-[#C26B4A] hover:text-[#a55233]" />
              
            </div>
            
            <div className="flex flex-col gap-4">
              {homestays.map((home, hIdx) =>
              <div key={home.id} className="border-b border-[#EFE9DF] border-solid flex pb-4 items-center gap-4 last:border-0 last:pb-0">
                  <img
                  alt={home.title || home.name}
                  className="size-16 object-cover rounded-lg"
                  src={resolveHomestayImage(home, hIdx, getLocationImage)}
                  onError={(e) => { e.target.src = getLocationImage(home.location, hIdx) || getLocationImage("Default", hIdx) }} />
                
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-[#2A2A2A] text-[15px]">
                      {home.title || home.name}
                    </div>
                    <div className="text-[#7A8454] text-xs flex mt-0.5 items-center gap-1 font-medium">
                      <MapPin className="size-3 text-[#7A8454]" />
                      {home.location}
                    </div>
                    <div className="text-xs text-neutral-500 font-medium mt-0.5">
                      ${home.price_per_night || home.price} / night
                    </div>
                  </div>
                  <div className="relative cursor-pointer rounded-full bg-[#C26B4A] w-9 h-5 shrink-0">
                    <div className="size-4 rounded-full bg-white absolute right-0.5 top-0.5 shadow-sm" />
                  </div>
                </div>
              )}
              
              {homestays.length === 0 &&
              <div className="text-center py-5 text-[#8A8A8A] text-xs">
                  No active listings listed under your profile.
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>);

}