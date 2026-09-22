import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    AUTH_SECRET: z.string().min(1),
    PAYU_MERCHANT_KEY: z.string().min(1),
    PAYU_MERCHANT_SECRET: z.string().min(1),
    PAYU_ENV: z.enum(["TEST", "PRODUCTION"]),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    process.exit(1);
}

export const env = _env.data;
