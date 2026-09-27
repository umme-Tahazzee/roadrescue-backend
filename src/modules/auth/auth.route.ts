// biome-ignore assist/source/organizeImports: <explanation>
import { AuthValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";
import { Router } from "express";
import {validateRequest} from "../../middlewares/validationRequest";

const router = Router();

router.post("/register", validateRequest(AuthValidation.registerCustomerValidationSchema) ,AuthControllers.register);
router.post("/verify-email",validateRequest(AuthValidation.verifyEmailValidationSchema), AuthControllers.verficationEmail);

router.post("/login",validateRequest(AuthValidation.loginValidationSchema), AuthControllers.login);
router.post("/google", AuthControllers.googleAuth);
router.post("/refresh-token", AuthControllers.refreshToken);
router.post("/logout", AuthControllers.logout);

export const AuthRoutes = router;