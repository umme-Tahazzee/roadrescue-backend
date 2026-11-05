// mechanic-profile/mechanic.controller.ts
// biome-ignore assist/source/organizeImports: <explanation>
import { Request, Response } from "express";
import httpStatus from "http-status";
import { UploadApiResponse } from "cloudinary";
import { MechanicService } from "./mechanic.service";
import { MechanicValidation } from "./mechanic.validation";
import { IRequestUser } from "../auth/auth.interface";
import { AppError } from "../../utils/AppError";
import {
	deleteFromCloudinary,
	uploadToCloudinary,
} from "../../utils/uploadToCloudinary";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsyn";

const MAX_SERVICE_TYPES = 10;
const MAX_LENGTH = 40;

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
	let value: unknown = raw;

	if (typeof value === "string") {
		const str = value.trim();
		if (str.startsWith("[")) {
			try {
				value = JSON.parse(str);
			} catch {
				throw new AppError(
					"serviceTypes is not valid JSON",
					httpStatus.BAD_REQUEST,
				);
			}
		} else {
			value = str.split(",");
		}
	}

	if (!Array.isArray(value)) {
		throw new AppError("serviceTypes must be a list", httpStatus.BAD_REQUEST);
	}

	// string kore, extra space collapse kore, lowercase kore
	const cleaned = value
		.filter((v): v is string => typeof v === "string")
		.map((v) => v.trim().replace(/\s+/g, " ").toLowerCase())
		.filter((v) => v !== "");

	const unique = [...new Set(cleaned)];

	if (unique.length === 0) {
		throw new AppError(
			"At least one service type is required",
			httpStatus.BAD_REQUEST,
		);
	}
	if (unique.length > MAX_SERVICE_TYPES) {
		throw new AppError(
			`Maximum ${MAX_SERVICE_TYPES} service types allowed`,
			httpStatus.BAD_REQUEST,
		);
	}
	if (unique.some((v) => v.length > MAX_LENGTH)) {
		throw new AppError(
			`Each service type must be at most ${MAX_LENGTH} characters`,
			httpStatus.BAD_REQUEST,
		);
	}

	return unique;
};

const createProfile = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);

	const files = req.files as Record<string, Express.Multer.File[]> | undefined;
	const nid = files?.nidDoc?.[0];
	const license = files?.licenseDoc?.[0];
	const vehiclePhotos = files?.vehiclePhoto ?? []; // up to 5 photos

	if (!nid || !license || vehiclePhotos.length === 0) {
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

	if (
		serviceRadius !== undefined &&
		(Number.isNaN(serviceRadius) || serviceRadius <= 0)
	) {
		throw new AppError(
			"serviceRadius must be a positive number",
			httpStatus.BAD_REQUEST,
		);
	}

	// all files upload parallel-e; allSettled, jate ekta fail korleo baki gulo track kora jay
	const results = await Promise.allSettled([
		uploadToCloudinary(nid, "nid"),
		uploadToCloudinary(license, "license"),
		...vehiclePhotos.map((photo) => uploadToCloudinary(photo, "vehicle")),
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

	// first two are nid + license, the rest are the vehicle photos
	const [nidRes, licenseRes, ...vehicleRes] = uploaded;

	try {
		const profile = await MechanicService.createProfile(user.userId, {
			serviceTypes,
			serviceRadius,
			nidDoc: nidRes.secure_url,
			licenseDoc: licenseRes.secure_url,
			vehiclePhoto: vehicleRes.map((v) => v.secure_url),
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
			...vehicleRes.map((v) => v.public_id),
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
});

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

const getMyJobs = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);
	const status = req.query.status as string | undefined;

	const result = await MechanicService.getMyJobs(user.userId, status);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Jobs fetched successfully",
		data: result,
	});
});

const getMyStats = catchAsync(async (req: Request, res: Response) => {
	const user = getRequestUser(req);

	const result = await MechanicService.getMyStats(user.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Mechanic stats fetched successfully",
		data: result,
	});
});

const searchNearby = catchAsync(async (req: Request, res: Response) => {
	// the validation middleware only cleans the body, so the query is parsed here too
	const query = MechanicValidation.nearbySearchSchema.shape.query.parse(req.query);

	const result = await MechanicService.searchNearby(query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Nearby mechanics fetched successfully",
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

const approveProfile = catchAsync(async (req: Request, res: Response) => {
	const admin = getRequestUser(req);
	const profileId = req.params.id as string;

	const result = await MechanicService.approveProfile(profileId, admin.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Mechanic profile approved successfully",
		data: result,
	});
});

const rejectProfile = catchAsync(async (req: Request, res: Response) => {
	const profileId = req.params.id as string;

	const admin = getRequestUser(req);

	const result = await MechanicService.rejectProfile(profileId, admin.userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Mechanic profile rejected",
		data: result,
	});
});

export const MechanicController = {
	createProfile,
	getMyProfile,
	toggleAvailability,
	updateLocation,
	getMyJobs,
	getMyStats,
	searchNearby,
	getAllProfiles,
	approveProfile,
	rejectProfile,
};
