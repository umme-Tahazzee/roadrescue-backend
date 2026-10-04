// payment/payment.controller.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsyn";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../utils/AppError";
import { IRequestUser } from "../auth/auth.interface";
import { PaymentService } from "./payment.service";

const getRequestUser = (req: Request): IRequestUser => {
	const user = req.user as unknown as IRequestUser;

	if (!user) {
		throw new AppError(
			"User information is missing in the request",
			httpStatus.UNAUTHORIZED,
		);
	}

	return user;
};

// ---------- VIEW ----------

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const paymentId = req.params.id as string;

	const result = await PaymentService.getPaymentById(paymentId, user.userId, user.role);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment details fetched successfully",
		data: result,
	});
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const status = req.query.status as string | undefined;

	const result = await PaymentService.getMyPayments(user.userId, status);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Your payments fetched successfully",
		data: result,
	});
});

// ---------- BKASH ----------

const initiateBkashPayment = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const paymentId = req.params.id as string;

	const result = await PaymentService.initiateBkashPayment(paymentId, user.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "bKash payment initiated",
		data: result,
	});
});

// এটা public endpoint — bKash সার্ভার থেকে সরাসরি কল হবে, কোনো auth middleware থাকবে না
const bkashCallback = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.handleBkashCallback(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Callback processed",
		data: result,
	});
});

// ---------- CASH ----------

const confirmCashPayment = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const paymentId = req.params.id as string;

	const result = await PaymentService.confirmCashPayment(paymentId, user.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Cash payment confirmed successfully",
		data: result,
	});
});

// ---------- REFUND ----------

const requestRefund = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const paymentId = req.params.id as string;
	const { amount, reason } = req.body;

	if (typeof amount !== "number" || amount <= 0) {
		throw new AppError("amount must be a positive number", httpStatus.BAD_REQUEST);
	}

	if (!reason || typeof reason !== "string") {
		throw new AppError("reason is required", httpStatus.BAD_REQUEST);
	}

	const result = await PaymentService.requestRefund(paymentId, user.userId, {
		amount,
		reason,
	});

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Refund request submitted successfully",
		data: result,
	});
});

const getAllRefunds = catchAsync(async (req: Request, res: Response) => {
	const status = req.query.status as string | undefined;

	const result = await PaymentService.getAllRefunds(status);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Refunds fetched successfully",
		data: result,
	});
});

const approveRefund = catchAsync(async (req: Request, res: Response) => {
	const refundId = req.params.id as string;

	const result = await PaymentService.approveRefund(refundId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Refund approved successfully",
		data: result,
	});
});

const rejectRefund = catchAsync(async (req: Request, res: Response) => {
	const refundId = req.params.id as string;

	const result = await PaymentService.rejectRefund(refundId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Refund rejected",
		data: result,
	});
});

const processRefund = catchAsync(async (req: Request, res: Response) => {
	const refundId = req.params.id as string;

	const result = await PaymentService.processRefund(refundId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Refund processed successfully",
		data: result,
	});
});

// ---------- ADMIN ----------

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
	const status = req.query.status as string | undefined;

	const result = await PaymentService.getAllPayments(status);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payments fetched successfully",
		data: result,
	});
});

export const PaymentControllers = {
	getPaymentById,
	getMyPayments,
	initiateBkashPayment,
	bkashCallback,
	confirmCashPayment,
	requestRefund,
	getAllRefunds,
	approveRefund,
	rejectRefund,
	processRefund,
	getAllPayments,
};