import { sign } from "hono/jwt";

export const generateToken = async (userId: string) => {
  const secret = process.env.JWT_SECRET;
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    iat: now,
    exp: now + 24 * 60 * 60,
  };
  const token = await sign(payload, secret!);
  return token;
};
