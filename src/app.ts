// biome-ignore assist/source/organizeImports: <explanation>
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, type Application, type Request, type Response } from "express";
import config from "./config";
import router from "./routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/not-found";


const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", router);

app.use(notFound)
app.use(globalErrorHandler);


export default app;