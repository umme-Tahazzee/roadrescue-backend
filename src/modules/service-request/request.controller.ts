// service-request/request.controller.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsyn";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../utils/AppError";
import { IRequestUser } from "../auth/auth.interface";
import { RequestService } from "./request.service";

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

// ---------- CUSTOMER ----------

const createRequest = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);

	const result = await RequestService.createRequest(user.userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Service request created successfully",
		data: result,
	});
});

const getNearbyMechanics = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const requestId = req.params.id as string;

	const result = await RequestService.getNearbyMechanicsForRequest(
		requestId,
		user.userId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Nearby mechanics fetched successfully",
		data: result,
	});
});

const cancelRequest = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const requestId = req.params.id as string;

	const result = await RequestService.cancelRequest(requestId, user.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service request cancelled successfully",
		data: result,
	});
});

// ---------- MECHANIC ----------

const getPendingRequests = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);

	const result = await RequestService.getPendingRequestsForMechanic(user.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Pending nearby requests fetched successfully",
		data: result,
	});
});

const acceptRequest = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const requestId = req.params.id as string;

	const result = await RequestService.acceptRequest(requestId, user.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service request accepted successfully",
		data: result,
	});
});

const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const requestId = req.params.id as string;
	const { status } = req.body;

	if (!["IN_PROGRESS", "COMPLETED"].includes(status)) {
		throw new AppError(
			"status must be IN_PROGRESS or COMPLETED",
			httpStatus.BAD_REQUEST,
		);
	}

	const result = await RequestService.updateRequestStatus(
		requestId,
		user.userId,
		status,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: `Request marked as ${status}`,
		data: result,
	});
});

export const RequestControllers = {
	createRequest,
	getNearbyMechanics,
	cancelRequest,
	getPendingRequests,
	acceptRequest,
	updateRequestStatus,
};