// Analytics tracking module with localStorage-based metrics
// Manages visitor tracking, bookings, payments, and partner activity

export interface AnalyticsData {
  visitors: number;
  bookings: number;
  revenue: number;
  customerLogins: number;
  partnerEdits: number;
  homeStayViews: number;
  payments: number;
}

const ANALYTICS_KEY = "mantralayam_analytics";

export function getAnalytics(): AnalyticsData {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    if (!data) {
      return {
        visitors: 0,
        bookings: 0,
        revenue: 0,
        customerLogins: 0,
        partnerEdits: 0,
        homeStayViews: 0,
        payments: 0,
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading analytics:", error);
    return {
      visitors: 0,
      bookings: 0,
      revenue: 0,
      customerLogins: 0,
      partnerEdits: 0,
      homeStayViews: 0,
      payments: 0,
    };
  }
}

export function saveAnalytics(analytics: AnalyticsData) {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
    window.dispatchEvent(new Event("analyticsUpdated"));
  } catch (error) {
    console.error("Error saving analytics:", error);
  }
}

export function updateAnalytics(field: keyof AnalyticsData, increment = 1) {
  try {
    const analytics = getAnalytics();
    analytics[field] = (analytics[field] as number) + increment;
    saveAnalytics(analytics);
  } catch (error) {
    console.error("Error updating analytics:", error);
  }
}

export function trackHomeStayView() {
  updateAnalytics("homeStayViews");
}

export function trackBooking(revenue: number) {
  updateAnalytics("bookings");
  const analytics = getAnalytics();
  analytics.revenue += revenue;
  saveAnalytics(analytics);
}

export function trackPayment() {
  updateAnalytics("payments");
}

export function trackCustomerLogin() {
  updateAnalytics("customerLogins");
}

export function trackPartnerEdit() {
  updateAnalytics("partnerEdits");
}
