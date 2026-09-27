// biome-ignore assist/source/organizeImports: <explanation>
import { AppError } from "../../utils/AppError";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import {
	IForgetPassword,
	ILoginUserPayload,
	IRegisterCustomer,
	IRequestUser,
	IResetPassword,
	IVerifyEmailPayload,
} from "./auth.interface";
import { redisClient } from "../../utils/redis";
import path from "path";
import { transporter } from "../../lib/nodemailer";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import httpStatus from "http-status";
import { verficationGoogleToken } from "../../lib/googleAuth";
import { AuthProvider, Role } from "../../../prisma/generated/prisma/enums";
import ejs, { renderFile } from "ejs"

const register = async (payload: IRegisterCustomer) => {
	const { name, email, password } = payload;

	const isExistUser = await prisma.user.findUnique({
		where: { email },
	});

	if (isExistUser) {
		throw new AppError("A user with this email already exists.", 409);
	}

	const hashedPassword = await bcrypt.hash(password, 8);

	const OTP_EXPIRY_MINUTES = 5 * 60;
	const otpKey = `customer-registration-otp:${email}`;
	const otpValue = crypto.randomInt(100000, 1000000).toString();
	console.log(otpValue, "refister");

	await redisClient.set(otpKey, otpValue, {
		expiration: { type: "EX", value: OTP_EXPIRY_MINUTES },
	});

	const userRegistrationKey = `customer-registration-data:${email}`;
	const redisUserPayload = { name, email, password: hashedPassword };

	await redisClient.set(userRegistrationKey, JSON.stringify(redisUserPayload), {
		expiration: { type: "EX", value: OTP_EXPIRY_MINUTES },
	});

	const templatePath = path.join(
		process.cwd(),
		"src/templates/registration-user-otp.ejs",
	);

	const html = await ejs.renderFile(templatePath, {
		name,
		email,
		otp: otpValue,
		expirationMinutes: OTP_EXPIRY_MINUTES / 60,
	});

	await transporter.sendMail({
		from: config.email_sender,
		to: email,
		subject: "Email verfication",
		html,
	});
};

const verifycustomerEmail = async (payload: IVerifyEmailPayload) => {
	const otp = payload.otp;
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({ where: { email } });

	if (isUserExists?.isDeleted || isUserExists?.isBlocked) {
		throw new AppError("This account is not accessible", httpStatus.FORBIDDEN);
	}

	const otpKey = `customer-registration-otp:${email}`;
	const storedOtp = await redisClient.get(otpKey);

	if (!storedOtp) {
		throw new AppError("OTP expired or invalid", httpStatus.GONE);
	}

	if (storedOtp !== otp) {
		throw new AppError("OTP does not match", httpStatus.BAD_REQUEST);
	}

	await redisClient.del(otpKey);

	const customerRegistrationKey = `customer-registration-data:${email}`;
	const redisCustomerData = await redisClient.get(customerRegistrationKey);

	if (!redisCustomerData) {
		throw new AppError(
			"Registration data not found or expired",
			httpStatus.NOT_FOUND,
		);
	}

	const customerPayload: IRegisterCustomer = JSON.parse(redisCustomerData);

	// FIX: authProvider explicitly set to CREDENTIAL for local signups,
	// so it's never left to the schema default implicitly.
	const user = await prisma.user.create({
		data: {
			name: customerPayload.name,
			email: customerPayload.email,
			password: customerPayload.password,
			authProvider: AuthProvider.CREDENTIAL,
		},
		omit: { password: true },
	});

	await redisClient.del(customerRegistrationKey);

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);
	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return { user, accessToken, refreshToken };
};

const login = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase(); // FIX: was .toString(), should normalize case too

	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	if (user.isBlocked) {
		throw new AppError("User is blocked", httpStatus.FORBIDDEN);
	}

	// FIX: 204 is a success status ("No Content"), never an error status.
	// Using 410 (Gone) for a soft-deleted account instead.
	if (user.isDeleted) {
		throw new AppError("User is deleted", httpStatus.GONE);
	}

	// FIX: Google-authenticated users have no password — guard before bcrypt.compare
	if (!user.password) {
		throw new AppError(
			"This account uses Google sign-in. Please log in with Google.",
			httpStatus.BAD_REQUEST,
		);
	}

	const isPasswordMatched = await bcrypt.compare(password, user.password);
	if (!isPasswordMatched) {
		throw new AppError("Invalid credentials", httpStatus.BAD_REQUEST);
	}

	// FIX: removed `password` from JWT payload — hashed or not, secrets
	// never belong inside a token that gets sent to and stored by the client.
	const jwtPayload = {
		userId: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return { accessToken, refreshToken };
};

