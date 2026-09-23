process.env.NODE_ENV = "test";

process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
process.env.GOOGLE_CALLBACK_URL =
  "http://localhost:5000/api/v1/auth/google/callback";

process.env.RAZORPAY_KEY_ID = "test-razorpay-key";
process.env.RAZORPAY_KEY_SECRET = "test-razorpay-secret";