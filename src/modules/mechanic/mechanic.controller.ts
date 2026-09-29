// mechanic-profile/mechanic.controller.ts
// biome-ignore assist/source/organizeImports: <explanation>
import { Request, Response } from "express";
import httpStatus from "http-status";
import { UploadApiResponse } from "cloudinary";
import { MechanicService } from "./mechanic.service";
import { IRequestUser } from "../auth/auth.interface";
import { AppError } from "../../utils/AppError";
import { deleteFromCloudinary, uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsyn";


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


const parseServiceTypes = (raw: unknown): string[] => {
	try {
		const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
		if (!Array.isArray(parsed) || parsed.length === 0) throw new Error();
		return parsed;
	} catch {
		throw new AppError(
			'serviceTypes must be a JSON array, e.g. ["TOWING","TYRE_CHANGE"]',
			httpStatus.BAD_REQUEST,
		);
	}
};

const createProfile = catchAsync(async (req: Request, res: Response) => {
	 const user = getRequestUser(req);

	 const files = req.files as Record<string, Express.Multer.File[]> | undefined;

	const nid = files?.nidDoc?.[0];
	const license = files?.licenseDoc?.[0];
	const vehicle = files?.vehiclePhoto?.[0];

	if (!nid || !license || !vehicle) {
		throw new AppError(
			"nidDoc, licenseDoc and vehiclePhoto are required",
			httpStatus.BAD_REQUEST,
		);
	}

	// upload-er age body validate, jate invalid input-e file upload-i na hoy
	const serviceTypes = parseServiceTypes(req.body.serviceTypes);

	const serviceRadius = req.body.serviceRadius
		? Number(req.body.serviceRadius)
		: undefined;

	if (serviceRadius !== undefined && (Number.isNaN(serviceRadius) || serviceRadius <= 0)) {
		throw new AppError(
			"serviceRadius must be a positive number",
			httpStatus.BAD_REQUEST,
		);
	}

	// 3 ta file parallel-e upload; allSettled, jate ekta fail korleo baki gulo track kora jay
	const results = await Promise.allSettled([
		uploadToCloudinary(nid, "nid"),
		uploadToCloudinary(license, "license"),
		uploadToCloudinary(vehicle, "vehicle"),
	]);

	const uploaded = results
		.filter(
			(r): r is PromiseFulfilledResult<UploadApiResponse> =>
				r.status === "fulfilled",
		)
		.map((r) => r.value);

	// kono ekta fail korle jegulo upload hoyeche segulo muche dao
	if (uploaded.length !== results.length) {
		await deleteFromCloudinary(uploaded.map((u) => u.public_id));
		throw new AppError(
			"File upload failed, please try again",
			httpStatus.BAD_GATEWAY,
		);
	}

	const [nidRes, licenseRes, vehicleRes] = uploaded;

	try {
		const profile = await MechanicService.createProfile(user.userId, {
			serviceTypes,
			serviceRadius,
			nidDoc: nidRes.secure_url,
			licenseDoc: licenseRes.secure_url,
			vehiclePhoto: vehicleRes.secure_url,
		});

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Mechanic profile created",
			data: profile,
		});
	} catch (err) {
		
		await deleteFromCloudinary([
			nidRes.public_id,
			licenseRes.public_id,
			vehicleRes.public_id,
		]);
		throw err;
	}
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);

	const result = await MechanicService.getMyProfile(user.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Mechanic profile fetched successfully",
		data: result,
	});
})

const toggleAvailability = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const { isAvailable } = req.body;

	if (typeof isAvailable !== "boolean") {
		throw new AppError(
			"isAvailable must be a boolean (true or false)",
			httpStatus.BAD_REQUEST,
		);
	}

	const result = await MechanicService.toggleAvailability(
		user.userId,
		isAvailable,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: isAvailable ? "You are now online" : "You are now offline",
		data: result,
	});
});

const updateLocation = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const { lat, lng } = req.body;

	const result = await MechanicService.updateLocation(user.userId, lat, lng);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Location updated successfully",
		data: result,
	});
});

const getAllProfiles = catchAsync(async (req: Request, res: Response) => {
	const status = req.query.status as string | undefined;

	const result = await MechanicService.getAllProfiles(status);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Mechanic profiles fetched successfully",
		data: result,
	});
});



export const MechanicController = {
	createProfile,
	getMyProfile,
	toggleAvailability,
	updateLocation,
	getAllProfiles
};