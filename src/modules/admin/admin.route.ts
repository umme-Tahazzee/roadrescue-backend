// admin/admin.routes.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { Router } from "express";
import { Role } from "../../../prisma/generated/prisma/enums";
import { AdminControllers } from "./admin.controller";
import { AdminValidation } from "./admin.validation";
import { auth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validationRequest";

const router = Router();

router.get("/profile", auth(Role.ADMIN), AdminControllers.getProfile);
router.get("/dashboard", auth(Role.ADMIN), AdminControllers.getDashboardStats);
router.get("/users", auth(Role.ADMIN), validateRequest(AdminValidation.listUsersSchema), AdminControllers.getAllUsers);
router.get("/users/:id", auth(Role.ADMIN), validateRequest(AdminValidation.userIdSchema), AdminControllers.getUserById);
router.patch("/users/:id/block", auth(Role.ADMIN), validateRequest(AdminValidation.toggleBlockSchema), AdminControllers.toggleBlockUser);
router.get("/activities", auth(Role.ADMIN), validateRequest(AdminValidation.listActivitiesSchema), AdminControllers.getActivities);
router.get("/requests", auth(Role.ADMIN), validateRequest(AdminValidation.listRequestsSchema), AdminControllers.getAllRequests);

export const AdminRoutes = router;
