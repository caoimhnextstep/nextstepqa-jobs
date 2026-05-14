
// ============================================================
// NextStepQA — Scheduled Worker
// Runs every 6 hours on Railway
// Fetches all ATS feeds, classifies, pushes to GitHub
// ============================================================

import { SOURCES } from './sources.js';
import { FETCHERS, isQARole } from './fetch.js';
import { classify } from './classify.js';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO  = process.env.GITHUB_REPO || "caoimhnextstep/nextstepqa-jobs";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

// ── Fetch all sources ─────────────────────────────────────────
async function fetchAllSources() {
  const results = [];
  const errors = [];
  const sourceStats = [];

  await Promise.all(SOURCES.map(async source => {
    const fetcher = FETCHERS[source.ats];
    if (!fetcher) return;

    const start = Date.now();
    try {
      const jobs = await fetcher(source);
      results.push(...jobs);
      sourceStats.push({
        company: source.company,
        ats: source.ats,
        slug: source.slug,
        jobs_found: jobs.length,
        status: "ok",
        latency_ms: Date.now() - start,
        last_success: new Date().toISOString(),
      });
    } catch(e) {
      errors.push({
        company: source.company,
        ats: source.ats,
        slug: source.slug,
        error: e.message,
        status_code: e.message.match(/\d+/)?.[0] || "unknown",
        last_attempt: new Date().toISOString(),
      });
      sourceStats.push({
        company: source.company,
        ats: source.ats,
        slug: source.slug,
        jobs_found: 0,
        status: "error",
        error: e.message,
        latency_ms: Date.now() - start,
      });
    }
  }));

  return { results, errors, sourceStats };
}

// ── Deduplicate ───────────────────────────────────────────────
function dedupe(jobs) {
  const seen = new Set();
  return jobs.filter(j => {
    const key = `${j.company}-${j.title}`.toLowerCase().replace(/\s+/g,"");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Generate stats snapshot ───────────────────────────────────
function generateStats(jobs, errors, sourceStats) {
  const byCountry = {}, byATS = {}, bySector = {}, byRoleType = {};
  const tools = { playwright:0, typescript:0, cypress:0, selenium:0, api_testing:0, ci_cd:0 };

  jobs.forEach(j => {
    byCountry[j.country] = (byCountry[j.country]||0)+1;
    byATS[j.ats] = (byATS[j.ats]||0)+1;
    bySector[j.sector] = (bySector[j.sector]||0)+1;
    byRoleType[j.classification?.role_type||"unknown"] = (byRoleType[j.classification?.role_type||"unknown"]||0)+1;
    if (j.signals) {
      for (const [tool, val] of Object.entries(j.signals)) {
        if (val && tools[tool] !== undefined) tools[tool]++;
      }
    }
  });

  const totalJobs = jobs.length;
  const playwrightPct = totalJobs ? Math.round((tools.playwright/totalJobs)*100) : 0;

  return {
    generated_at: new Date().toISOString(),
    total_jobs: totalJobs,
    irish_jobs: byCountry["IE"] || 0,
    remote_jobs: jobs.filter(j => j.remote).length,
    transition_friendly: jobs.filter(j => j.classification?.transition_friendly).length,
    sources_ok: sourceStats.filter(s => s.status === "ok").length,
    sources_failed: sourceStats.filter(s => s.status === "error").length,
    by_country: byCountry,
    by_ats: byATS,
    by_sector: bySector,
    by_role_type: byRoleType,
    tool_signals: tools,
    playwright_demand_pct: playwrightPct,
    errors: errors.length,
  };
}

// ── Push to GitHub ────────────────────────────────────────────
async function pushToGitHub(filename, content, message) {
  if (!GITHUB_TOKEN) {
    console.log(`[DRY RUN] Would push ${filename} (${JSON.stringify(content).length} bytes)`);
    return;
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/data/${filename}`;

  // Get current SHA if file exists
  let sha;
  try {
    const existing = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      }
    });
    if (existing.ok) {
      const data = await existing.json();
      sha = data.sha;
    }
  } catch { /* file doesn't exist yet, that's fine */ }

  const body = {
    message,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {}),
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub push failed: ${res.status} ${err}`);
  }

  console.log(`✅ Pushed ${filename}`);
}

// ── Main ──────────────────────────────────────────────────────
async function run() {
  console.log(`\n🚀 NextStepQA Worker starting — ${new Date().toISOString()}`);
  console.log(`📋 Sources: ${SOURCES.length} companies across ${[...new Set(SOURCES.map(s=>s.ats))].join(", ")}`);

  // 1. Fetch
  console.log("\n📡 Fetching ATS feeds...");
  const { results, errors, sourceStats } = await fetchAllSources();
  console.log(`   Raw: ${results.length} jobs, ${errors.length} errors`);

  // 2. Dedupe
  const deduped = dedupe(results);
  console.log(`   After dedupe: ${deduped.length} jobs`);

  // 3. Classify
  const classified = deduped.map(classify);
  classified.sort((a,b) => b.relevance_score - a.relevance_score);
  console.log(`   Classified: ${classified.length} jobs`);

  // 4. Stats
  const stats = generateStats(classified, errors, sourceStats);
  console.log(`\n📊 Stats:`);
  console.log(`   Total: ${stats.total_jobs} | Irish: ${stats.irish_jobs} | Remote: ${stats.remote_jobs}`);
  console.log(`   Playwright demand: ${stats.playwright_demand_pct}%`);
  console.log(`   Sources OK: ${stats.sources_ok} | Failed: ${stats.sources_failed}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Failed sources:`);
    errors.forEach(e => console.log(`   ${e.company} (${e.ats}/${e.slug}): ${e.error}`));
  }

  // 5. Push to GitHub
  console.log("\n📤 Pushing to GitHub...");
  const timestamp = new Date().toISOString();

  await pushToGitHub("jobs-snapshot.json", {
    jobs: classified,
    generated_at: timestamp,
  }, `🤖 Jobs snapshot — ${classified.length} roles (${stats.irish_jobs} Irish)`);

  await pushToGitHub("stats.json", stats,
    `📊 Stats update — ${stats.total_jobs} jobs, ${stats.playwright_demand_pct}% Playwright`);

  await pushToGitHub("failed-sources.json", {
    errors,
    source_stats: sourceStats,
    generated_at: timestamp,
  }, `⚠️ Source health — ${stats.sources_failed} failed`);

  console.log(`\n✅ Done — ${new Date().toISOString()}`);
}

// Run immediately, then on interval if CRON_INTERVAL_HOURS is set
run().catch(e => {
  console.error("❌ Worker failed:", e);
  process.exit(1);
});

const intervalHours = parseFloat(process.env.CRON_INTERVAL_HOURS || "0");
if (intervalHours > 0) {
  setInterval(() => {
    run().catch(e => console.error("❌ Worker interval failed:", e));
  }, intervalHours * 60 * 60 * 1000);
}
