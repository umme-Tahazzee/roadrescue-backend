// middlewares/upload.ts
import multer from "multer";
import httpStatus from "http-status";
import { AppError } from "../utils/AppError";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
	fileFilter: (_req, file, cb) => {
		if (!ALLOWED.includes(file.mimetype)) {
			return cb(
				new AppError("Only JPG, PNG, WEBP or PDF allowed", httpStatus.BAD_REQUEST),
			);
		}
		cb(null, true);
	},
});

export const mechanicDocs = upload.fields([
	{ name: "nidDoc", maxCount: 1 },
	{ name: "licenseDoc", maxCount: 1 },
	{ name: "vehiclePhoto", maxCount: 1 },
]);