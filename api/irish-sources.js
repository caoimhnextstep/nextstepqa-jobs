// ============================================================
// NextStepQA — Irish Company Direct ATS Feeds
// Supports: Greenhouse, Lever, Workable, Ashby, SmartRecruiters
// Last verified: 2026-05-14
// ============================================================

export const IRISH_SOURCES = [

  // ── GREENHOUSE ──────────────────────────────────────────────
  { company: "Intercom",    ats: "greenhouse", slug: "intercom",   location: "Dublin, Ireland",  verified: true  },
  { company: "Tines",       ats: "greenhouse", slug: "tines",      location: "Dublin, Ireland",  verified: true  },
  { company: "Flipdish",    ats: "greenhouse", slug: "flipdish",   location: "Dublin, Ireland",  verified: true  },
  { company: "HubSpot",     ats: "greenhouse", slug: "hubspot",    location: "Dublin, Ireland",  verified: true  },
  { company: "Stripe",      ats: "greenhouse", slug: "stripe",     location: "Dublin, Ireland",  verified: true  },
  { company: "Toast",       ats: "greenhouse", slug: "toasttab",   location: "Dublin, Ireland",  verified: false },
  { company: "Mastercard",  ats: "greenhouse", slug: "mastercard", location: "Dublin, Ireland",  verified: false },

  // ── LEVER ────────────────────────────────────────────────────
  { company: "Kitman Labs",  ats: "lever", slug: "kitmanlabs",  location: "Dublin, Ireland",  verified: true  },
  { company: "CarTrawler",   ats: "lever", slug: "cartrawler",  location: "Dublin, Ireland",  verified: true  },
  { company: "Wayflyer",     ats: "lever", slug: "wayflyer",    location: "Dublin, Ireland",  verified: false },
  { company: "Hostelworld",  ats: "lever", slug: "hostelworld", location: "Dublin, Ireland",  verified: false },

  // ── WORKABLE ─────────────────────────────────────────────────
  // Endpoint: https://apply.workable.com/api/v1/widget/accounts/{slug}
  { company: "Fenergo",     ats: "workable", slug: "fenergocareers", location: "Dublin, Ireland", verified: true  },
  { company: "Poppulo",     ats: "workable", slug: "poppulo",        location: "Cork, Ireland",   verified: false },
  { company: "Teamwork",    ats: "workable", slug: "teamwork",       location: "Cork, Ireland",   verified: false },

  // ── SMARTRECRUITERS ──────────────────────────────────────────
  // Endpoint: https://api.smartrecruiters.com/v1/companies/{slug}/postings
  { company: "Version 1",   ats: "smartrecruiters", slug: "Version1",    location: "Dublin, Ireland", verified: true  },
  { company: "Ergo",        ats: "smartrecruiters", slug: "ErgoGroup",   location: "Dublin, Ireland", verified: false },

  // ── ASHBY ────────────────────────────────────────────────────
  // Endpoint: https://api.ashbyhq.com/posting-api/job-board/{slug}
  { company: "Tines",       ats: "ashby", slug: "tines",       location: "Dublin, Ireland", verified: false },
  { company: "CalypsoAI",   ats: "ashby", slug: "calypsoai",   location: "Dublin, Ireland", verified: false },
];

// ── QA title matching ─────────────────────────────────────────
const QA_INCLUDE = [
  "qa", "quality assurance", "test automation", "software test",
  "sdet", "playwright", "automation engineer", "quality engineer",
  "test engineer", "manual test", "tester", "qa automation",
  "quality analyst", "testing engineer"
];

const QA_EXCLUDE = [
  "customer support", "customer success", "full stack", "frontend",
  "backend engineer", "data engineer", "product manager", "product designer",
  "marketing", "sales", "finance", "people", "recruiter",
  "devops", "mobile engineer", "ios engineer", "android engineer",
  "account manager", "social media", "technical writer", "legal",
  "operations", "react native", "web developer", "software engineer",
  "support engineer", "support specialist", "support agent",
  "platform engineer", "site reliability", "infrastructure",
  "machine learning", "data scientist", "principal engineer",
  "staff engineer", "engineering manager", "solutions engineer",
  "solutions architect", "security engineer", "analytics engineer",
  "network engineer", "scrum master", "agile coach"
];

function stripHtml(str) {
  return (str || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&amp;/g,"&").replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'").replace(/&nbsp;/g," ")
    .replace(/\s+/g," ").trim().toLowerCase();
}

function isQARole(title) {
  const t = stripHtml(title);
  if (QA_EXCLUDE.some(kw => t.includes(kw))) return false;
  return QA_INCLUDE.some(kw => t.includes(kw));
}

