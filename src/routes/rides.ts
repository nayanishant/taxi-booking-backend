import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { Ride } from '../models/ride';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateAddress } from '../lib/services/addressValidation';

const ridesRouter = new Hono();

// Apply auth middleware to all routes
// ridesRouter.use('*', authMiddleware);


const createRideSchema = z.object({
  pickup: z.union([
    z.string(),
    z.array(z.number()).length(2, 'Pickup coordinates must be [lng, lat]')
  ]),
  dropoff: z.union([
    z.string(),
    z.array(z.number()).length(2, 'Dropoff coordinates must be [lng, lat]')
  ]),
});

// Helper to resolve location
const resolveLocation = async (input: string | number[]) => {
  if (Array.isArray(input)) {
    return { type: 'Point' as const, coordinates: input };
  }
  const result = await validateAddress(input);
  return { 
    type: 'Point' as const, 
    coordinates: [result.location.longitude, result.location.latitude] 
  };
};

// Create a new ride
ridesRouter.post(
  '/',
  validator('json', (value, c) => {
    const parsed = createRideSchema.safeParse(value);
    if (!parsed.success) {
      throw new HTTPException(400, {
        message: 'Invalid input',
        cause: parsed.error.format(),
      });
    }
    return parsed.data;
  }),
  async (c) => {
    const { pickup, dropoff } = c.req.valid('json');
    // const payload = c.get('jwtPayload');

    try {
      const pickupLocation = await resolveLocation(pickup);
      const dropoffLocation = await resolveLocation(dropoff);

      const ride = await Ride.create({
        // userId: payload.sub,
        pickup: pickupLocation,
        dropoff: dropoffLocation,
      });

      return c.json({ success: true, ride }, 201);
    } catch (err) {
      if (err instanceof HTTPException) throw err;
      console.error('Create ride error:', err);
      throw new HTTPException(500, { message: 'Server error' });
    }
  }
);

// Get all rides for the user
ridesRouter.get('/', async (c) => {
  const payload = c.get('jwtPayload');
  try {
    const rides = await Ride.find({ userId: payload.sub }).sort({ createdAt: -1 });
    return c.json({ success: true, rides });
  } catch (err) {
    console.error('Get rides error:', err);
    throw new HTTPException(500, { message: 'Server error' });
  }
});

// Get a single ride
ridesRouter.get('/:id', async (c) => {
  const payload = c.get('jwtPayload');
  const id = c.req.param('id');
  try {
    const ride = await Ride.findOne({ id, userId: payload.sub });
    if (!ride) {
      throw new HTTPException(404, { message: 'Ride not found' });
    }
    return c.json({ success: true, ride });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Get ride error:', err);
    throw new HTTPException(500, { message: 'Server error' });
  }
});

// Cancel a ride
ridesRouter.patch('/:id/cancel', async (c) => {
  const payload = c.get('jwtPayload');
  const id = c.req.param('id');
  try {
    const ride = await Ride.findOne({ id, userId: payload.sub });

    if (!ride) {
      throw new HTTPException(404, { message: 'Ride not found' });
    }

    if (!['pending', 'accepted'].includes(ride.status)) {
        throw new HTTPException(400, { message: 'Cannot cancel ride in current status' });
    }

    ride.status = 'cancelled';
    await ride.save();

    return c.json({ success: true, ride });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('Cancel ride error:', err);
    throw new HTTPException(500, { message: 'Server error' });
  }
});

export default ridesRouter;
