// biome-ignore assist/source/organizeImports: <explanation>
import { AuthService } from "./auth.service";
import { catchAsync } from "../../utils/catchAsyn";
import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { IRequestUser } from "./auth.interface";
import { AppError } from "../../utils/AppError";
import config from "../../config";

// FIX: cookie options একটা জায়গায় centralize করা — যাতে login/refresh/googleAuth
// সব জায়গায় consistent থাকে, আর dev/prod অনুযায়ী secure+sameSite ঠিক হয়
const isProd = config.node_env === "production";

const getAccessTokenCookieOptions = () => ({
	httpOnly: true,
	secure: isProd,
	sameSite: (isProd ? "none" : "lax") as "none" | "lax",
	maxAge: 1000 * 60 * 15, // 15 minutes — matches short-lived access token
});

const getRefreshTokenCookieOptions = () => ({
	httpOnly: true,
	secure: isProd,
	sameSite: (isProd ? "none" : "lax") as "none" | "lax",
	maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});

const register = catchAsync(async (req: Request, res: Response, Next: NextFunction) => {
	const payload = req.body;
	const result = await AuthService.register(payload);
	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "OTP send successfully",
		data: result,
	});
});

const verficationEmail = catchAsync(async (req: Request, res: Response, Next: NextFunction) => {
	const payload = req.body;
	const result = await AuthService.verifycustomerEmail(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "verify email successfully",
		data: result,
	});
});

const login = catchAsync(async (req: Request, res: Response, Next: NextFunction) => {
	const payload = req.body;
	const result = await AuthService.login(payload);

	const { accessToken, refreshToken } = result;

	res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
	res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

	sendResponse(res, {
		statusCode: httpStatus.OK, // FIX: login success হলো CREATED (201) না, OK (200) হওয়া উচিত
		success: true,
		message: "User Login Successfully",
		data: result,
	});
});

const getMe = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as unknown as IRequestUser;

	if (!user) {
		// FIX: plain Error -> AppError
		throw new AppError(
			"User information is missing in the request",
			httpStatus.UNAUTHORIZED,
		);
	}

	const result = await AuthService.getMe(user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile fetched successfully",
		data: result,
	});
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	if (!req.cookies.refreshToken) {
		// FIX: plain Error -> AppError
		throw new AppError("Refresh token is missing", httpStatus.UNAUTHORIZED);
	}
	const result = await AuthService.refreshToken(req.cookies.refreshToken);
	const { accessToken, refreshToken: newRefreshToken } = result;

	res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
	res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "New tokens generated successfully",
		data: null, // FIX: cookie-তেই token আছে, body-তে আবার পাঠানোর দরকার নেই (httpOnly-র purpose নষ্ট হয়)
	});
});

const googleAuth = catchAsync(async (req: Request, res: Response) => {
	const { idToken } = req.body;

	if (!idToken) {
		throw new AppError("Google idToken is required", httpStatus.BAD_REQUEST);
	}

	const result = await AuthService.googleAuth(idToken);

	// FIX: এখানে cookie set করাই হচ্ছিল না — login-এর মতো এখানেও
	// accessToken/refreshToken cookie-তে বসাতে হবে, নাহলে google login-এর
	// পর user session actually persist করবে না
	res.cookie("accessToken", result.accessToken, getAccessTokenCookieOptions());
	res.cookie("refreshToken", result.refreshToken, getRefreshTokenCookieOptions());

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Google authentication successful",
		data: { user: result.user },
	});
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body; // FIX: নাম পরিষ্কার করা হলো, functionally একই আচরণ
	const result = await AuthService.forgotPassword(payload);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "OTP sent successfully",
		data: result,
	});
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AuthService.resetPassword(payload);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Reset Password Successfully",
		data: result,
	});
});

const logout = catchAsync(async (req: Request, res: Response) => {
	const refreshTokenValue = req.cookies.refreshToken;

	await AuthService.logout(refreshTokenValue);

	res.clearCookie("accessToken", getAccessTokenCookieOptions());
	res.clearCookie("refreshToken", getRefreshTokenCookieOptions());

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Logged out successfully",
		data: null,
	});
});

export const AuthControllers = {
	register,
	verficationEmail,
	login,
	getMe,
	refreshToken,
	googleAuth,
	forgotPassword,
	resetPassword,
	logout,
};