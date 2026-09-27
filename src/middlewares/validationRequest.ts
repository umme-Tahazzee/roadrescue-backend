import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { catchAsync } from "../utils/catchAsyn";


export const validateRequest = (schema: ZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // body ছাড়াও params/query validate করার সুযোগ রাখা হলো, ভবিষ্যতে দরকার হতে পারে
    await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  });
};

