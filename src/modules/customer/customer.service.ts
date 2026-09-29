// customer/customer.service.ts

// biome-ignore assist/source/organizeImports: <explanation>
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../lib/prisma";
import { Role } from "../../../prisma/generated/prisma/enums";
import { IUpdateCustomerProfile } from "./customer.interface";

const getProfile = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		omit: { password: true },
	});

	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	// শুধু CUSTOMER role-এর জন্যই এই endpoint — ভুল করে mechanic/admin ঢুকে গেলে আটকানো
	if (user.role !== Role.CUSTOMER) {
		throw new AppError(
			"This profile does not belong to a customer account",
			httpStatus.FORBIDDEN,
		);
	}

	return user;
};

const updateProfile = async (
	userId: string,
	payload: IUpdateCustomerProfile,
) => {
	const user = await prisma.user.findUnique({ where: { id: userId } });

	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	if (user.role !== Role.CUSTOMER) {
		throw new AppError(
			"This profile does not belong to a customer account",
			httpStatus.FORBIDDEN,
		);
	}

	// শুধু যা পাঠানো হয়েছে সেটাই update হবে, বাকি field অপরিবর্তিত থাকবে
	const { name, phone } = payload;

	return prisma.user.update({
		where: { id: userId },
		data: {
			...(name && { name }),
			...(phone && { phone }),
		},
		omit: { password: true },
	});
};

const getMyRequests = async (userId: string, status?: string) => {
	return prisma.serviceRequest.findMany({
		where: {
			customerId: userId,
			...(status && { status: status as any }),
		},
		include: {
			mechanic: {
				select: {
					id: true,
					rating: true,
					user: {
						select: {
							name: true,
							phone: true,
						},
					},
				},
			},
			payment: true,
			review: true,
		},
		orderBy: { createdAt: "desc" },
	});
};

const deactivateAccount = async (userId: string) => {
	const user = await prisma.user.findUnique({ where: { id: userId } });

	if (!user) {
		throw new AppError("User not found", httpStatus.NOT_FOUND);
	}

	if (user.isDeleted) {
		throw new AppError(
			"Account is already deactivated",
			httpStatus.BAD_REQUEST,
		);
	}

	// soft delete — hard delete করা হচ্ছে না, কারণ ServiceRequest/Review history রেফারেন্স রাখা দরকার
	return prisma.user.update({
		where: { id: userId },
		data: { isDeleted: true },
		omit: { password: true },
	});
};

export const CustomerService = {
	getProfile,
	updateProfile,
	getMyRequests,
	deactivateAccount,
};