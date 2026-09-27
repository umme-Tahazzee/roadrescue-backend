// biome-ignore assist/source/organizeImports: <explanation>
import { AuthValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";
import { Router } from "express";
import {validateRequest} from "../../middlewares/validationRequest";
import { Role } from "../../../prisma/generated/prisma/enums";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

router.post("/register", validateRequest(AuthValidation.registerCustomerValidationSchema) ,AuthControllers.register);
router.post("/verify-email",validateRequest(AuthValidation.verifyEmailValidationSchema), AuthControllers.verficationEmail);

router.post("/login",validateRequest(AuthValidation.loginValidationSchema), AuthControllers.login);
router.get("/me", auth(Role.CUSTOMER, Role.ADMIN), AuthControllers.getMe);
router.post('/refresh-token', AuthControllers.refreshToken)
router.post("/google", AuthControllers.googleAuth);
router.post("/forgot-password", AuthControllers.forgotPassword);

router.post("/refresh-token", AuthControllers.refreshToken);
router.post("/reset-password", AuthControllers.resetPassword);

router.post("/logout", AuthControllers.logout);

export const AuthRoutes = router;