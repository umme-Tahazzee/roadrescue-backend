// payment/payment.routes.ts

import { Router } from "express";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../../prisma/generated/prisma/enums";
import { PaymentControllers } from "./payment.controller";

const router = Router();

// ---------- PUBLIC (bKash গেটওয়ে কল করবে) ----------
router.post("/bkash/callback", PaymentControllers.bkashCallback);

// ---------- ADMIN (static route, dynamic-এর আগে) ----------
router.get("/", auth(Role.ADMIN), PaymentControllers.getAllPayments);
router.get("/refunds", auth(Role.ADMIN), PaymentControllers.getAllRefunds);
router.patch("/refunds/:id/approve", auth(Role.ADMIN), PaymentControllers.approveRefund);
router.patch("/refunds/:id/reject", auth(Role.ADMIN), PaymentControllers.rejectRefund);
router.patch("/refunds/:id/process", auth(Role.ADMIN), PaymentControllers.processRefund);

// ---------- CUSTOMER ----------
router.get("/my", auth(Role.CUSTOMER), PaymentControllers.getMyPayments);
router.post("/:id/bkash/initiate", auth(Role.CUSTOMER), PaymentControllers.initiateBkashPayment);
router.post("/:id/refund", auth(Role.CUSTOMER), PaymentControllers.requestRefund);

// ---------- MECHANIC ----------
router.patch("/:id/confirm-cash", auth(Role.MECHANIC), PaymentControllers.confirmCashPayment);

// ---------- SHARED (customer/mechanic/admin — ownership check service-এ হচ্ছে) ----------
router.get("/:id", auth(), PaymentControllers.getPaymentById);

export const PaymentRoutes = router;