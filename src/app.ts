import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import helmet from "helmet";
import config from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/not-found";
import router from "./routes";

const app: Application = express();

app.set("trust proxy", 1);

// .env: CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
const allowedOrigins = config.frontend_url; // string[] (split(",") diye config e banao)

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false); // error throw na kore reject
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api/v1", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;