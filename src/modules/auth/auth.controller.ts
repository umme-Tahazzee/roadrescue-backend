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

const login = catchAsync(async(req:Request, res:Response, Next:NextFunction)=>{


})
const googleAuth = catchAsync(async(req:Request, res:Response, Next:NextFunction)=>{


})

const logut = catchAsync(async(req:Request, res:Response, Next:NextFunction)=>{


})
export const AuthControllers = {
     register
}