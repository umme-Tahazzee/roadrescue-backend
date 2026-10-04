// admin/admin.controller.ts

// biome-ignore assist/source/organizeImports: <explanation>
import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsyn";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../utils/AppError";
import { IRequestUser } from "../auth/auth.interface";
import { AdminService } from "./admin.service";

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
	const admin = getRequestUser(req);

	const result = await AdminService.getProfile(admin.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Admin profile fetched successfully",
		data: result,
	});
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const role = req.query.role as string | undefined;

	const result = await AdminService.getAllUsers(role);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Users fetched successfully",
		data: result,
	});
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
	const targetUserId = req.params.id as string;

	const result = await AdminService.getUserById(targetUserId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User details fetched successfully",
		data: result,
	});
});

const toggleBlockUser = catchAsync(async (req: Request, res: Response) => {
	const admin = getRequestUser(req);
	const targetUserId = req.params.id as string;
	const { isBlocked } = req.body;

	if (typeof isBlocked !== "boolean") {
		throw new AppError(
			"isBlocked must be a boolean (true or false)",
			httpStatus.BAD_REQUEST,
		);
	}

	const result = await AdminService.toggleBlockUser(
		targetUserId,
		isBlocked,
		admin.userId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: isBlocked ? "User blocked successfully" : "User unblocked successfully",
		data: result,
	});
});

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
	const result = await AdminService.getDashboardStats();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Dashboard stats fetched successfully",
		data: result,
	});
});

const getAllRequests = catchAsync(async (req: Request, res: Response) => {
	const status = req.query.status as string | undefined;

	const result = await AdminService.getAllRequests(status);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Service requests fetched successfully",
		data: result,
	});
});

export const AdminControllers = {
	getProfile,
	getAllUsers,
	getUserById,
	toggleBlockUser,
	getDashboardStats,
	getAllRequests,
};