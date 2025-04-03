import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { q, language } = request.query;
  
  // Test simple pour vérifier que l'API fonctionne
  response.status(200).json({
    status: "ok",
    query: q,
    language: language,
    message: "API is working",
    timestamp: new Date().toISOString()
  });
}