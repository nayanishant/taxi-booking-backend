import { HTTPException } from 'hono/http-exception';
import { LatLng, ValidationResult } from '../../types';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAP_API_KEY;

export const validateAddress = async (address: string): Promise<ValidationResult> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new HTTPException(500, { message: 'Address validation service not configured' });
  }

  const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${GOOGLE_MAPS_API_KEY}`;
  
  const body = {
    address: {
      addressLines: [address],
    },
    enableUspsCass: false,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Address Validation API Error:", errorText);
        throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.result || !data.result.address || !data.result.geocode || !data.result.geocode.location) {
        throw new HTTPException(400, { message: 'Address validation failed: No location found' });
    }
    
    const location = data.result.geocode.location;
    const formattedAddress = data.result.address.formattedAddress;

    return {
        formattedAddress,
        location: {
            latitude: location.latitude,
            longitude: location.longitude
        }
    };

  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("validateAddress error:", error);
    throw new HTTPException(400, { message: 'Invalid address or validation service unavailable' });
  }
};
