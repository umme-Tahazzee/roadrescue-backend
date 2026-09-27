// biome-ignore assist/source/organizeImports: <explanation>
import { AppError } from "../../utils/AppError";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import config from "../../config";
import ejs from "ejs";
import { prisma } from "../../lib/prisma";
import {
	ILoginUserPayload,
	IRegisterCustomer,
	IRequestUser,
	IVerifyEmailPayload,
} from "./auth.interface";
import { redisClient } from "../../utils/redis";
import path from "path";
import { transporter } from "../../lib/nodemailer";
import { jwtUtils } from "../../utils/jwt";
import { SignOptions } from "jsonwebtoken";
import httpStatus from "http-status";

const register = async (payload: IRegisterCustomer) => {
	const { name, email, password } = payload;

	const isExistUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (isExistUser) {
		throw new AppError("A user with this email  already exists.", 409);
	}

	const hashedPassword = await bcrypt.hash(password, 8);

	const OTP_EXPIRY_MINUTES = 5 * 60;

	const otpKey = `customer-registration-otp:${email}`;

	const otpValue = crypto.randomInt(100000, 1000000).toString();
	console.log(otpValue, "refister");

	await redisClient.set(otpKey, otpValue, {
		expiration: {
			type: "EX",
			value: OTP_EXPIRY_MINUTES,
		},
	});

	const userRegistrationKey = `customer-registration-data:${email}`;
	const redisUserPayload = {
		name,
		email,
		password: hashedPassword,
	};

	await redisClient.set(userRegistrationKey, JSON.stringify(redisUserPayload), {
		expiration: {
			type: "EX",
			value: OTP_EXPIRY_MINUTES,
		},
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
	console.log({ otp, email });

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists?.isDeleted || isUserExists?.isBlocked) {
		throw new Error("User is Deleted");
	}

	const otpKey = `customer-registration-otp:${email}`;
	const storedOtp = await redisClient.get(otpKey);
	console.log(storedOtp, "verfiy-email");

	if (!storedOtp) {
		throw new AppError("OTP expired or invalid", 410);
	}

	if (storedOtp !== otp) {
		throw new AppError("OTP does not match", 400);
	}

	await redisClient.del(otpKey);

	if (!storedOtp) {
		throw new AppError("OTP invalid", 402);
	}

	if (storedOtp !== otp) {
		throw new AppError("OTP does not match", 404);
	}

	await redisClient.del(otpKey);

	const customerRegistrationKey = `customer-registration-data:${email}`;
	const redisCustomerData = await redisClient.get(customerRegistrationKey);

	if (!redisCustomerData) {
		throw new AppError("Customer Doesnt exist", 404);
	}

	const customerPayload: IRegisterCustomer = JSON.parse(redisCustomerData);

	const createdUser: any = await prisma.user.create({
		data: {
			name: customerPayload.name,
			email: customerPayload.email,
			password: customerPayload.password,
		},
		omit: { password: true },
	});
	const user = createdUser;
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

	return {
		user,
		accessToken,
		refreshToken,
	};
};

const login = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toString();

	const user = await prisma.user.findUnique({
		where: { email },
	});
	if (!user) {
		throw new AppError("User not found", 404);
	}

	if (user.isBlocked) {
		throw new AppError("User is blocked", 403);
	}

	if (user.isDeleted) {
		throw new AppError("User is deleted", 204);
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password as string,
	);
	if (!isPasswordMatched) {
		throw new AppError("Invalid credentials", 400);
	}
	const jwtPayload = {
		userId: user.id,
		email: user.email,
		password: user.email,
		role: user.role,
	};

	console.log(jwtPayload);
	
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
	return {
		accessToken,
		refreshToken,
	};
};

const getMe = async (user: IRequestUser) => {
	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.userId,
		},
		include: {
			requests: true,
			reviews: true,
		},
		omit: {
			password: true,
		},
	});

	if (!user) {
		throw new AppError(
			"User information is missing in the request",
			httpStatus.UNAUTHORIZED,
		); // 401
	}

	// service-এ:
	if (!isUserExists) {
		throw new AppError("User not found", httpStatus.NOT_FOUND); // 404
	}

	return isUserExists;
};

export const AuthService = {
	register,
	verifycustomerEmail,
	login,
	getMe,
};
