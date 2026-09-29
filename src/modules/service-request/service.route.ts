// service-request/request.routes.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { Router } from "express";
import { RequestControllers } from "./request.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

// ---------- CUSTOMER ----------
router.post("/", auth(Role.CUSTOMER), RequestControllers.createRequest);
router.get("/:id/nearby-mechanics", auth(Role.CUSTOMER), RequestControllers.getNearbyMechanics);
router.patch("/:id/cancel", auth(Role.CUSTOMER), RequestControllers.cancelRequest);

// ---------- MECHANIC ----------
router.get("/pending", auth(Role.MECHANIC), RequestControllers.getPendingRequests);
router.patch("/:id/accept", auth(Role.MECHANIC), RequestControllers.acceptRequest);
router.patch("/:id/status", auth(Role.MECHANIC), RequestControllers.updateRequestStatus);

export const RequestRoutes = router;