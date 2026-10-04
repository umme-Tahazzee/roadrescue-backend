// payment/payment.service.ts

// biome-ignore assist/source/organizeImports: <explanation>
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../lib/prisma";
import { Role, PaymentStatus, RefundStatus } from "../../../prisma/generated/prisma/enums";
import { IRequestRefund, IBkashCallback } from "./payment.interface";

// ---------- VIEW ----------

const getPaymentById = async (paymentId: string, userId: string, role: string) => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		include: {
			request: {
				include: {
					customer: { select: { id: true, name: true, phone: true } },
					mechanic: { select: { id: true, userId: true, user: { select: { name: true } } } },
				},
			},
			refunds: true,
		},
	});

	if (!payment) {
		throw new AppError("Payment not found", httpStatus.NOT_FOUND);
	}

	// ownership check — customer নিজের, mechanic assigned থাকলে তার, admin সবসময়
	const isOwner = payment.request.customerId === userId;
	const isAssignedMechanic = payment.request.mechanic?.userId === userId;

	if (role !== Role.ADMIN && !isOwner && !isAssignedMechanic) {
		throw new AppError(
			"You are not authorized to view this payment",
			httpStatus.FORBIDDEN,
		);
	}

	return payment;
};

const getMyPayments = async (customerId: string, status?: string) => {
	if (status && !Object.values(PaymentStatus).includes(status as PaymentStatus)) {
		throw new AppError("Invalid status filter", httpStatus.BAD_REQUEST);
	}

	return prisma.payment.findMany({
		where: {
			request: { customerId },
			...(status && { status: status as PaymentStatus }),
		},
		include: {
			request: { select: { id: true, serviceType: true, status: true } },
			refunds: true,
		},
		orderBy: { createdAt: "desc" },
	});
};

// ---------- BKASH FLOW ----------

const initiateBkashPayment = async (paymentId: string, customerId: string) => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		include: { request: true },
	});

	if (!payment) {
		throw new AppError("Payment not found", httpStatus.NOT_FOUND);
	}

	if (payment.request.customerId !== customerId) {
		throw new AppError(
			"You are not authorized to pay for this request",
			httpStatus.FORBIDDEN,
		);
	}

	if (payment.method !== "BKASH") {
		throw new AppError("This payment is not a bKash payment", httpStatus.BAD_REQUEST);
	}

	if (payment.status === "PAID") {
		throw new AppError("Payment is already completed", httpStatus.CONFLICT);
	}


	const mockBkashPaymentID = `BKS-${Date.now()}`;
	const mockCheckoutUrl = `https://sandbox.payment.bkash.com/checkout/${mockBkashPaymentID}`;

	await prisma.payment.update({
		where: { id: paymentId },
		data: {
			status: "PENDING",
			gatewayResponse: { bkashPaymentID: mockBkashPaymentID, initiatedAt: new Date().toISOString() },
		},
	});

	return {
		bkashPaymentID: mockBkashPaymentID,
		checkoutUrl: mockCheckoutUrl,
	};
};


const handleBkashCallback = async (payload: IBkashCallback) => {
	const payment = await prisma.payment.findFirst({
		where: {
			gatewayResponse: { path: ["bkashPaymentID"], equals: payload.paymentID },
		},
	});

	if (!payment) {
		throw new AppError("Payment not found for this bKash transaction", httpStatus.NOT_FOUND);
	}

	if (payment.status === "PAID") {
		return payment;
	}

	// FIX: gatewayResponse null/non-object হলেও crash না করে safe ভাবে merge করা
	const existingGatewayResponse = payment.gatewayResponse
		? (JSON.parse(JSON.stringify(payment.gatewayResponse)) as Record<string, unknown>)
		: {};

	if (payload.status === "success") {
		return prisma.payment.update({
			where: { id: payment.id },
			data: {
				status: "PAID",
				transactionId: payload.trxID,
				paidAt: new Date(),
				gatewayResponse: {
					...existingGatewayResponse,
					callback: JSON.parse(JSON.stringify(payload)),
				},
			},
		});
	}

	return prisma.payment.update({
		where: { id: payment.id },
		data: {
			status: "FAILED",
			gatewayResponse: {
					...existingGatewayResponse,
					callback: JSON.parse(JSON.stringify(payload)),
				},
		},
	});
};

// ---------- CASH CONFIRM (payment module-এ কেন্দ্রীভূত রাখা হলো) ----------

const confirmCashPayment = async (paymentId: string, mechanicUserId: string) => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		include: { request: true },
	});

	if (!payment) {
		throw new AppError("Payment not found", httpStatus.NOT_FOUND);
	}

	if (payment.method !== "CASH") {
		throw new AppError("This payment is not a cash payment", httpStatus.BAD_REQUEST);
	}

	if (payment.status === "PAID") {
		throw new AppError("Payment already confirmed", httpStatus.CONFLICT);
	}

	const mechanicProfile = await prisma.mechanicProfile.findUnique({
		where: { userId: mechanicUserId },
	});

	if (payment.request.mechanicId !== mechanicProfile?.id) {
		throw new AppError(
			"You are not authorized to confirm this payment",
			httpStatus.FORBIDDEN,
		);
	}

	return prisma.payment.update({
		where: { id: paymentId },
		data: {
			status: "PAID",
			paidAt: new Date(),
			confirmedBy: mechanicUserId,
		},
	});
};

// ---------- REFUND FLOW ----------

