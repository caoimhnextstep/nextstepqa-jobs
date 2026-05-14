// ============================================================
// NextStepQA — Irish Company Direct Feeds
// Fetches QA jobs directly from Irish tech company ATS platforms
// ============================================================

// Irish tech companies with confirmed Greenhouse/Lever feeds
const IRISH_SOURCES = [
  // Greenhouse boards
  { company: "Intercom", ats: "greenhouse", slug: "intercom", location: "Dublin" },
  { company: "Workhuman", ats: "greenhouse", slug: "workhuman", location: "Dublin" },
  { company: "Fenergo", ats: "greenhouse", slug: "fenergo", location: "Dublin" },
  { company: "Wayflyer", ats: "greenhouse", slug: "wayflyer", location: "Dublin" },
  { company: "Flipdish", ats: "greenhouse", slug: "flipdish", location: "Dublin" },
  { company: "Teamwork", ats: "greenhouse", slug: "teamwork", location: "Cork" },
  { company: "Immedis", ats: "greenhouse", slug: "immedis", location: "Dublin" },
  { company: "Tines", ats: "greenhouse", slug: "tines", location: "Dublin" },
  // Lever boards
  { company: "HubSpot", ats: "lever", slug: "hubspot", location: "Dublin" },
  { company: "Stripe", ats: "lever", slug: "stripe", location: "Dublin" },
  { company: "Zendesk", ats: "lever", slug: "zendesk", location: "Dublin" },
  { company: "Workday", ats: "lever", slug: "workday", location: "Dublin" },
];

const QA_KEYWORDS = [
  "qa", "quality assurance", "test", "testing", "sdet",
  "playwright", "selenium", "cypress", "automation engineer"
];

function isQARole(title, description = "") {
  const text = `${title} ${description}`.toLowerCase();
  return QA_KEYWORDS.some(kw => text.includes(kw));
}

function normaliseDirect(raw, source) {
  const salary = raw.compensation || null;
  return {
    id: `direct-${source.company}-${raw.id || raw.req_id || Math.random()}`,
    title: raw.title,
    company: source.company,
    location: raw.location?.name || raw.categories?.location || source.location + ", Ireland",
    country: "IE",
    salary_min: null,
    salary_max: null,
    salary_label: salary || null,
    remote: (raw.location?.name || "").toLowerCase().includes("remote") ||
            (raw.title || "").toLowerCase().includes("remote"),
    url: raw.absolute_url || raw.hostedUrl || `https://boards.greenhouse.io/${source.slug}/jobs/${raw.id}`,
    posted: raw.updated_at || raw.createdAt || new Date().toISOString(),
    description: (raw.content || raw.description || raw.title || "").slice(0, 400).toLowerCase(),
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
    .map(j => normaliseDirect(j, source));
}

async function fetchLever(source) {
  const url = `https://api.lever.co/v0/postings/${source.slug}?mode=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lever ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .filter(j => isQARole(j.text, j.description))
    .map(j => normaliseDirect({
      id: j.id,
      title: j.text,
      location: j.categories?.location || source.location,
      content: j.description || j.descriptionPlain || "",
      updated_at: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
      absolute_url: j.hostedUrl,
    }, source));
}

export async function fetchIrishSources() {
  const results = [];
  const errors = [];

  await Promise.all(IRISH_SOURCES.map(async source => {
    try {
      let jobs = [];
      if (source.ats === "greenhouse") {
        jobs = await fetchGreenhouse(source);
      } else if (source.ats === "lever") {
        jobs = await fetchLever(source);
      }
      results.push(...jobs);
    } catch(e) {
      errors.push({ company: source.company, error: e.message });
    }
  }));

  return { jobs: results, errors };
}
