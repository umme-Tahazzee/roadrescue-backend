// customer/customer.routes.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { Router } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import { CustomerControllers } from "./customer.controller";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

router.get("/profile", auth(Role.CUSTOMER), CustomerControllers.getProfile);
router.patch("/profile", auth(Role.CUSTOMER), CustomerControllers.updateProfile);
router.get("/requests", auth(Role.CUSTOMER), CustomerControllers.getMyRequests);
router.delete("/account", auth(Role.CUSTOMER), CustomerControllers.deactivateAccount);

export const CustomerRoutes = router;