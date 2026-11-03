// payment/payment.routes.ts

import { Router } from "express";
import { auth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validationRequest";
import { Role } from "../../../prisma/generated/prisma/enums";
import { PaymentControllers } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

// ---------- PUBLIC (bKash গেটওয়ে কল করবে) ----------
router.post("/bkash/callback", validateRequest(PaymentValidation.bkashCallbackSchema), PaymentControllers.bkashCallback);

// ---------- ADMIN (static route, dynamic-এর আগে) ----------
router.get("/", auth(Role.ADMIN), validateRequest(PaymentValidation.listPaymentsSchema), PaymentControllers.getAllPayments);
router.get("/refunds", auth(Role.ADMIN), validateRequest(PaymentValidation.listRefundsSchema), PaymentControllers.getAllRefunds);
router.patch("/refunds/:id/approve", auth(Role.ADMIN), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.approveRefund);
router.patch("/refunds/:id/reject", auth(Role.ADMIN), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.rejectRefund);
router.patch("/refunds/:id/process", auth(Role.ADMIN), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.processRefund);

// ---------- CUSTOMER ----------
router.get("/my", auth(Role.CUSTOMER), validateRequest(PaymentValidation.listPaymentsSchema), PaymentControllers.getMyPayments);
router.post("/:id/bkash/initiate", auth(Role.CUSTOMER), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.initiateBkashPayment);
router.post("/:id/refund", auth(Role.CUSTOMER), validateRequest(PaymentValidation.requestRefundSchema), PaymentControllers.requestRefund);

// ---------- MECHANIC ----------
router.patch("/:id/confirm-cash", auth(Role.MECHANIC), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.confirmCashPayment);

// ---------- SHARED (customer/mechanic/admin — ownership check service-এ হচ্ছে) ----------
router.get("/:id", auth(), validateRequest(PaymentValidation.paymentIdSchema), PaymentControllers.getPaymentById);

export const PaymentRoutes = router;
