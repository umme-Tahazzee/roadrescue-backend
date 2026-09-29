// customer/customer.controller.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsyn";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../utils/AppError";
import { IRequestUser } from "../auth/auth.interface";
import { CustomerService } from "./customer.service";

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

const getProfile = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);

	const result = await CustomerService.getProfile(user.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Customer profile fetched successfully",
		data: result,
	});
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);

	const result = await CustomerService.updateProfile(user.userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Customer profile updated successfully",
		data: result,
	});
});

const getMyRequests = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const status = req.query.status as string | undefined;

	const result = await CustomerService.getMyRequests(user.userId, status);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service request history fetched successfully",
		data: result,
	});
});

const deactivateAccount = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);

	const result = await CustomerService.deactivateAccount(user.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Account deactivated successfully",
		data: result,
	});
});

export const CustomerControllers = {
	getProfile,
	updateProfile,
	getMyRequests,
	deactivateAccount,
};