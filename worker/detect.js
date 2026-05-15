// ============================================================
// NextStepQA — Market Change Detection System v2
// Runs via GitHub Actions Monday + Thursday
// Architecture: fetch → clean → title diff → Claude classify
// ============================================================

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';

const ALL_COMPANIES = [
  // Monday batch (A-M)
  { company: "Axway",           url: "https://www.axway.com/en/careers/job-openings",                           city: "Dublin",   sector: "API",        batch: "A-M" },
  { company: "BearingPoint",    url: "https://www.bearingpoint.com/en-ie/careers/",                             city: "Dublin",   sector: "Consulting", batch: "A-M" },
  { company: "Binance",         url: "https://www.binance.com/en/careers/job-opportunities",                    city: "Dublin",   sector: "Fintech",    batch: "A-M" },
  { company: "Citi",            url: "https://jobs.citi.com/search-jobs/ireland",                               city: "Dublin",   sector: "Fintech",    batch: "A-M" },
  { company: "Fineos",          url: "https://careers.fineos.com/search/?q=quality+assurance",                  city: "Dublin",   sector: "InsureTech", batch: "A-M" },
  { company: "GlobeTech",       url: "https://www.globetechgroup.com/careers",                                  city: "Cork",     sector: "L10n QA",    batch: "A-M" },
  { company: "Kefron",          url: "https://www.kefron.com/careers",                                          city: "Dublin",   sector: "SaaS",       batch: "A-M" },
  { company: "LocalEyes",       url: "https://localeyes.com/about-us/careers/",                                 city: "Cork",     sector: "L10n QA",    batch: "A-M" },
  { company: "Mastercard",      url: "https://careers.mastercard.com/us/en/search-results?keywords=quality+assurance&location=Dublin", city: "Dublin", sector: "Fintech", batch: "A-M" },
  { company: "Phorest",         url: "https://www.phorest.com/careers",                                         city: "Dublin",   sector: "SaaS",       batch: "A-M" },
  { company: "T-Pro",           url: "https://www.t-pro.ie/careers",                                            city: "Dublin",   sector: "HealthTech", batch: "A-M" },
  // Thursday batch (N-Z)
  { company: "Nutritics",       url: "https://www.nutritics.com/en/careers",                                    city: "Swords",   sector: "HealthTech", batch: "N-Z" },
  { company: "Phorest",         url: "https://www.phorest.com/careers",                                         city: "Dublin",   sector: "SaaS",       batch: "N-Z" },
  { company: "ServiceNow",      url: "https://careers.servicenow.com/en/jobs/?search=quality&location=Ireland", city: "Dublin",   sector: "SaaS",       batch: "N-Z" },
  { company: "Sophos",          url: "https://www.sophos.com/en-us/company/careers",                            city: "Dublin",   sector: "Security",   batch: "N-Z" },
  { company: "State Street",    url: "https://statestreet.wd1.myworkdayjobs.com/External/jobs?q=quality",       city: "Dublin",   sector: "Fintech",    batch: "N-Z" },
  { company: "T-Pro",           url: "https://www.t-pro.ie/careers",                                            city: "Dublin",   sector: "HealthTech", batch: "N-Z" },
  { company: "Transact Campus", url: "https://transactcampus.com/careers",                                      city: "Limerick", sector: "EdTech",     batch: "N-Z" },
  { company: "Verizon Connect", url: "https://www.verizonconnect.com/ie/careers/",                              city: "Dublin",   sector: "Telecom",    batch: "N-Z" },
  { company: "Workhuman",       url: "https://www.workhuman.com/company/careers/",                              city: "Dublin",   sector: "HRTech",     batch: "N-Z" },
  { company: "Workvivo",        url: "https://www.workvivo.com/careers",                                        city: "Cork",     sector: "HRTech",     batch: "N-Z" },
];

const SNAPSHOTS_FILE  = 'data/page-snapshots.json';
const CANDIDATES_FILE = 'data/detected-candidates.json';

function getBatch() {
  if (process.env.FORCE_BATCH) return process.env.FORCE_BATCH;
  return new Date().getDay() === 4 ? 'N-Z' : 'A-M';
}

async function fetchPage(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NextStepQA/1.0)', 'Accept': 'text/html' },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch(e) {
      if (i === retries) throw e;
      await new Promise(r => setTimeout(r, 2000 * Math.pow(2, i)));
    }
  }
}

function cleanHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/\s+/g, ' ').trim();
}

const NOISE_PHRASES = [
  'cookie', 'navigate', 'continuing to use', 'privacy policy', 'terms',
  'sign in', 'log in', 'register', 'subscribe', 'newsletter', 'follow us',
  'copyright', 'all rights reserved', 'powered by', 'skip to'
];

function extractTitleCandidates(text) {
  const QA = ['qa','quality assurance','test engineer','test automation','software tester',
    'sdet','playwright','automation engineer','quality engineer','manual test',
    'testing engineer','test analyst','qa automation','software quality'];
  return [...new Set(
    text.split(/[.\n,;|•]/)
      .map(l => l.trim())
      .filter(l => l.length > 8 && l.length < 120)
      .filter(l => QA.some(s => l.toLowerCase().includes(s)))
      .filter(l => !NOISE_PHRASES.some(n => l.toLowerCase().includes(n)))
  )].slice(0, 30);
}

function hash(t) { return createHash('md5').update(t).digest('hex'); }

// Pre-filter before Claude — must contain QA signal words
const QA_GATE = ['test','qa','quality','automation','sdet','validation','playwright','selenium','cypress','tester'];

function passesGate(title) {
  const t = title.toLowerCase();
  return QA_GATE.some(kw => t.includes(kw));
}

