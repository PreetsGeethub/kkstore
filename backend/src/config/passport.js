import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import { loginWithGoogle } from "../services/auth.service.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("Google callback:", env.GOOGLE_CALLBACK_URL);
                console.log("Google profile:", profile);
                const user = await loginWithGoogle(profile);

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

export default passport;