
// ============================================================
// NextStepQA — Vercel Serverless Function
// /api/jobs — fetches from Adzuna + Reed, scores, returns JSON
// ============================================================

const APP_ID   = 'a965c5a0';
const APP_KEY  = 'd44c3937b1afc8717d60d23cb7b16947';
const REED_KEY = '40163a09-6087-49ca-81fd-0d89a6f1cd25';

const ADZUNA_COUNTRIES = ["gb", "de", "nl", "pl", "at", "fr", "be"];

const ADZUNA_QUERIES = [
  "QA automation engineer",
  "test automation engineer",
  "SDET playwright",
  "software tester automation",
  "QA engineer playwright",
  "manual QA tester",
  "quality assurance engineer",
];

const REED_QUERIES = [
  "QA automation", "test automation engineer",
  "SDET", "software tester", "QA engineer",
  "manual QA", "quality assurance"
];

// ── Signals ──────────────────────────────────────────────────
const SIGNALS = {
  high_demand:  ["playwright","typescript","cypress","sdet","automation framework","ci/cd","github actions","api automation","k6","gatling"],
  transition:   ["some automation","exposure to","manual and automation","moving towards","familiar with selenium"],
  manual_heavy: ["manual testing","exploratory testing","uat","regression testing","no automation","zephyr"],
  senior:       ["lead","principal","head of qa","qa manager","test architect","director"],
  junior:       ["junior","graduate","entry level","0-2 years","trainee"],
};

const DEMAND_TAGS = {
  high_demand:  { label: "🔥 High Demand",    color: "yellow" },
  transition:   { label: "⚠ Transition Role", color: "orange" },
  manual_heavy: { label: "📋 Manual Focus",    color: "muted"  },
  senior:       { label: "🎯 Next Level",      color: "purple" },
  junior:       { label: "🌱 Entry Level",     color: "green"  },
};

const STAGE_MAP = {
  junior:"Entry", manual_heavy:"Manual", transition:"Transitioning",
  high_demand:"Automation", senior:"Senior+",
};

const GAP_MAP = {
  Entry:         { qualifyIf:["2+ years manual QA","JIRA / test case writing","Agile"], youNeed:[], nextStep:null },
  Manual:        { qualifyIf:["2+ years manual QA","JIRA / test case writing"], youNeed:[], nextStep:null },
  Transitioning: { qualifyIf:["2+ years manual QA","Some automation exposure"], youNeed:["Basic JavaScript or Python","One automation tool"], nextStep:"Start the Playwright course →" },
  Automation:    { qualifyIf:["Automation framework experience","TypeScript or Python"], youNeed:["Playwright or Cypress","CI/CD pipeline experience"], nextStep:"Close the gap with the course →" },
  "Senior+":     { qualifyIf:["5+ years QA","Framework design","Team leadership"], youNeed:["Architecture experience","Mentoring / hiring"], nextStep:"Build your portfolio first →" },
};

// ── Helpers ──────────────────────────────────────────────────
function fmtSalary(min, max) {
  if (!min && !max) return null;
  const f = n => n >= 1000 ? `€${Math.round(n/1000)}k` : `€${n}`;
  if (min && max) return `${f(min)}–${f(max)}`;
  if (min) return `From ${f(min)}`;
  return `Up to ${f(max)}`;
}

function detectRemote(text) {
  return text.includes("remote") || text.includes("hybrid") || text.includes("work from home");
}

function normaliseAdzuna(raw, country) {
  const desc = (raw.description || "").slice(0,400).toLowerCase();
  return {
    id: raw.id, title: raw.title,
    company: raw.company?.display_name || "Unknown",
    location: raw.location?.display_name || country.toUpperCase(),
    country: country.toUpperCase(),
    salary_min: raw.salary_min ? Math.round(raw.salary_min) : null,
    salary_max: raw.salary_max ? Math.round(raw.salary_max) : null,
    salary_label: fmtSalary(raw.salary_min, raw.salary_max),
    remote: detectRemote(`${raw.title} ${desc} ${raw.location?.display_name}`),
    url: raw.redirect_url, posted: raw.created, description: desc,
    tags:[], stage:null, demand:null, gap:null,
  };
}

function normaliseReed(raw) {
  const desc = (raw.jobDescription || raw.jobTitle || "").slice(0,400).toLowerCase();
  return {
    id: `reed-${raw.jobId}`, title: raw.jobTitle,
    company: raw.employerName || "Unknown",
    location: raw.locationName || "Ireland",
    country: "IE",
    salary_min: raw.minimumSalary ? Math.round(raw.minimumSalary) : null,
    salary_max: raw.maximumSalary ? Math.round(raw.maximumSalary) : null,
    salary_label: fmtSalary(raw.minimumSalary, raw.maximumSalary),
    remote: detectRemote(`${raw.jobTitle} ${raw.locationName || ""}`),
    url: raw.jobUrl,
    posted: raw.date || new Date().toISOString(),
    description: desc,
    tags:[], stage:null, demand:null, gap:null,
  };
}

