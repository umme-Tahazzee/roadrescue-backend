// service-request/request.routes.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { Router } from "express";
import { RequestControllers } from "./request.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

// FIX: static route (/pending) সবসময় dynamic route (/:id/...) এর আগে রাখা হলো,
// নাহলে Express "/pending"-কে ভুল করে ":id" param হিসেবে match করার চেষ্টা করতে পারে
router.get("/pending", auth(Role.MECHANIC), RequestControllers.getPendingRequests);

// ---------- CUSTOMER ----------
router.post("/", auth(Role.CUSTOMER), RequestControllers.createRequest);
router.get("/:id/nearby-mechanics", auth(Role.CUSTOMER), RequestControllers.getNearbyMechanics);
router.patch("/:id/cancel", auth(Role.CUSTOMER), RequestControllers.cancelRequest);

// ---------- MECHANIC ----------
router.patch("/:id/accept", auth(Role.MECHANIC), RequestControllers.acceptRequest);
router.patch("/:id/status", auth(Role.MECHANIC), RequestControllers.updateRequestStatus);
router.patch("/:id/complete", auth(Role.MECHANIC), RequestControllers.completeService); // FIX: যোগ করা হলো
router.patch("/payments/:id/confirm-cash", auth(Role.MECHANIC), RequestControllers.confirmCashPayment); // FIX: যোগ করা হলো

export const RequestRoutes = router;