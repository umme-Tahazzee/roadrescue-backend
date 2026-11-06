import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  BACKEND_URL: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  CLOUDINARY_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  SUPER_ADMIN_NAME: z.string().min(1),
  SUPER_ADMIN_EMAIL: z.string().min(1),
  SUPER_ADMIN_PASSWORD: z.string().min(1),
  TESTER_ADMIN_NAME: z.string().min(1),
  TESTER_ADMIN_EMAIL: z.string().min(1),
  TESTER_ADMIN_PASSWORD: z.string().min(1),

  REDIS_USER: z.string().min(1),
  REDIS_PASSWORD: z.string().min(1),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number(),

  EMAIL_USER: z.string().min(1),
  EMAIL_SENDER: z.string().min(1),
  EMAIL_PASS: z.string().min(1),

  BKASH_BASE_URL: z.string().min(1),
  BKASH_USERNAME: z.string().min(1),
  BKASH_PASSWORD: z.string().min(1),
  BKASH_APP_KEY: z.string().min(1),
  BKASH_APP_SECRET: z.string().min(1),
  BKASH_CALLBACK_URL: z.string().min(1),
});

const env = envSchema.parse(process.env);

export default {
  node_env: env.NODE_ENV,
  port: env.PORT,
  database_url: env.DATABASE_URL,
  backend_url: env.BACKEND_URL,
  frontend_url: env.FRONTEND_URL.split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean),
  bcrypt_salt_rounds: env.BCRYPT_SALT_ROUNDS,

  jwt_access_secret: env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: env.JWT_REFRESH_EXPIRES_IN,

  google_client_id: env.GOOGLE_CLIENT_ID,
  google_client_secret: env.GOOGLE_CLIENT_SECRET,

  cloudinary_name: env.CLOUDINARY_NAME,
  cloudinary_api_key: env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: env.CLOUDINARY_API_SECRET,

  super_admin_name: env.SUPER_ADMIN_NAME,
  super_admin_email: env.SUPER_ADMIN_EMAIL,
  super_admin_password: env.SUPER_ADMIN_PASSWORD,

  tester_admin_name: env.TESTER_ADMIN_NAME,
  tester_admin_email: env.TESTER_ADMIN_EMAIL,
  tester_admin_password: env.TESTER_ADMIN_PASSWORD,

  redis_user: env.REDIS_USER,
  redis_password: env.REDIS_PASSWORD,
  redis_host: env.REDIS_HOST,
  redis_port: env.REDIS_PORT,

  email_user: env.EMAIL_USER,
  email_sender: env.EMAIL_SENDER,
  email_password: env.EMAIL_PASS,

  bkash_url: env.BKASH_BASE_URL,
  bkash_username: env.BKASH_USERNAME,
  bkash_password: env.BKASH_PASSWORD,
  bkash_app_key: env.BKASH_APP_KEY,
  bkash_app_secret: env.BKASH_APP_SECRET,
  bkash_app_callback: env.BKASH_CALLBACK_URL,
};