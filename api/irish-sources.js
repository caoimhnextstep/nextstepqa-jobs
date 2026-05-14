// ============================================================
// NextStepQA — Irish & Irish-relevant Company Direct Feeds
// All slugs verified against live Greenhouse/Lever APIs
// ============================================================

const IRISH_SOURCES = [
  // ── Confirmed Greenhouse boards ──────────────────────────
  { company: "Intercom",        ats: "greenhouse", slug: "intercom",        location: "Dublin, Ireland" },
  { company: "Tines",           ats: "greenhouse", slug: "tines",           location: "Dublin, Ireland" },
  { company: "Flipdish",        ats: "greenhouse", slug: "flipdish",        location: "Dublin, Ireland" },
  { company: "Kaseya",          ats: "greenhouse", slug: "kaseya",          location: "Dublin, Ireland" },
  { company: "CrowdStrike",     ats: "greenhouse", slug: "crowdstrike",     location: "Dublin, Ireland" },
  { company: "HubSpot",         ats: "greenhouse", slug: "hubspot",         location: "Dublin, Ireland" },
  { company: "Workhuman",       ats: "greenhouse", slug: "workhuman",       location: "Dublin, Ireland" },
  { company: "Stripe",          ats: "greenhouse", slug: "stripe",          location: "Dublin, Ireland" },
  // ── Confirmed Lever boards ───────────────────────────────
  { company: "Kitman Labs",     ats: "lever", slug: "kitmanlabs",           location: "Dublin, Ireland" },
  { company: "Teamwork",        ats: "lever", slug: "teamwork",             location: "Cork, Ireland"   },
  { company: "Version 1",       ats: "lever", slug: "version1",             location: "Dublin, Ireland" },
  { company: "Workhuman",       ats: "lever", slug: "workhuman",            location: "Dublin, Ireland" },
  { company: "Zendesk",         ats: "lever", slug: "zendesk",              location: "Dublin, Ireland" },
  { company: "Workday",         ats: "lever", slug: "workday",              location: "Dublin, Ireland" },
  { company: "Fenergo",         ats: "lever", slug: "fenergo",              location: "Dublin, Ireland" },
  { company: "Wayflyer",        ats: "lever", slug: "wayflyer",             location: "Dublin, Ireland" },
  { company: "Mastercard",      ats: "lever", slug: "mastercard",           location: "Dublin, Ireland" },
  { company: "Immedis",         ats: "lever", slug: "immedis",              location: "Dublin, Ireland" },
  { company: "Hostelworld",     ats: "lever", slug: "hostelworld",          location: "Dublin, Ireland" },
  { company: "Paddy Power",     ats: "lever", slug: "paddypower",           location: "Dublin, Ireland" },
  { company: "Ergo",            ats: "lever", slug: "ergo",                 location: "Dublin, Ireland" },
];

// QA title keywords — match on title
const QA_TITLE_INCLUDE = [
  "qa", "quality assurance", "test automation", "software test",
  "sdet", "playwright", "automation engineer", "quality engineer",
  "test engineer", "manual test", "performance test", "tester",
  "testing engineer", "qa automation", "quality analyst"
];

// Non-QA titles to always exclude
const QA_TITLE_EXCLUDE = [
  "customer support", "customer success", "full stack", "frontend engineer",
  "backend engineer", "data engineer", "product manager", "product designer",
  "marketing", "sales", "finance", "people ops", "recruiter", "data analyst",
  "devops", "security engineer", "mobile engineer", "ios engineer",
  "android engineer", "account manager", "social media", "technical writer",
  "legal", "operations", "react native", "web developer", "software engineer",
  "support engineer", "support specialist", "support agent", "growth",
  "demand generation", "gtm", "ml", "identity", "billing", "platform engineer",
  "site reliability", "infrastructure", "machine learning", "data scientist",
  "principal engineer", "staff engineer", "engineering manager", "vp of",
  "head of engineering", "solutions engineer", "solutions architect",
  "javascript developer", "python developer", "java developer"
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
  // Exclude first — if title clearly not QA, reject
  if (QA_TITLE_EXCLUDE.some(kw => t.includes(kw))) return false;
  // Then include only if title contains a QA keyword
  return QA_TITLE_INCLUDE.some(kw => t.includes(kw));
}

function normaliseGreenhouse(raw, source) {
  const loc = raw.location?.name || source.location;
  return {
    id:           `direct-${source.company}-${raw.id}`,
    title:        raw.title,
    company:      source.company,
    location:     loc,
    country:      "IE",
    salary_min:   null, salary_max: null, salary_label: null,
    remote:       stripHtml(loc).includes("remote") || stripHtml(raw.title).includes("remote"),
    url:          raw.absolute_url || `https://boards.greenhouse.io/${source.slug}/jobs/${raw.id}`,
    posted:       raw.updated_at || new Date().toISOString(),
    description:  stripHtml(raw.content || raw.title || "").slice(0, 400),
    tags:[], stage:null, demand:null, gap:null, source:"direct",
  };
}

function normaliseLever(raw, source) {
  const loc = raw.categories?.location || source.location;
  return {
    id:           `direct-${source.company}-${raw.id}`,
    title:        raw.text,
    company:      source.company,
    location:     loc,
    country:      "IE",
    salary_min:   null, salary_max: null, salary_label: null,
    remote:       stripHtml(loc).includes("remote") || stripHtml(raw.text || "").includes("remote"),
    url:          raw.hostedUrl,
    posted:       raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    description:  stripHtml(raw.descriptionPlain || raw.description || raw.text || "").slice(0, 400),
    tags:[], stage:null, demand:null, gap:null, source:"direct",
  };
}

async function fetchGreenhouse(source) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${source.slug}/jobs?content=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GH ${res.status}`);
  const data = await res.json();
  return (data.jobs || [])
    .filter(j => isQARole(j.title))
    .map(j => normaliseGreenhouse(j, source));
}

async function fetchLever(source) {
  const url = `https://api.lever.co/v0/postings/${source.slug}?mode=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`LV ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .filter(j => isQARole(j.text))
    .map(j => normaliseLever(j, source));
}

export async function fetchIrishSources() {
  const results = [], errors = [];
  await Promise.all(IRISH_SOURCES.map(async source => {
    try {
      const jobs = source.ats === "greenhouse"
        ? await fetchGreenhouse(source)
        : await fetchLever(source);
      results.push(...jobs);
    } catch(e) {
      errors.push({ company: source.company, error: e.message });
    }
  }));
  return { jobs: results, errors };
}
