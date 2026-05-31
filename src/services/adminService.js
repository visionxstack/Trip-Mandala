import { apiClient } from "./apiClient";

export const adminService = {
  getAdminAnalytics: async () => {
    try {
      return await apiClient.get("/analytics/dashboard");
    } catch (err) {
      console.warn("API failed, returning mock analytics data", err);
      return {
        summary: {
          total_bookings: 1250,
          total_revenue_usd: 154000,
          platform_fee_revenue_usd: 6160,
          host_earnings_usd: 147840,
          women_led_percent_revenue: 35,
          women_led_revenue_usd: 53900
        },
        booking_trends: [
          { month: "Jan", bookings: 120, revenue: 15000 },
          { month: "Feb", bookings: 140, revenue: 17500 },
          { month: "Mar", bookings: 110, revenue: 13000 },
          { month: "Apr", bookings: 200, revenue: 24000 },
          { month: "May", bookings: 250, revenue: 31000 }
        ],
        destinations_ranking: [
          { location: "Pokhara", bookings: 400, revenue: 50000 },
          { location: "Kathmandu", bookings: 300, revenue: 35000 },
          { location: "Bhaktapur", bookings: 150, revenue: 20000 },
          { location: "Bandipur", bookings: 100, revenue: 15000 }
        ],
        low_tourism_insights: [
          { region: "Dolpa", bookings: 15, status: "Under-visited", recommendation: "Boost visibility with featured campaigns" },
          { region: "Rukum", bookings: 8, status: "Under-visited", recommendation: "Incentivize early reviews and host onboarding" }
        ]
      };
    }
  }
};
