import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { catchAsync } from "../utils/catchAsyn";


export const validateRequest = (schema: ZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // body ছাড়াও params/query validate করার সুযোগ রাখা হলো, ভবিষ্যতে দরকার হতে পারে
    const parsed = await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    // use the cleaned body (e.g. lowercased email) and drop unknown fields
    req.body = parsed.body;
    next();
  });
};

