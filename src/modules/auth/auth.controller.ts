// biome-ignore assist/source/organizeImports: <explanation>
import { AuthService } from "./auth.service";
import { catchAsync } from "../../utils/catchAsyn";
import  httpStatus  from "http-status";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";

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
     refreshToken,
     googleAuth,
     logout
}