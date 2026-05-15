// ============================================================
// NextStepQA — EU Job Sources via Arbeitnow
// Free API, no auth, pulls from Greenhouse/Lever/SmartRecruiters
// https://www.arbeitnow.com/api/job-board-api
// ============================================================

const QA_TAGS = [
  "qa", "quality assurance", "test automation", "software testing",
  "sdet", "playwright", "selenium", "cypress", "automation engineer",
  "test engineer", "manual testing", "quality engineer"
];

const QA_TITLE_INCLUDE = [
  "qa", "quality assurance", "test automation", "software test",
  "sdet", "playwright", "automation engineer", "quality engineer",
  "test engineer", "manual test", "tester", "qa automation"
];

const QA_TITLE_EXCLUDE = [
  "customer support", "customer success", "full stack", "frontend engineer",
  "backend engineer", "data engineer", "product manager", "product designer",
  "marketing", "sales", "finance", "people", "recruiter", "devops",
  "mobile engineer", "ios engineer", "android engineer", "account manager",
  "social media", "technical writer", "legal", "operations", "react native",
  "web developer", "software engineer", "support engineer", "support specialist",
  "platform engineer", "site reliability", "infrastructure", "machine learning",
  "data scientist", "principal engineer", "staff engineer", "engineering manager",
  "solutions engineer", "solutions architect", "security engineer", "network engineer"
];

function isQARole(title, tags = []) {
  const t = ` ${(title||"").toLowerCase()} `;
  if (QA_TITLE_EXCLUDE.some(kw => t.includes(kw))) return false;
  if (QA_TITLE_INCLUDE.some(kw => t.includes(kw))) return true;
  // Also check tags array from Arbeitnow
  return tags.some(tag => QA_TAGS.some(kw => tag.toLowerCase().includes(kw)));
}

function normaliseArbeitnow(job) {
  return {
    id: `arb-${job.slug}`,
    title: job.title,
    company: job.company_name,
    location: job.location || "Europe",
    city: job.location || "Europe",
    country: job.remote ? "REMOTE" : "EU",
    sector: "Tech",
    ats: "arbeitnow",
    source_type: "aggregator",
    source_verified: false,
    salary_min: null,
    salary_max: null,
    salary_label: null,
    remote: job.remote || false,
    url: job.url,
    posted: job.created_at
      ? new Date(job.created_at * 1000).toISOString()
      : new Date().toISOString(),
    description: (job.description || "").replace(/<[^>]*>/g, " ").toLowerCase().slice(0, 600),
    classification: { role_type: null, level: null, transition_friendly: false },
    signals: {
      playwright: false, typescript: false, cypress: false,
      selenium: false, api_testing: false, ci_cd: false
    },
    demand: null,
    gap: null,
    age_days: 0,
    relevance_score: 0,
  };
}

export async function fetchArbeitnow() {
  const results = [];
  const errors = [];
  let page = 1;
  const maxPages = 10; // up to 200 jobs

  while (page <= maxPages) {
    try {
      const url = `https://www.arbeitnow.com/api/job-board-api?page=${page}`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'NextStepQA/1.0' }
      });

      if (!res.ok) {
        errors.push({ source: "arbeitnow", page, error: `HTTP ${res.status}` });
        break;
      }

      const data = await res.json();
      const jobs = data.data || [];

      if (jobs.length === 0) break; // no more pages

      const qaJobs = jobs
        .filter(j => isQARole(j.title, j.tags || []))
        .map(normaliseArbeitnow);

      results.push(...qaJobs);
      page++;

      // Small delay to be a good citizen
      await new Promise(r => setTimeout(r, 200));

    } catch(e) {
      errors.push({ source: "arbeitnow", page, error: e.message });
      break;
    }
  }

  return { jobs: results, errors };
}