const requestRefund = async (
	paymentId: string,
	customerId: string,
	payload: IRequestRefund,
) => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		include: { request: true, refunds: true },
	});

	if (!payment) {
		throw new AppError("Payment not found", httpStatus.NOT_FOUND);
	}

	if (payment.request.customerId !== customerId) {
		throw new AppError(
			"You can only request a refund for your own payment",
			httpStatus.FORBIDDEN,
		);
	}

	if (payment.status !== "PAID") {
		throw new AppError(
			"Only completed payments can be refunded",
			httpStatus.BAD_REQUEST,
		);
	}

	if (payload.amount <= 0 || payload.amount > payment.amount) {
		throw new AppError(
			`Refund amount must be between 0 and ${payment.amount}`,
			httpStatus.BAD_REQUEST,
		);
	}

	// একটা payment-এ একাধিক pending refund request আটকানো
	const hasPendingRefund = payment.refunds.some(
		(r) => r.status === "REQUESTED" || r.status === "APPROVED" || r.status === "PROCESSING",
	);

	if (hasPendingRefund) {
		throw new AppError(
			"A refund is already in progress for this payment",
			httpStatus.CONFLICT,
		);
	}

	const refund = await prisma.refund.create({
		data: {
			paymentId,
			amount: payload.amount,
			reason: payload.reason,
			requestedBy: customerId,
			status: "REQUESTED",
		},
	});

	await prisma.payment.update({
		where: { id: paymentId },
		data: { status: "REFUND_REQUESTED" },
	});

	return refund;
};

const getAllRefunds = async (status?: string) => {
	if (status && !Object.values(RefundStatus).includes(status as RefundStatus)) {
		throw new AppError("Invalid status filter", httpStatus.BAD_REQUEST);
	}

	return prisma.refund.findMany({
		where: status ? { status: status as RefundStatus } : {},
		include: {
			payment: {
				include: {
					request: { select: { id: true, serviceType: true, customer: { select: { name: true, phone: true } } } },
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
};

const approveRefund = async (refundId: string) => {
	const refund = await prisma.refund.findUnique({ where: { id: refundId } });

	if (!refund) {
		throw new AppError("Refund request not found", httpStatus.NOT_FOUND);
	}

	if (refund.status !== "REQUESTED") {
		throw new AppError(
			"Only requested refunds can be approved",
			httpStatus.BAD_REQUEST,
		);
	}

	return prisma.refund.update({
		where: { id: refundId },
		data: { status: "APPROVED" },
	});
};

const rejectRefund = async (refundId: string) => {
	const refund = await prisma.refund.findUnique({ where: { id: refundId } });

	if (!refund) {
		throw new AppError("Refund request not found", httpStatus.NOT_FOUND);
	}

	if (refund.status !== "REQUESTED") {
		throw new AppError(
			"Only requested refunds can be rejected",
			httpStatus.BAD_REQUEST,
		);
	}

	const [updatedRefund] = await prisma.$transaction([
		prisma.refund.update({
			where: { id: refundId },
			data: { status: "REJECTED" },
		}),
		prisma.payment.update({
			where: { id: refund.paymentId },
			data: { status: "PAID" }, // reject হলে payment আগের PAID অবস্থায় ফিরে যাবে
		}),
	]);

	return updatedRefund;
};

// Admin approve করার পর actual gateway-তে refund call হবে এখানে
const processRefund = async (refundId: string) => {
	const refund = await prisma.refund.findUnique({
		where: { id: refundId },
		include: { payment: true },
	});

	if (!refund) {
		throw new AppError("Refund request not found", httpStatus.NOT_FOUND);
	}

	if (refund.status !== "APPROVED") {
		throw new AppError(
			"Only approved refunds can be processed",
			httpStatus.BAD_REQUEST,
		);
	}

	await prisma.refund.update({
		where: { id: refundId },
		data: { status: "PROCESSING" },
	});

	// TODO: bKash হলে এখানে actual Refund Transaction API call হবে
	// cash payment-এ gateway call লাগবে না, সরাসরি COMPLETED ধরে নেওয়া যায় (manual refund admin করে দিয়েছে ধরে নিয়ে)
	const mockGatewayRefundId = `RFD-${Date.now()}`;

	const isFullRefund = refund.amount === refund.payment.amount;

	const [updatedRefund] = await prisma.$transaction([
		prisma.refund.update({
			where: { id: refundId },
			data: {
				status: "COMPLETED",
				gatewayRefundId: mockGatewayRefundId,
				processedAt: new Date(),
			},
		}),
		prisma.payment.update({
			where: { id: refund.paymentId },
			data: {
				status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
			},
		}),
	]);

	return updatedRefund;
};

// ---------- ADMIN ----------

const getAllPayments = async (status?: string) => {
	if (status && !Object.values(PaymentStatus).includes(status as PaymentStatus)) {
		throw new AppError("Invalid status filter", httpStatus.BAD_REQUEST);
	}

	return prisma.payment.findMany({
		where: status ? { status: status as PaymentStatus } : {},
		include: {
			request: {
				select: {
					id: true,
					serviceType: true,
					customer: { select: { name: true, phone: true } },
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
};

export const PaymentService = {
	getPaymentById,
	getMyPayments,
	initiateBkashPayment,
	handleBkashCallback,
	confirmCashPayment,
	requestRefund,
	getAllRefunds,
	approveRefund,
	rejectRefund,
	processRefund,
	getAllPayments,
};