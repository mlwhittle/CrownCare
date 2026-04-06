const FIREBASE_FUNCTIONS_URL = "https://us-central1-crowncare-116e4.cloudfunctions.net";

const StripeService = {
  /**
   * Creates a new Stripe Express account for a Stylist.
   * @returns {Promise<string>} The new Stripe Account ID.
   */
  async createConnectAccount() {
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/createStripeAccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Failed to create account: ${response.statusText}`);
      }

      const data = await response.json();
      return data.accountId;
    } catch (error) {
      console.error("StripeService - createConnectAccount Error:", error);
      throw error;
    }
  },

  /**
   * Generates a secure onboarding link for the Stylist to provide their tax/bank details to Stripe.
   * @param {string} accountId The Stripe Account ID generated previously.
   * @returns {Promise<string>} The Stripe hosted onboarding URL.
   */
  async createOnboardingLink(accountId) {
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/createOnboardingLink`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId })
      });

      if (!response.ok) {
        throw new Error(`Failed to create onboarding link: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("StripeService - createOnboardingLink Error:", error);
      throw error;
    }
  }
};

export default StripeService;
