import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { User } from '../models/auth';
import { IUser } from '../types';
import { compare, hash } from 'bcryptjs';
import { generateToken } from '../lib/helpers/generateToken';


const authRouter = new Hono();

const authSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

authRouter.post(
  '/register',
  validator('json', (value, c) => {
    const parsed = authSchema.safeParse(value);
    if (!parsed.success) {
      throw new HTTPException(400, {
        message: 'Invalid input',
        cause: parsed.error.format(),
      });
    }
    return parsed.data;
  }),
  async (c) => {
    const { email, password } = c.req.valid('json');

    try {
      const existingUser = await User.findOne({ email }).lean();
      if (existingUser) {
        throw new HTTPException(409, { message: 'Email already in use' });
      }

      const hashedPassword = await hash(password, 10);

      const newUser = await User.create({
        email,
        password: hashedPassword,
      });

      const token = await generateToken(newUser.id);

      return c.json(
        {
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
          },
          token,
        },
        201
      );
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }
      console.error('Register error:', err);
      throw new HTTPException(500, { message: 'Server error' });
    }
  }
);

authRouter.post(
  '/login',
  validator('json', (value, c) => {
    const parsed = authSchema.safeParse(value);
    if (!parsed.success) {
      throw new HTTPException(400, {
        message: 'Invalid input',
        cause: parsed.error.format(),
      });
    }
    return parsed.data;
  }),
  async (c) => {
    const { email, password } = c.req.valid('json');

    try {
      const user = await User.findOne({ email })
        .select('+password')
        .lean<IUser & { password: string }>();

      if (!user || !(await compare(password, user.password))) {
        throw new HTTPException(401, { message: 'Invalid email or password' });
      }

      const token = await generateToken(user.id);

      return c.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      });
    } catch (err) {
      if (err instanceof HTTPException) {
        throw err;
      }
      console.error('Login error:', err);
      throw new HTTPException(500, { message: 'Server error' });
    }
  }
);

export default authRouter;