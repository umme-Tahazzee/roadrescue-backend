// admin/admin.routes.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { Router } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import { AdminControllers } from "./admin.controller";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

router.get("/profile", auth(Role.ADMIN), AdminControllers.getProfile);
router.get("/dashboard", auth(Role.ADMIN), AdminControllers.getDashboardStats);
router.get("/users", auth(Role.ADMIN), AdminControllers.getAllUsers);
router.get("/users/:id", auth(Role.ADMIN), AdminControllers.getUserById);
router.patch("/users/:id/block", auth(Role.ADMIN), AdminControllers.toggleBlockUser);
router.get("/requests", auth(Role.ADMIN), AdminControllers.getAllRequests);

export const AdminRoutes = router;