async function classifyWithClaude(company, city, sector, titles) {
  // Apply confidence gate first — no LLM call for obvious non-QA titles
  const gated = titles.filter(passesGate);
  if (gated.length === 0) return [];

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return gated.map(t => ({ title: t, is_qa: true, confidence: 'low' }));

  const prompt = `You are a QA hiring specialist reviewing job titles from ${company} (${city}, Ireland — ${sector}).

Classify each title. Return ONLY a JSON array.

Include: QA Engineer, Test Engineer, SDET, Automation Engineer, Software Tester, Test Analyst, Quality Engineer, Test Lead, Performance Tester, Software Engineer in Test.
Exclude: DevOps, Software Engineer (unless "in Test"), Data Engineer, Product Manager, Support Engineer, Security Engineer (unless testing-focused).
Be strict — when uncertain, exclude.

Return: [{"title": "...", "is_qa": true/false, "confidence": "high/medium/low"}]

Titles:
${gated.map((t,i) => `${i+1}. ${t}`).join('\n')}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`Claude ${res.status}`);
    const data = await res.json();
    const clean = data.content?.[0]?.text?.replace(/```json|```/g,'').trim() || '[]';
    return JSON.parse(clean);
  } catch(e) {
    console.log(`    Claude error: ${e.message}`);
    return titles.map(t => ({ title: t, is_qa: true, confidence: 'low' }));
  }
}

const HEALTH_FILE = 'data/source-health.json';

async function run() {
  const batch = getBatch();
  const companies = ALL_COMPANIES.filter(c => c.batch === batch);

  console.log(`\n🔍 NextStepQA Detection — ${new Date().toISOString()}`);
  console.log(`📦 Batch ${batch}: ${companies.length} companies\n`);

  const snapshots = existsSync(SNAPSHOTS_FILE) ? JSON.parse(readFileSync(SNAPSHOTS_FILE,'utf8')) : {};
  const existing  = existsSync(CANDIDATES_FILE) ? JSON.parse(readFileSync(CANDIDATES_FILE,'utf8')) : { candidates: [] };
  const health    = existsSync(HEALTH_FILE) ? JSON.parse(readFileSync(HEALTH_FILE,'utf8')) : {};
  const existingKeys = new Set(existing.candidates.map(c => `${c.company}::${c.title}`));
  const newCandidates = [];
  const updated = { ...snapshots };
  const updatedHealth = { ...health };

  for (const site of companies) {
    process.stdout.write(`  ${site.company.padEnd(22)}`);
    try {
      const html   = await fetchPage(site.url);
      const text   = cleanHtml(html);
      const pgHash = hash(text);
      const prev   = snapshots[site.company] || {};

      updated[site.company] = { ...prev, page_hash: pgHash, url: site.url, last_checked: new Date().toISOString(), last_success: new Date().toISOString() };

      if (pgHash === prev.page_hash) { console.log('no change'); continue; }

      const currentTitles = extractTitleCandidates(text);
      const prevTitles    = new Set(prev.job_titles || []);
      const newTitles     = currentTitles.filter(t => !prevTitles.has(t));

      updated[site.company].job_titles = currentTitles;

      if (newTitles.length === 0) { console.log('changed (no new titles)'); continue; }
      console.log(`changed — ${newTitles.length} new title(s)`);

      const classified = await classifyWithClaude(site.company, site.city, site.sector, newTitles);
      const qaRoles    = classified.filter(r => r.is_qa && r.confidence !== 'low');

      for (const role of qaRoles) {
        const key = `${site.company}::${role.title}`;
        if (existingKeys.has(key)) continue;
        existingKeys.add(key);
        console.log(`     ✅ ${role.title} [${role.confidence}]`);
        newCandidates.push({
          id: `det-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
          company: site.company, city: site.city, sector: site.sector,
          title: role.title, location: `${site.city}, Ireland`,
          careers_url: site.url, confidence: role.confidence,
          detected_at: new Date().toISOString(), status: 'pending',
        });
      }

      if (!qaRoles.length) console.log(`     └─ no QA roles`);

      // Update health log
      updatedHealth[site.company] = {
        status: 'ok',
        last_run: new Date().toISOString(),
        last_change_detected: new Date().toISOString(),
        new_candidates: qaRoles.length,
        total_titles_seen: currentTitles.length,
      };

      await new Promise(r => setTimeout(r, 3000));

    } catch(e) {
      console.log(`error: ${e.message.slice(0,60)}`);
      updated[site.company] = { ...snapshots[site.company], last_error: e.message, last_checked: new Date().toISOString() };
      updatedHealth[site.company] = {
        ...health[site.company],
        status: 'error',
        last_run: new Date().toISOString(),
        last_error: e.message.slice(0, 100),
      };
    }
  }

  writeFileSync(SNAPSHOTS_FILE, JSON.stringify(updated, null, 2));
  writeFileSync(HEALTH_FILE, JSON.stringify(updatedHealth, null, 2));

  const allCandidates = [...newCandidates, ...existing.candidates].slice(0, 200);
  writeFileSync(CANDIDATES_FILE, JSON.stringify({
    candidates: allCandidates,
    last_run: new Date().toISOString(), last_batch: batch,
    new_this_run: newCandidates.length,
    pending: allCandidates.filter(c => c.status === 'pending').length,
  }, null, 2));

  console.log(`\n📊 Checked: ${companies.length} | New: ${newCandidates.length} | Pending: ${allCandidates.filter(c=>c.status==='pending').length}`);
  if (newCandidates.length > 0) {
    console.log(`\n🎯 Detections:`);
    newCandidates.forEach(c => console.log(`   ${c.company}: ${c.title}`));
  }
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
