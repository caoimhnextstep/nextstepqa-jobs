// ============================================================
// NextStepQA — Irish Company Direct Feeds
// ============================================================

const IRISH_SOURCES = [
  // Verified Greenhouse slugs
  { company: "Intercom",  ats: "greenhouse", slug: "intercom",  location: "Dublin" },
  { company: "Tines",     ats: "greenhouse", slug: "tines",     location: "Dublin" },
  { company: "Flipdish",  ats: "greenhouse", slug: "flipdish",  location: "Dublin" },
  // Lever - verified slugs
  { company: "Workhuman", ats: "lever", slug: "workhuman",      location: "Dublin" },
  { company: "Teamwork",  ats: "lever", slug: "teamwork",       location: "Cork"   },
];

const QA_TITLE_KEYWORDS = [
  "qa", "quality assurance", "test automation", "software test",
  "sdet", "playwright", "automation engineer", "quality engineer",
  "test engineer", "manual test", "performance test", "tester"
];

const QA_EXCLUDE_TITLES = [
  "customer support", "full stack", "frontend", "backend", "data engineer",
  "product manager", "product designer", "marketing", "sales", "finance",
  "people", "recruiter", "analyst", "devops", "security engineer",
  "mobile engineer", "ios engineer", "android engineer", "account",
  "social media", "technical writer", "legal", "operations"
];

function isQARole(title, description) {
  const t = stripHtml(title).toLowerCase();

  // Explicitly exclude non-QA roles by title
  if (QA_EXCLUDE_TITLES.some(kw => t.includes(kw))) return false;

  // Match on title first — most reliable
  if (QA_TITLE_KEYWORDS.some(kw => t.includes(kw))) return true;

  // Fall back to description if title doesn't match
  const d = stripHtml(description).toLowerCase();
  const combined = `${t} ${d}`;
  return QA_TITLE_KEYWORDS.some(kw => combined.includes(kw));
}

function stripHtml(str) {
  return (str || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

function fmtSalary(min, max) {
  if (!min && !max) return null;
  const f = n => `€${Math.round(n/1000)}k`;
  if (min && max) return `${f(min)}–${f(max)}`;
  if (min) return `From ${f(min)}`;
  return `Up to ${f(max)}`;
}

function normaliseGreenhouse(raw, source) {
  const desc = stripHtml(raw.content || "").slice(0, 400);
  const loc   = raw.location?.name || source.location + ", Ireland";
  return {
    id:           `direct-${source.company}-${raw.id}`,
    title:        raw.title,
    company:      source.company,
    location:     loc,
    country:      "IE",
    salary_min:   null,
    salary_max:   null,
    salary_label: null,
    remote:       loc.toLowerCase().includes("remote"),
    url:          raw.absolute_url || `https://boards.greenhouse.io/${source.slug}/jobs/${raw.id}`,
    posted:       raw.updated_at || new Date().toISOString(),
    description:  desc,
    tags: [], stage: null, demand: null, gap: null,
    source: "direct",
  };
}

function normaliseLever(raw, source) {
  const desc = stripHtml(raw.descriptionPlain || raw.description || "").slice(0, 400);
  const loc  = raw.categories?.location || source.location + ", Ireland";
  return {
    id:           `direct-${source.company}-${raw.id}`,
    title:        raw.text,
    company:      source.company,
    location:     loc,
    country:      "IE",
    salary_min:   null,
    salary_max:   null,
    salary_label: null,
    remote:       loc.toLowerCase().includes("remote"),
    url:          raw.hostedUrl,
    posted:       raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    description:  desc,
    tags: [], stage: null, demand: null, gap: null,
    source: "direct",
  };
}

async function fetchGreenhouse(source) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${source.slug}/jobs?content=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Greenhouse ${res.status}`);
  const data = await res.json();
  return (data.jobs || [])
    .filter(j => isQARole(j.title, j.content))
    .map(j => normaliseGreenhouse(j, source));
}

async function fetchLever(source) {
  const url = `https://api.lever.co/v0/postings/${source.slug}?mode=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lever ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .filter(j => isQARole(j.text, j.descriptionPlain || j.description))
    .map(j => normaliseLever(j, source));
}

export async function fetchIrishSources() {
  const results = [];
  const errors  = [];

  await Promise.all(IRISH_SOURCES.map(async source => {
    try {
      const jobs = source.ats === "greenhouse"
        ? await fetchGreenhouse(source)
        : await fetchLever(source);
      results.push(...jobs);
      if (jobs.length > 0) {
        console.log(`✅ ${source.company}: ${jobs.length} QA roles`);
      }
    } catch(e) {
      errors.push({ company: source.company, error: e.message });
    }
  }));

  return { jobs: results, errors };
}
