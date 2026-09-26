import { AppError } from "../../utils/AppError";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import config from "../../config";
import ejs from 'ejs'
import { prisma } from "../../lib/prisma";
import { IRegister } from "./auth.interface";
import { redisClient } from "../../utils/redis";
import path from "path";
import { transporter } from "../../lib/nodemailer";




const register = async (payload: IRegister) => {
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

	const otpKey = `customer-registration-otp${email}`;
	const otpValue = crypto.randomInt(100000, 1000000).toString();
	await redisClient.set(otpKey, otpValue, {
		expiration: {
			type: "EX",
			value: OTP_EXPIRY_MINUTES,
		},
	});

	const userRegistrationKey = `customer-registration-data${email}`;
	const redisUserPayload = {
		name,
		email,
		password: hashedPassword,
	};

	await redisClient.set(userRegistrationKey, 
        JSON.stringify(redisUserPayload), {
		expiration: {
			type: "EX",
			value: OTP_EXPIRY_MINUTES,
		},
	});

    const templatePath = path.join(
         process.cwd(),
         "src/templates/registration-user-otp.ejs"
    )

    const html = await ejs.renderFile(templatePath, {
        name, 
        email,
        otp:otpValue,
        expirationMinutes:  OTP_EXPIRY_MINUTES/60
    })

	console.log("EMAIL_USER:", process.env.EMAIL_USER);
   console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "UNDEFINED");
   
   await transporter.sendMail({
		from: config.email_sender,
		to: email,
		subject: "Email verfication",
		html,
	});

};

const login = async () => {};

const googleAuth = async () => {};

const refreshToken = async () => {};

const logout = async () => {};

export const AuthService = {
	register,
};