function baseJob(source) {
  return {
    country: "IE",
    salary_min: null, salary_max: null, salary_label: null,
    tags: [], stage: null, demand: null, gap: null,
    source: "direct",
    source_label: source.verified ? "✓ Direct company feed" : "Company feed",
  };
}

// ── Greenhouse ────────────────────────────────────────────────
async function fetchGreenhouse(source) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${source.slug}/jobs?content=true`);
  if (!res.ok) throw new Error(`GH ${res.status}`);
  const { jobs = [] } = await res.json();
  return jobs.filter(j => isQARole(j.title)).map(j => ({
    ...baseJob(source),
    id: `gh-${source.slug}-${j.id}`,
    title: j.title,
    company: source.company,
    location: j.location?.name || source.location,
    remote: stripHtml(j.location?.name || "").includes("remote"),
    url: j.absolute_url,
    posted: j.updated_at || new Date().toISOString(),
    description: stripHtml(j.content || "").slice(0, 400),
  }));
}

// ── Lever ─────────────────────────────────────────────────────
async function fetchLever(source) {
  const res = await fetch(`https://api.lever.co/v0/postings/${source.slug}?mode=json`);
  if (!res.ok) throw new Error(`LV ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .filter(j => isQARole(j.text))
    .map(j => ({
      ...baseJob(source),
      id: `lv-${source.slug}-${j.id}`,
      title: j.text,
      company: source.company,
      location: j.categories?.location || source.location,
      remote: stripHtml(j.categories?.location || "").includes("remote"),
      url: j.hostedUrl,
      posted: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
      description: stripHtml(j.descriptionPlain || j.description || "").slice(0, 400),
    }));
}

// ── Workable ──────────────────────────────────────────────────
async function fetchWorkable(source) {
  const res = await fetch(`https://apply.workable.com/api/v1/widget/accounts/${source.slug}`);
  if (!res.ok) throw new Error(`WK ${res.status}`);
  const data = await res.json();
  const jobs = data.jobs || [];
  return jobs.filter(j => isQARole(j.title)).map(j => ({
    ...baseJob(source),
    id: `wk-${source.slug}-${j.shortcode || j.id}`,
    title: j.title,
    company: source.company,
    location: j.location || source.location,
    remote: j.remote || stripHtml(j.location || "").includes("remote"),
    url: `https://apply.workable.com/${source.slug}/j/${j.shortcode}`,
    posted: j.published_on || new Date().toISOString(),
    description: stripHtml(j.description || j.requirements || "").slice(0, 400),
  }));
}

// ── SmartRecruiters ───────────────────────────────────────────
async function fetchSmartRecruiters(source) {
  const res = await fetch(
    `https://api.smartrecruiters.com/v1/companies/${source.slug}/postings?limit=100&status=PUBLIC`
  );
  if (!res.ok) throw new Error(`SR ${res.status}`);
  const data = await res.json();
  const jobs = data.content || [];
  return jobs.filter(j => isQARole(j.name)).map(j => ({
    ...baseJob(source),
    id: `sr-${source.slug}-${j.id}`,
    title: j.name,
    company: source.company,
    location: j.location?.city ? `${j.location.city}, Ireland` : source.location,
    remote: j.typeOfEmployment?.id === "remote" || false,
    url: `https://jobs.smartrecruiters.com/${source.slug}/${j.id}`,
    posted: j.releasedDate || new Date().toISOString(),
    description: stripHtml(j.jobAd?.sections?.jobDescription?.text || "").slice(0, 400),
  }));
}

// ── Ashby ─────────────────────────────────────────────────────
async function fetchAshby(source) {
  const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${source.slug}`);
  if (!res.ok) throw new Error(`AS ${res.status}`);
  const data = await res.json();
  const jobs = data.jobs || [];
  return jobs.filter(j => isQARole(j.title)).map(j => ({
    ...baseJob(source),
    id: `as-${source.slug}-${j.id}`,
    title: j.title,
    company: source.company,
    location: j.location || source.location,
    remote: j.isRemote || false,
    url: j.jobUrl,
    posted: j.publishedDate || new Date().toISOString(),
    description: stripHtml(j.descriptionHtml || "").slice(0, 400),
  }));
}

const FETCHERS = {
  greenhouse:      fetchGreenhouse,
  lever:           fetchLever,
  workable:        fetchWorkable,
  smartrecruiters: fetchSmartRecruiters,
  ashby:           fetchAshby,
};

export async function fetchIrishSources() {
  const results = [], errors = [];
  await Promise.all(IRISH_SOURCES.map(async source => {
    try {
      const fetcher = FETCHERS[source.ats];
      if (!fetcher) return;
      const jobs = await fetcher(source);
      results.push(...jobs);
    } catch(e) {
      errors.push({ company: source.company, ats: source.ats, error: e.message });
    }
  }));
  return { jobs: results, errors };
}
