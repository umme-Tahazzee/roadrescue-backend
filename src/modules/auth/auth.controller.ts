// biome-ignore assist/source/organizeImports: <explanation>
import { AuthService } from "./auth.service";
import { catchAsync } from "../../utils/catchAsyn";
import  httpStatus  from "http-status";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { IRequestUser } from "./auth.interface";

const register = catchAsync(async(req:Request, res:Response, Next:NextFunction)=>{

    const payload = req.body
    const result = await AuthService.register(payload)
    sendResponse(res,{
        statusCode: httpStatus.CREATED,
		success: true,
		message: "OTP send successfully",
		data: result
    })

})

const verficationEmail = catchAsync(async(req:Request, res:Response, Next:NextFunction)=>{
    const payload = req.body
    const result = await AuthService.verifycustomerEmail(payload)

    sendResponse(res,{
        statusCode: httpStatus.CREATED,
		success: true,
		message: "verify email successfully",
		data: result
    })

})


const login = catchAsync(async(req:Request, res:Response, Next:NextFunction)=>{
     const payload = req.body
     const result = await AuthService.login(payload)

    sendResponse(res,{
        statusCode: httpStatus.CREATED,
		success: true,
		message: "User Login Successfully",
		data: result
    })

})

const getMe = catchAsync(async (req: Request, res: Response) => {
    console.log(req.user);
	const user = req.user as unknown as IRequestUser;

	if (!user) {
		throw new Error("User information is missing in the request");
	}

	const result = await AuthService.getMe(user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile fetched successfully",
		data: result,
	});
});


const refreshToken = catchAsync(async(req:Request, res:Response, Next:NextFunction)=>{


})
const googleAuth = catchAsync(async(req:Request, res:Response, Next:NextFunction)=>{


})

const logout = catchAsync(async(req:Request, res:Response, Next:NextFunction)=>{


})
export const AuthControllers = {
     register,
     verficationEmail,
     login,
     getMe,
     refreshToken,
     googleAuth,
     logout
}