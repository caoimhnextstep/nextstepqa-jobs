// ============================================================
// NextStepQA — Job Classification Engine
// Scores, classifies and extracts signals from job descriptions
// ============================================================

const SIGNALS = {
  playwright:   ["playwright"],
  typescript:   ["typescript", "tsx"],
  cypress:      ["cypress"],
  selenium:     ["selenium"],
  api_testing:  ["api test", "rest api", "postman", "api automation", "api testing"],
  ci_cd:        ["ci/cd", "github actions", "jenkins", "gitlab ci", "pipeline"],
  docker:       ["docker", "kubernetes", "containeris"],
  python:       ["pytest", "python test"],
  java:         ["java test", "junit", "testng"],
  performance:  ["k6", "jmeter", "gatling", "performance test", "load test"],
};

const LEVEL_SIGNALS = {
  junior:  ["junior", "graduate", "entry level", "trainee", "0-2 years", "1 year", "2 years"],
  mid:     ["3 years", "4 years", "mid-level", "intermediate"],
  senior:  ["senior", "lead", "principal", "staff", "head of", "5+ years", "6+ years", "7+ years"],
};

const TRANSITION_SIGNALS = [
  "manual and automat", "some automation", "exposure to automat",
  "moving to automat", "beginning to automat", "start automat",
  "manual testing background", "transition", "willing to learn automat",
  "manual tester.*automat", "open to candidates"
];

const ROLE_TYPES = {
  automation: ["automation engineer", "sdet", "playwright", "cypress", "selenium engineer", "automation tester"],
  manual:     ["manual test", "manual qa", "functional test", "exploratory test", "uat"],
  lead:       ["qa lead", "test lead", "head of qa", "qa manager", "qa director", "lead qa"],
  performance:["performance test", "load test", "k6", "jmeter"],
  api:        ["api test", "api engineer", "api qa"],
};

function extractSignals(text) {
  const signals = {};
  for (const [key, keywords] of Object.entries(SIGNALS)) {
    signals[key] = keywords.some(kw => text.includes(kw));
  }
  return signals;
}

function classifyLevel(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  for (const [level, keywords] of Object.entries(LEVEL_SIGNALS)) {
    if (keywords.some(kw => text.includes(kw))) return level;
  }
  return "mid"; // default
}

function classifyRoleType(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  for (const [type, keywords] of Object.entries(ROLE_TYPES)) {
    if (keywords.some(kw => text.includes(kw))) return type;
  }
  return "qa";
}

function isTransitionFriendly(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  return TRANSITION_SIGNALS.some(kw => {
    try { return new RegExp(kw).test(text); } catch { return text.includes(kw); }
  });
}

function fmtSalary(min, max) {
  if (!min && !max) return null;
  const f = n => `€${Math.round(n/1000)}k`;
  if (min && max) return `${f(min)}–${f(max)}`;
  return min ? `From ${f(min)}` : `Up to ${f(max)}`;
}

function daysAgo(dateStr) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  } catch { return 999; }
}

export function classify(job) {
  const text = `${job.title} ${job.description}`.toLowerCase();
  const signals = extractSignals(text);
  const level = classifyLevel(job.title, job.description);
  const role_type = classifyRoleType(job.title, job.description);
  const transition_friendly = isTransitionFriendly(job.title, job.description);
  const age_days = daysAgo(job.posted);

  // Relevance score — how automation-focused is this role
  const relevance = Object.values(signals).filter(Boolean).length;

  // Demand label
  let demand = null;
  if (signals.playwright || signals.typescript) {
    demand = { label: "🔥 High Demand", color: "yellow" };
  } else if (transition_friendly) {
    demand = { label: "⚡ Transition Friendly", color: "orange" };
  } else if (role_type === "manual") {
    demand = { label: "📋 Manual Focus", color: "muted" };
  } else if (level === "senior" || role_type === "lead") {
    demand = { label: "🎯 Next Level", color: "purple" };
  } else if (level === "junior") {
    demand = { label: "🌱 Entry Level", color: "green" };
  }

  // Gap analysis
  const GAP = {
    junior:     { qualifyIf: ["1-2 years QA", "Manual testing basics"], youNeed: ["Any automation tool", "Basic scripting"], nextStep: "Start the Playwright course →" },
    manual:     { qualifyIf: ["2+ years manual QA", "JIRA / test cases"], youNeed: [], nextStep: null },
    transition: { qualifyIf: ["Manual QA background", "Some automation exposure"], youNeed: ["Playwright or Cypress", "TypeScript basics"], nextStep: "Close the gap with the course →" },
    automation: { qualifyIf: ["Automation framework exp", "TypeScript or Python"], youNeed: ["Playwright or Cypress", "CI/CD pipeline"], nextStep: "Close the gap with the course →" },
    lead:       { qualifyIf: ["5+ years QA", "Framework design", "Leadership"], youNeed: ["Architecture experience", "Mentoring"], nextStep: "Build your portfolio first →" },
  };

  const gapKey = transition_friendly ? "transition" : role_type === "lead" ? "lead" : level === "junior" ? "junior" : role_type === "manual" ? "manual" : "automation";
  const gap = { ...GAP[gapKey] };

  // Add specific skill gaps from signals
  const youNeed = [...gap.youNeed];
  if (!signals.playwright && role_type === "automation") youNeed.push("Playwright");
  if (!signals.typescript && signals.playwright) youNeed.push("TypeScript");
  if (!signals.ci_cd && role_type === "automation") youNeed.push("CI/CD experience");
  gap.youNeed = [...new Set(youNeed)].slice(0, 4);

  return {
    ...job,
    salary_label: fmtSalary(job.salary_min, job.salary_max),
    classification: { role_type, level, transition_friendly },
    signals,
    demand,
    gap,
    age_days,
    relevance_score: relevance,
  };
}
