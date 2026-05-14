// ============================================================
// NextStepQA — /api/jobs serverless function
// Handles ONLY server-friendly sources:
//   - Irish company ATS feeds (Greenhouse + Lever)
// Adzuna is called directly from the browser (CORS whitelisted)
// ============================================================

import { fetchIrishSources } from './irish-sources.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  const { jobs, errors } = await fetchIrishSources();

  res.status(200).json({
    jobs,
    errors,
    generated_at: new Date().toISOString(),
    source: "ats-direct",
  });
}
