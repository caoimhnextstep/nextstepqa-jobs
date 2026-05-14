// ============================================================
// NextStepQA — ATS Fetchers
// One fetcher per ATS platform, all return normalised jobs
// ============================================================

const IRISH_LOCS = ["dublin","cork","galway","limerick","waterford","ireland","belfast","wicklow","kildare"];

function isIrish(loc) {
  return IRISH_LOCS.some(l => (loc||"").toLowerCase().includes(l));
}

function stripHtml(str) {
  return (str||"")
    .replace(/<[^>]*>/g," ")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&amp;/g,"&").replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'").replace(/&nbsp;/g," ")
    .replace(/\s+/g," ").trim().toLowerCase();
}

const QA_INCLUDE = [
  "qa ","qa,","qa/","quality assurance","test automation","software test",
  "sdet","playwright","automation engineer","quality engineer",
  "test engineer","manual tester","qa automation","quality analyst",
  "testing engineer","automation tester"
];

const QA_EXCLUDE = [
  "customer support","customer success","full stack","frontend engineer",
  "backend engineer","data engineer","product manager","product designer",
  "marketing","sales","finance","people ops","recruiter","data analyst",
  "devops","mobile engineer","ios engineer","android engineer",
  "account manager","social media","technical writer","legal","operations",
  "react native","web developer","software engineer","support engineer",
  "support specialist","support agent","platform engineer",
  "site reliability","infrastructure","machine learning","data scientist",
  "principal engineer","staff engineer","engineering manager",
  "solutions engineer","solutions architect","security engineer",
  "network engineer","scrum master","agile coach","delivery manager"
];

export function isQARole(title) {
  const t = ` ${title.toLowerCase()} `;
  if (QA_EXCLUDE.some(kw => t.includes(kw))) return false;
  return QA_INCLUDE.some(kw => t.includes(kw));
}

function base(source, overrides={}) {
  return {
    company: source.company,
    sector: source.sector,
    city: source.city,
    country: overrides.country || source.country,
    ats: source.ats,
    source_type: "direct_company_feed",
    source_verified: source.verified,
    salary_min: null,
    salary_max: null,
    salary_label: null,
    remote: false,
    classification: { role_type: null, level: null, transition_friendly: false },
    signals: { playwright: false, typescript: false, cypress: false, selenium: false, api_testing: false, ci_cd: false },
    ...overrides,
  };
}

// ── Greenhouse ────────────────────────────────────────────────
export async function fetchGreenhouse(source) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${source.slug}/jobs?content=true`);
  if (!res.ok) throw new Error(`GH ${res.status}`);
  const { jobs = [] } = await res.json();
  return jobs.filter(j => isQARole(j.title)).map(j => {
    const loc = j.location?.name || source.city;
    const desc = stripHtml(j.content || "").slice(0, 600);
    return {
      ...base(source, {
        country: isIrish(loc) ? "IE" : source.country,
        remote: desc.includes("remote") || loc.toLowerCase().includes("remote"),
      }),
      id: `gh-${source.slug}-${j.id}`,
      title: j.title,
      location: { city: loc, country: isIrish(loc) ? "Ireland" : loc, remote: desc.includes("remote") },
      url: j.absolute_url,
      posted: j.updated_at || new Date().toISOString(),
      description: desc,
    };
  });
}

// ── Lever ─────────────────────────────────────────────────────
export async function fetchLever(source) {
  const res = await fetch(`https://api.lever.co/v0/postings/${source.slug}?mode=json`);
  if (!res.ok) throw new Error(`LV ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .filter(j => isQARole(j.text))
    .map(j => {
      const loc = j.categories?.location || source.city;
      const desc = stripHtml(j.descriptionPlain || j.description || "").slice(0, 600);
      return {
        ...base(source, {
          country: isIrish(loc) ? "IE" : "GB",
          remote: loc.toLowerCase().includes("remote"),
        }),
        id: `lv-${source.slug}-${j.id}`,
        title: j.text,
        location: { city: loc, country: isIrish(loc) ? "Ireland" : loc, remote: loc.toLowerCase().includes("remote") },
        url: j.hostedUrl,
        posted: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
        description: desc,
      };
    });
}

// ── Workable ──────────────────────────────────────────────────
export async function fetchWorkable(source) {
  const res = await fetch(`https://apply.workable.com/api/v1/widget/accounts/${source.slug}`);
  if (!res.ok) throw new Error(`WK ${res.status}`);
  const { jobs = [] } = await res.json();
  return jobs.filter(j => isQARole(j.title)).map(j => {
    const loc = j.location || source.city;
    const desc = stripHtml(j.description || j.requirements || "").slice(0, 600);
    return {
      ...base(source, {
        country: isIrish(loc) ? "IE" : source.country,
        remote: j.remote || false,
      }),
      id: `wk-${source.slug}-${j.shortcode||j.id}`,
      title: j.title,
      location: { city: loc, country: isIrish(loc) ? "Ireland" : loc, remote: j.remote || false },
      url: `https://apply.workable.com/${source.slug}/j/${j.shortcode}`,
      posted: j.published_on || new Date().toISOString(),
      description: desc,
    };
  });
}

// ── SmartRecruiters ───────────────────────────────────────────
export async function fetchSmartRecruiters(source) {
  const res = await fetch(
    `https://api.smartrecruiters.com/v1/companies/${source.slug}/postings?limit=100&status=PUBLIC`
  );
  if (!res.ok) throw new Error(`SR ${res.status}`);
  const { content = [] } = await res.json();
  return content.filter(j => isQARole(j.name)).map(j => {
    const city = j.location?.city || source.city;
    const countryCode = j.location?.countryCode || source.country;
    const desc = stripHtml(j.jobAd?.sections?.jobDescription?.text || "").slice(0, 600);
    return {
      ...base(source, {
        country: isIrish(city) || countryCode === "IE" ? "IE" : countryCode,
        remote: j.typeOfEmployment?.id === "remote",
      }),
      id: `sr-${source.slug}-${j.id}`,
      title: j.name,
      location: { city, country: isIrish(city) ? "Ireland" : city, remote: j.typeOfEmployment?.id === "remote" },
      url: `https://jobs.smartrecruiters.com/${source.slug}/${j.id}`,
      posted: j.releasedDate || new Date().toISOString(),
      description: desc,
    };
  });
}

// ── Ashby ─────────────────────────────────────────────────────
export async function fetchAshby(source) {
  const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${source.slug}`);
  if (!res.ok) throw new Error(`AS ${res.status}`);
  const { jobs = [] } = await res.json();
  return jobs.filter(j => isQARole(j.title)).map(j => {
    const loc = j.location || source.city;
    const desc = stripHtml(j.descriptionHtml || "").slice(0, 600);
    return {
      ...base(source, {
        country: isIrish(loc) ? "IE" : source.country,
        remote: j.isRemote || false,
      }),
      id: `as-${source.slug}-${j.id}`,
      title: j.title,
      location: { city: loc, country: isIrish(loc) ? "Ireland" : loc, remote: j.isRemote || false },
      url: j.jobUrl,
      posted: j.publishedDate || new Date().toISOString(),
      description: desc,
    };
  });
}

export const FETCHERS = {
  greenhouse: fetchGreenhouse,
  lever: fetchLever,
  workable: fetchWorkable,
  smartrecruiters: fetchSmartRecruiters,
  ashby: fetchAshby,
};
