import { Router } from "express";
import validate from "../middleware/validate.middleware.js";
import protect from "../middleware/protect.middleware.js"
import { registerSchema, loginSchema , completeGoogleProfileSchema} from "../validators/auth.validator.js";
import { register, login, getCurrentUser, logout, refresh, googleCallback , completeGoogleProfileController} from "../controllers/auth.controller.js";
import passport from "../config/passport.js";
const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema),login );
router.get("/me", protect, getCurrentUser);
router.post("/logout",protect,logout);
router.post("/refresh-token",refresh);
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
    }),
    googleCallback
);

router.patch(
    "/google/complete-profile",
    validate(completeGoogleProfileSchema),
    completeGoogleProfileController
);
export default router;