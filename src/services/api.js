import { authService } from "./authService";
import { tripService } from "./tripService";
import { homestayService } from "./homestayService";
import { adminService } from "./adminService";
import { adminUserService } from "./adminUserService";
import { profileService } from "./profileService";
import { heritageService } from "./heritageService";
import { trustService } from "./trustService";
import { intelligenceService, feedbackService, impactService } from "./intelligenceService";
import { notificationService } from "./notificationService";

export const api = {
  // Authentication
  login: authService.login,
  signup: authService.signup,
  verifyOtp: authService.verifyOtp,
  forgotPassword: authService.forgotPassword,
  resetPassword: authService.resetPassword,

  // Homestays & Bookings
  getHomestays: homestayService.getHomestays,
  getHomestay: homestayService.getHomestay,
  getMyHomestays: homestayService.getMyHomestays,
  createHomestay: homestayService.createHomestay,
  updateHomestay: homestayService.updateHomestay,
  deleteHomestay: homestayService.deleteHomestay,
  createBooking: homestayService.createBooking,
  getBookings: homestayService.getBookings,

  // Admin Analytics (existing)
  getAdminAnalytics: adminService.getAdminAnalytics,

  // Admin User Management (new)
  adminListUsers: adminUserService.listUsers,
  adminGetUser: adminUserService.getUserDetail,
  adminSetUserStatus: adminUserService.setUserStatus,
  adminVerifyHost: adminUserService.verifyHost,
  adminVerifyWomenLed: adminUserService.verifyWomenLed,
  adminDeleteUser: adminUserService.deleteUser,
  adminGetOverview: adminUserService.getOverview,
  adminListVerificationRequests: adminUserService.listVerificationRequests,
  adminReviewVerificationRequest: adminUserService.reviewVerificationRequest,
  adminGetAuditLogs: adminUserService.getAuditLogs,

  // User Profile
  getMyProfile: profileService.getMe,
  updateMyProfile: profileService.updateMe,
  uploadAvatar: profileService.uploadAvatar,
  getProfile: profileService.getProfile,
  submitVerificationRequest: profileService.submitVerificationRequest,
  getVerificationStatus: profileService.getVerificationStatus,

  // AI Trip Planner
  generateTripPlan: tripService.generateTripPlan,

  // Heritage / Story Mode
  getHeritageSites: heritageService.getHeritageSites,

  // Trust & Anti-Scam
  getTrustScore: trustService.getScore,
  getAllTrustScores: trustService.getAllScores,
  checkPriceFairness: trustService.checkPriceFairness,
  getPriceBenchmarks: trustService.getPriceBenchmarks,
  submitScamReport: trustService.submitReport,
  adminGetScamReports: trustService.getReports,
  adminReviewScamReport: trustService.reviewReport,

  // Feedback
  submitTouristFeedback: feedbackService.submitTouristFeedback,
  submitHeritageFeedback: feedbackService.submitHeritageFeedback,
  trackHeritageEngagement: feedbackService.trackHeritageEngagement,
  trackStoryCompletion: feedbackService.trackStoryCompletion,

  // Community Impact
  calculateImpact: impactService.calculateImpact,
  getMyImpact: impactService.getMyImpact,
  getBookingImpact: impactService.getBookingImpact,

  // Tourism Intelligence
  trackSearch: intelligenceService.trackSearch,
  getIntelligenceDashboard: intelligenceService.getDashboard,

  // Notifications
  getNotifications: notificationService.getNotifications,
  getUnreadCount: notificationService.getUnreadCount,
  markNotificationRead: notificationService.markRead,
  markAllNotificationsRead: notificationService.markAllRead,
};