function score(job) {
  const text = `${job.title} ${job.description}`.toLowerCase();
  const scores = {};
  for (const [cat, kws] of Object.entries(SIGNALS)) {
    scores[cat] = kws.filter(kw => text.includes(kw)).length;
  }
  const top = Object.entries(scores).filter(([,v])=>v>0).sort(([,a],[,b])=>b-a)[0]?.[0];
  const tags = [];
  if (scores.high_demand>0)  tags.push("playwright-required");
  if (scores.transition>0)   tags.push("transition-friendly");
  if (scores.manual_heavy>0) tags.push("manual-focus");
  if (scores.senior>0)       tags.push("senior");
  if (scores.junior>0)       tags.push("junior");
  if (job.remote)            tags.push("remote");
  const stage = top ? STAGE_MAP[top] : "General";
  const base  = GAP_MAP[stage] || GAP_MAP["Manual"];
  const extra = [];
  if (text.includes("playwright"))  extra.push("Playwright");
  if (text.includes("typescript"))  extra.push("TypeScript");
  if (text.includes("ci/cd")||text.includes("github actions")) extra.push("CI/CD");
  if (text.includes("docker"))      extra.push("Docker");
  if (text.includes("api"))         extra.push("API testing");
  if (text.includes("java")&&!text.includes("javascript")) extra.push("Java");
  const youNeed = [...new Set([...base.youNeed,...extra])].slice(0,4);
  return {
    ...job, tags, stage,
    demand: top ? DEMAND_TAGS[top] : null,
    gap: { qualifyIf:base.qualifyIf, youNeed, nextStep:base.nextStep },
    archetypeScore: {
      manual_tester:  scores.transition*3+scores.junior*2-scores.senior,
      transitioning:  scores.high_demand*3+scores.transition*2,
      job_hunting:    (job.salary_max||0)>70000?3:1,
      exploring:      1,
    },
    relevanceScore: Object.values(scores).reduce((a,b)=>a+b,0),
  };
}

function dedupe(jobs) {
  const seen = new Set();
  return jobs.filter(j => {
    const k = `${j.company}-${j.title}-${j.location}`.toLowerCase().replace(/\s/g,"");
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

function isJunk(job) {
  const t = job.title.toLowerCase();
  return ["devops","backend developer","frontend developer","data engineer",
    "scrum master","product manager","project manager","data scientist",
    "machine learning","solutions architect","network engineer"].some(x => t.includes(x));
}

// ── Main handler ─────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  const raw = [];
  const errors = [];
  let fetched = 0;

  // Adzuna — EU countries
  const adzunaFetches = [];
  for (const country of ADZUNA_COUNTRIES) {
    for (const query of ADZUNA_QUERIES) {
      adzunaFetches.push(
        fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=20&what=${encodeURIComponent(query)}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (!data?.results) return;
            const jobs = data.results.map(r => normaliseAdzuna(r, country));
            raw.push(...jobs);
            fetched += jobs.length;
          })
          .catch(e => errors.push({ country, query, error: e.message }))
      );
    }
  }

  // Reed — Ireland
  const reedFetches = REED_QUERIES.map(query =>
    fetch(
      `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(query)}&location=ireland&distancefromlocation=50&resultsToTake=25`,
      { headers: { 'Authorization': 'Basic ' + Buffer.from(REED_KEY + ':').toString('base64') } }
    )
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.results) return;
        const jobs = data.results.map(r => normaliseReed(r));
        raw.push(...jobs);
        fetched += jobs.length;
      })
      .catch(e => errors.push({ country: "IE", query, error: e.message }))
  );

  // Run all fetches in parallel
  await Promise.all([...adzunaFetches, ...reedFetches]);

  const deduped = dedupe(raw);
  const clean   = deduped.filter(j => !isJunk(j));
  const scored  = clean.map(score).sort((a,b) => b.relevanceScore - a.relevanceScore);

  const tools = { playwright:0, selenium:0, cypress:0, typescript:0, postman:0, api:0 };
  scored.forEach(j => {
    if (j.description.includes("playwright"))  tools.playwright++;
    if (j.description.includes("selenium"))    tools.selenium++;
    if (j.description.includes("cypress"))     tools.cypress++;
    if (j.description.includes("typescript"))  tools.typescript++;
    if (j.description.includes("postman"))     tools.postman++;
    if (j.description.includes("api"))         tools.api++;
  });

  const byCountry = {}, byStage = {};
  scored.forEach(j => {
    byCountry[j.country] = (byCountry[j.country]||0)+1;
    byStage[j.stage]     = (byStage[j.stage]||0)+1;
  });

  res.status(200).json({
    jobs: scored,
    report: {
      fetched, after_dedupe: deduped.length,
      after_junk_filter: clean.length,
      final: scored.length,
      remote: scored.filter(j=>j.remote).length,
      by_country: byCountry,
      by_stage: byStage,
      top_tools: tools,
      generated_at: new Date().toISOString(),
    },
    errors,
    generated_at: new Date().toISOString(),
  });
}
