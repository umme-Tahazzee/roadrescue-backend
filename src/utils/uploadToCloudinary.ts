// utils/uploadToCloudinary.ts
import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../lib/cloudinary";


export const uploadToCloudinary = (
	file: Express.Multer.File,
	folder: string,
): Promise<UploadApiResponse> => {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				folder: `roadside/${folder}`, // e.g. roadside/nid
				resource_type: "auto", // image + pdf dutoi support kore
			},
			(error, result) => {
				if (error || !result) return reject(error);
				resolve(result);
			},
		);
		stream.end(file.buffer); // memoryStorage-er buffer
	});
};

// DB fail korle uploaded file muche felar jonno
export const deleteFromCloudinary = async (publicIds: string[]) => {
	await Promise.allSettled(
		publicIds.map((id) => cloudinary.uploader.destroy(id)),
	);
};