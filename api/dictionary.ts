import type { VercelRequest, VercelResponse } from '@vercel/node';

const PONS_API_URL = 'https://api.pons.com/v1/dictionary';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,HEAD');
  response.setHeader('Access-Control-Allow-Headers', 'X-Secret, Content-Type, Authorization, X-Requested-With');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { q, language = 'deen' } = request.query;

  if (!q) {
    return response.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const ponsResponse = await fetch(
      `${PONS_API_URL}/entries?l=${language}&q=${q}`,
      {
        headers: {
          'X-Secret': process.env.PONS_API_KEY || '',
          'Accept': 'application/json'
        }
      }
    );

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