const getMe = async (user: IRequestUser) => {
	// FIX: validate the incoming user object BEFORE using it in a query,
	// not after — previously this check ran too late to matter.
	if (!user) {
		throw new AppError(
			"User information is missing in the request",
			httpStatus.UNAUTHORIZED,
		);
	}

	const isUserExists = await prisma.user.findUnique({
		where: { id: user.userId },
		include: { requests: true, reviews: true },
		omit: { password: true },
	});

	if (!isUserExists) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	return isUserExists;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	
	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new AppError(
			config.node_env === "development"
				? String(verifiedRefreshToken.error)
				: "Invalid refresh token",
			httpStatus.UNAUTHORIZED,
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({ where: { id: data.userId } });

	if (!user || user.isDeleted || user.isBlocked) {
		throw new AppError("User is inactive or not found", httpStatus.UNAUTHORIZED);
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return { accessToken, refreshToken };
};

const googleAuth = async (idToken: string) => {
	const googleUser = await verficationGoogleToken(idToken);

	let user = await prisma.user.findUnique({
		where: { email: googleUser.email },
	});

	if (!user) {
		// FIX (the original type error): this only compiles once `password`
		// is made optional in schema.prisma — see note below the code.
		user = await prisma.user.create({
			data: {
				name: googleUser.name,
				email: googleUser.email,
				googleId: googleUser.googleId,
				authProvider: AuthProvider.GOOGLE,
				role: Role.CUSTOMER,
			},
		});
	} else if (!user.googleId) {
		user = await prisma.user.update({
			where: { id: user.id },
			data: { googleId: googleUser.googleId },
		});
	}

	if (user.isBlocked) {
		throw new AppError("User is blocked", httpStatus.FORBIDDEN);
	}

	// FIX: also guard deleted accounts here, same as login()
	if (user.isDeleted) {
		throw new AppError("User is deleted", httpStatus.GONE);
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);
	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return { user, accessToken, refreshToken };
};

const forgotPassword = async (payload: IForgetPassword) => {
	const { email } = payload;
	const isUserExists = await prisma.user.findUnique({ where: { email } });

	if (!isUserExists) {
		throw new AppError("User does not exist", httpStatus.NOT_FOUND);
	}

	if (isUserExists.isBlocked || isUserExists.isDeleted) {
		throw new AppError("User is blocked or deleted", httpStatus.FORBIDDEN);
	}

	// FIX: compare against the enum member, not a raw string
	if (isUserExists.authProvider !== AuthProvider.CREDENTIAL) {
		throw new AppError(
			"This account uses Google sign-in and has no password to reset",
			httpStatus.BAD_REQUEST, // FIX: 304/NOT_MODIFIED made no sense here
		);
	}

	const otp = crypto.randomInt(100000, 1000000).toString();

	const key = `forget-password:${email}`;

	const OTP_EXPIRY_MINUTES = 5 * 60;
	await redisClient.set(key, otp, {
		expiration: { type: "EX", value: OTP_EXPIRY_MINUTES },
	});

	const templatePath = path.join(
		process.cwd(),
		"src/templates/forgot-password.ejs",
	);
	const html = await ejs.renderFile(templatePath, {
		name: isUserExists.name,
		OTP: otp,
		OTP_EXPIRY_MINUTES,
	});
	await transporter.sendMail({
		from: config.email_sender,
		to: isUserExists.email,
		subject: "Forgot password",
		html,
	});
};

const resetPassword = async (payload: IResetPassword) => {
	const { email, newPassword, otp } = payload;

	const isUserExists = await prisma.user.findUnique({ where: { email } });

	if (!isUserExists) {
		throw new AppError("User does not exist", httpStatus.NOT_FOUND);
	}
	if (isUserExists?.isDeleted || isUserExists?.isBlocked) {
		throw new AppError("This account is not accessible", httpStatus.FORBIDDEN);
	}
	if (isUserExists.authProvider !== AuthProvider.CREDENTIAL) {
		// FIX: plain Error -> AppError
		throw new AppError(
			"This account uses Google sign-in and has no password to reset",
			httpStatus.BAD_REQUEST,
		);
	}

	// FIX: matches the key forgotPassword actually writes to
	const otpKey = `forget-password:${email}`;
	const storedOtp = await redisClient.get(otpKey);

	if (!storedOtp) {
		throw new AppError("OTP expired or invalid", httpStatus.GONE);
	}

	if (storedOtp !== otp) {
		throw new AppError("OTP does not match", httpStatus.BAD_REQUEST);
	}

	const hashedPassword = await bcrypt.hash(
		newPassword,
		Number(config.bcrypt_salt_rounds),
	);

	await prisma.user.update({
		where: { email: isUserExists.email },
		data: { password: hashedPassword },
	});

	const templatePath = path.join(
		process.cwd(),
		"src/templates/reset-password-success.ejs",
	);

	const html = await ejs.renderFile(templatePath, {
		name: isUserExists.name,
	});

	await redisClient.del(otpKey);
	await transporter.sendMail({
		from: config.email_sender,
		to: isUserExists.email,
		subject: "Password is changed",
		html,
	});
};

export const AuthService = {
	register,
	verifycustomerEmail,
	refreshToken,
	login,
	getMe,
	googleAuth,
	forgotPassword,
	resetPassword,
};