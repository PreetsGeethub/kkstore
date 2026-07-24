export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
  
    PORT: Number(process.env.PORT) || 5000,
  
    DATABASE_URL: process.env.DATABASE_URL,
  
    BCRYPT_SALT_ROUNDS:
      Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  
    JWT_SECRET: process.env.JWT_SECRET,
  
    JWT_EXPIRES_IN:
      process.env.JWT_EXPIRES_IN || "15m",
  
    JWT_REFRESH_SECRET:
      process.env.JWT_REFRESH_SECRET,
  
    JWT_REFRESH_EXPIRES_IN:
      process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  
    GOOGLE_CLIENT_ID:
      process.env.GOOGLE_CLIENT_ID,
  
    GOOGLE_CLIENT_SECRET:
      process.env.GOOGLE_CLIENT_SECRET,
  
    GOOGLE_CALLBACK_URL:
      process.env.GOOGLE_CALLBACK_URL,
  
    CLIENT_URL:
      process.env.CLIENT_URL || "http://localhost:5173",
  };