
// ============================================================
// NextStepQA — Ireland Jobs Layer
// Fetches from IrishJobs.ie via their clean URL structure
// Uses JSON-LD structured data embedded in search results
// ============================================================

// IrishJobs search URLs for QA roles — these return HTML with
// JSON-LD structured data for each listing
const IRISHJOBS_SEARCHES = [
  "https://www.irishjobs.ie/jobs/qa-tester",
  "https://www.irishjobs.ie/jobs/software-tester",
  "https://www.irishjobs.ie/jobs/quality-assurance-tester",
  "https://www.irishjobs.ie/jobs/qa-engineer",
  "https://www.irishjobs.ie/jobs/qa-automation",
  "https://www.irishjobs.ie/jobs/test-automation-engineer",
  "https://www.irishjobs.ie/jobs/sdet",
];

// NIJobs for Northern Ireland coverage
const NIJOBS_SEARCHES = [
  "https://www.nijobs.com/jobs/software-testing",
  "https://www.nijobs.com/jobs/qa-engineer",
];

function stripHtml(str) {
  return (str || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&amp;/g,"&").replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'").replace(/&nbsp;/g," ")
    .replace(/\s+/g," ").trim();
}

function fmtSalary(min, max) {
  if (!min && !max) return null;
  const f = n => `€${Math.round(n/1000)}k`;
  if (min && max) return `${f(min)}–${f(max)}`;
  if (min) return `From ${f(min)}`;
  return `Up to ${f(max)}`;
}

// Parse JSON-LD JobPosting data from HTML
function parseJobsFromHtml(html, sourceUrl) {
  const jobs = [];

  // Extract all JSON-LD blocks
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);

      // Handle single job or array
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (item['@type'] !== 'JobPosting') continue;

        const title = item.title || item.name || "";
        const company = item.hiringOrganization?.name || "Unknown";
        const location = item.jobLocation?.address?.addressLocality ||
                         item.jobLocation?.address?.addressRegion ||
                         "Ireland";
        const country = "IE";
        const url = item.url || item.sameAs || sourceUrl;
        const posted = item.datePosted || new Date().toISOString();
        const desc = stripHtml(item.description || "").slice(0, 400);
        const salMin = item.baseSalary?.value?.minValue || item.estimatedSalary?.value?.minValue || null;
        const salMax = item.baseSalary?.value?.maxValue || item.estimatedSalary?.value?.maxValue || null;

        jobs.push({
          id: `ij-${Buffer.from(url).toString('base64').slice(0,20)}`,
          title,
          company,
          location: `${location}, Ireland`,
          country,
          salary_min: salMin,
          salary_max: salMax,
          salary_label: fmtSalary(salMin, salMax),
          remote: desc.toLowerCase().includes("remote") || desc.toLowerCase().includes("hybrid"),
          url,
          posted,
          description: desc.toLowerCase(),
          tags: [], stage: null, demand: null, gap: null,
          source: "irishjobs",
        });
      }
    } catch(e) {
      // Skip malformed JSON-LD
    }
  }

  return jobs;
}

// Fetch an IrishJobs search page and extract structured data
async function fetchIrishJobsPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NextStepQA/1.0; +https://jobs.nextstepqa.com)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-IE,en;q=0.9',
    }
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return parseJobsFromHtml(html, url);
}

export async function fetchIrelandJobs() {
  const results = [];
  const errors = [];

  // Fetch IrishJobs pages in parallel
  const searches = [...IRISHJOBS_SEARCHES, ...NIJOBS_SEARCHES];

  await Promise.all(searches.map(async url => {
    try {
      const jobs = await fetchIrishJobsPage(url);
      results.push(...jobs);
    } catch(e) {
      errors.push({ source: url, error: e.message });
    }
  }));

  // Deduplicate by URL
  const seen = new Set();
  const deduped = results.filter(j => {
    if (seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  return { jobs: deduped, errors };
}
