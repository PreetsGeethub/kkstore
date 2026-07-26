import { Router } from "express";
import validate from "../middleware/validate.middleware.js";
import protect from "../middleware/protect.middleware.js"
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { register, login, getCurrentUser } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema),login );
router.get("/me", protect, getCurrentUser);

export default router;