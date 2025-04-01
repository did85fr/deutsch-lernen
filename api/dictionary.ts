import type { VercelRequest, VercelResponse } from '@vercel/node';

const PONS_API_URL = 'https://api.pons.com/v1/dictionary';

const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
  'Access-Control-Allow-Headers': '*',
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Log incoming request
  console.log('API Request received:', {
    method: request.method,
    query: request.query,
    headers: request.headers
  });

  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    response.setHeader('Access-Control-Allow-Headers', '*');
    return response.status(200).end();
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.setHeader(key, value);
  });

  const { q, language = 'deen' } = request.query;

  if (!q) {
    return response.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    console.log('Calling PONS API with:', {
      url: `${PONS_API_URL}/entries?l=${language}&q=${q}`,
      key: process.env.PONS_API_KEY
    });

    const ponsResponse = await fetch(
      `${PONS_API_URL}/entries?l=${language}&q=${q}`,
      {
        headers: {
          'X-Secret': process.env.PONS_API_KEY || '',
          'Accept': 'application/json'
        }
      }
    );

    console.log('PONS API response status:', ponsResponse.status);

    if (ponsResponse.status === 204) {
      return response.json({ exists: false, matches: [] });
    }

    if (!ponsResponse.ok) {
      throw new Error(`PONS API error: ${ponsResponse.statusText}`);
    }

    const data = await ponsResponse.json();
    return response.json({
      exists: true,
      matches: data
    });
  } catch (error) {
    console.error('PONS API error:', error);
    return response.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}






