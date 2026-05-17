// ============================================================
// NextStepQA — Irish QA Market Company Registry
// The complete map of Irish QA hiring ecosystem
// Last updated: May 2026
// ============================================================

export const COMPANIES = [

  // ── FINTECH / PAYMENTS / TRADING ─────────────────────────
  { company: "Stripe",            sector: "Fintech",    city: "Dublin",   ats: "greenhouse",      slug: "stripe",          access: "auto",   frequency: "regular",    verified: true  },
  { company: "Fenergo",           sector: "Fintech",    city: "Dublin",   ats: "workable",         slug: "fenergocareers",  access: "auto",   frequency: "regular",    verified: true  },
  { company: "Fidelity",          sector: "Fintech",    city: "Galway",   ats: "workday",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Mastercard",        sector: "Fintech",    city: "Dublin",   ats: "greenhouse",       slug: "mastercard",      access: "auto",   frequency: "regular",    verified: false },
  { company: "Wayflyer",          sector: "Fintech",    city: "Dublin",   ats: "ashby",            slug: "wayflyer",        access: "auto",   frequency: "occasional", verified: false },
  { company: "Citi",              sector: "Fintech",    city: "Dublin",   ats: "taleo",            slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Bank of America",   sector: "Fintech",    city: "Dublin",   ats: "taleo",            slug: null,              access: "manual", frequency: "occasional", verified: true  },
  { company: "AIB",               sector: "Fintech",    city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Global Payments",   sector: "Fintech",    city: "Dublin",   ats: "workday",          slug: null,              access: "manual", frequency: "occasional", verified: true  },
  { company: "FIS Global",        sector: "Fintech",    city: "Dublin",   ats: "workday",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Finastra",          sector: "Fintech",    city: "Dublin",   ats: "workday",          slug: null,              access: "manual", frequency: "occasional", verified: true  },
  { company: "TransferMate",      sector: "Fintech",    city: "Kilkenny", ats: "unknown",          slug: null,              access: "manual", frequency: "occasional", verified: false },
  { company: "Toast",             sector: "Fintech",    city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "regular",    verified: false },
  { company: "Coinbase",          sector: "Fintech",    city: "Dublin",   ats: "greenhouse",       slug: "coinbasecareers", access: "auto",   frequency: "occasional", verified: false },
  { company: "Binance",           sector: "Fintech",    city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "occasional", verified: true  },
  { company: "Kitman Labs",       sector: "SportsTech", city: "Dublin",   ats: "lever",            slug: "kitmanlabs",      access: "auto",   frequency: "occasional", verified: true  },

  // ── CYBERSECURITY / CLOUD / INFRA ─────────────────────────
  { company: "CrowdStrike",       sector: "Security",   city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Kaseya",            sector: "IT Mgmt",    city: "Dublin",   ats: "greenhouse",       slug: "kaseya",          access: "auto",   frequency: "regular",    verified: true  },
  { company: "Sophos",            sector: "Security",   city: "Dublin",   ats: "unknown",          slug: null,              access: "manual", frequency: "occasional", verified: false },
  { company: "Okta",              sector: "Security",   city: "Dublin",   ats: "greenhouse",       slug: "okta",            access: "auto",   frequency: "occasional", verified: false },
  { company: "ServiceNow",        sector: "SaaS",       city: "Dublin",   ats: "workday",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Dell Technologies", sector: "Infra",      city: "Cork",     ats: "taleo",            slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "IBM",               sector: "Infra",      city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Red Hat",           sector: "Infra",      city: "Waterford",ats: "greenhouse",       slug: "redhat-1",        access: "auto",   frequency: "regular",    verified: false },
  { company: "Ericsson",          sector: "Telecom",    city: "Athlone",  ats: "successfactors",   slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Genesys",           sector: "SaaS",       city: "Galway",   ats: "internal",         slug: null,              access: "manual", frequency: "regular",    verified: false },
  { company: "Datadog",           sector: "DevOps",     city: "Dublin",   ats: "greenhouse",       slug: "datadog",         access: "auto",   frequency: "regular",    verified: true  },
  { company: "MongoDB",           sector: "Database",   city: "Dublin",   ats: "greenhouse",       slug: "mongodb",         access: "auto",   frequency: "occasional", verified: true  },
  { company: "Elastic",           sector: "Search",     city: "Dublin",   ats: "greenhouse",       slug: "elastic",         access: "auto",   frequency: "occasional", verified: false },
  { company: "New Relic",         sector: "DevOps",     city: "Dublin",   ats: "greenhouse",       slug: "newrelic",        access: "auto",   frequency: "occasional", verified: false },

  // ── SAAS / PRODUCT ─────────────────────────────────────────
  { company: "Intercom",          sector: "SaaS",       city: "Dublin",   ats: "greenhouse",       slug: "intercom",        access: "auto",   frequency: "regular",    verified: true  },
  { company: "HubSpot",           sector: "SaaS",       city: "Dublin",   ats: "greenhouse",       slug: "hubspot",         access: "auto",   frequency: "regular",    verified: true  },
  { company: "Tines",             sector: "Automation", city: "Dublin",   ats: "greenhouse",       slug: "tines",           access: "auto",   frequency: "occasional", verified: true  },
  { company: "Zendesk",           sector: "SaaS",       city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "regular",    verified: false },
  { company: "Squarespace",       sector: "SaaS",       city: "Dublin",   ats: "greenhouse",       slug: "squarespace",     access: "auto",   frequency: "occasional", verified: true  },
  { company: "Cloudflare",        sector: "Infra",      city: "Dublin",   ats: "greenhouse",       slug: "cloudflare",      access: "auto",   frequency: "regular",    verified: true  },
  { company: "Workday",           sector: "HRTech",     city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "occasional", verified: false },
  { company: "Qualtrics",         sector: "SaaS",       city: "Dublin",   ats: "greenhouse",       slug: "qualtrics",       access: "auto",   frequency: "occasional", verified: false },
  { company: "Contentful",        sector: "SaaS",       city: "Dublin",   ats: "greenhouse",       slug: "contentful",      access: "auto",   frequency: "occasional", verified: false },
  { company: "Rippling",          sector: "HRTech",     city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "regular",    verified: false },
  { company: "Klaviyo",           sector: "SaaS",       city: "Dublin",   ats: "greenhouse",       slug: "klaviyo",         access: "auto",   frequency: "occasional", verified: false },

  // ── IRISH INDIGENOUS SAAS ──────────────────────────────────
  { company: "Flipdish",          sector: "FoodTech",   city: "Dublin",   ats: "greenhouse",       slug: "flipdish",        access: "auto",   frequency: "regular",    verified: true  },
  { company: "Phorest",           sector: "SaaS",       city: "Dublin",   ats: "unknown",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "LearnUpon",         sector: "EdTech",     city: "Dublin",   ats: "workable",         slug: "learnupon",       access: "auto",   frequency: "occasional", verified: true  },
  { company: "Teamwork",          sector: "SaaS",       city: "Cork",     ats: "workable",         slug: "teamwork",        access: "auto",   frequency: "occasional", verified: true  },
  { company: "Workvivo",          sector: "HRTech",     city: "Cork",     ats: "unknown",          slug: null,              access: "manual", frequency: "occasional", verified: false },
  { company: "Poppulo",           sector: "SaaS",       city: "Cork",     ats: "greenhouse",       slug: "poppulo",         access: "auto",   frequency: "occasional", verified: false },
  { company: "Fineos",            sector: "InsureTech", city: "Dublin",   ats: "successfactors",   slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "T-Pro",             sector: "HealthTech", city: "Dublin",   ats: "unknown",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "LetsGetChecked",    sector: "HealthTech", city: "Dublin",   ats: "greenhouse",       slug: "letsgetchecked",  access: "auto",   frequency: "occasional", verified: false },
  { company: "NearForm",          sector: "Consulting", city: "Remote",   ats: "greenhouse",       slug: "nearform",        access: "auto",   frequency: "occasional", verified: true  },
  { company: "ID-Pal",            sector: "Identity",   city: "Dublin",   ats: "unknown",          slug: null,              access: "manual", frequency: "occasional", verified: false },
  { company: "CarTrawler",        sector: "TravelTech", city: "Dublin",   ats: "lever",            slug: "cartrawler",      access: "auto",   frequency: "occasional", verified: true  },
  { company: "Hostelworld",       sector: "TravelTech", city: "Dublin",   ats: "greenhouse",       slug: "hostelworld",     access: "auto",   frequency: "occasional", verified: false },
  { company: "Immedis",           sector: "HRTech",     city: "Dublin",   ats: "greenhouse",       slug: "immedis",         access: "auto",   frequency: "occasional", verified: false },
  { company: "Grouper",           sector: "SaaS",       city: "Dublin",   ats: "unknown",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Transact Campus",   sector: "EdTech",     city: "Limerick", ats: "unknown",          slug: null,              access: "manual", frequency: "occasional", verified: true  },
  { company: "Kefron",            sector: "SaaS",       city: "Dublin",   ats: "unknown",          slug: null,              access: "manual", frequency: "occasional", verified: true  },
  { company: "Axway",             sector: "API",        city: "Dublin",   ats: "unknown",          slug: null,              access: "manual", frequency: "occasional", verified: true  },

  // ── ENTERPRISE / CONSULTING ────────────────────────────────
  { company: "Version 1",         sector: "Consulting", city: "Dublin",   ats: "smartrecruiters",  slug: "Version1",        access: "auto",   frequency: "regular",    verified: true  },
  { company: "Accenture",         sector: "Consulting", city: "Dublin",   ats: "smartrecruiters",  slug: "AccentureIreland",access: "auto",   frequency: "regular",    verified: true  },
  { company: "Deloitte",          sector: "Consulting", city: "Dublin",   ats: "smartrecruiters",  slug: "DeloitteIreland", access: "auto",   frequency: "regular",    verified: true  },
  { company: "BearingPoint",      sector: "Consulting", city: "Dublin",   ats: "successfactors",   slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Ergo",              sector: "Consulting", city: "Dublin",   ats: "smartrecruiters",  slug: "ErgoGroup",       access: "auto",   frequency: "occasional", verified: true  },
  { company: "Capgemini",         sector: "Consulting", city: "Dublin",   ats: "successfactors",   slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Cognizant",         sector: "Consulting", city: "Dublin",   ats: "workday",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Wipro",             sector: "Consulting", city: "Dublin",   ats: "workday",          slug: null,              access: "manual", frequency: "occasional", verified: false },
  { company: "TCS",               sector: "Consulting", city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Sogeti",            sector: "Consulting", city: "Dublin",   ats: "successfactors",   slug: null,              access: "manual", frequency: "regular",    verified: true  },

  // ── ENTERPRISE / TELECOM / HEALTHCARE ─────────────────────
  { company: "Verizon Connect",   sector: "Telecom",    city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Optum",             sector: "HealthTech", city: "Dublin",   ats: "taleo",            slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Workhuman",         sector: "HRTech",     city: "Dublin",   ats: "workday",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "State Street",      sector: "Fintech",    city: "Dublin",   ats: "workday",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Rent the Runway",   sector: "eCommerce",  city: "Galway",   ats: "greenhouse",       slug: "renttherunway",   access: "auto",   frequency: "occasional", verified: true  },
  { company: "Deutsche Börse",    sector: "Fintech",    city: "Cork",     ats: "successfactors",   slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Susquehanna",       sector: "Trading",    city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "occasional", verified: true  },

  // ── GAMING / LOCALISATION QA ──────────────────────────────
  { company: "Activision/King",   sector: "Gaming",     city: "Dublin",   ats: "internal",         slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "Keywords Studios",  sector: "Gaming",     city: "Dublin",   ats: "smartrecruiters",  slug: "KeywordsStudios", access: "auto",   frequency: "regular",    verified: false },
  { company: "LocalEyes",         sector: "L10n QA",    city: "Cork",     ats: "unknown",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "GlobeTech",         sector: "L10n QA",    city: "Cork",     ats: "unknown",          slug: null,              access: "manual", frequency: "regular",    verified: true  },
  { company: "EA Galway",         sector: "Gaming",     city: "Galway",   ats: "internal",         slug: null,              access: "manual", frequency: "occasional", verified: true  },

];

// ── Derived lists for worker and admin tool ───────────────────

// Companies we can auto-ingest via ATS
export const AUTO_SOURCES = COMPANIES
  .filter(c => c.access === 'auto' && c.slug)
  .map(c => ({
    company:  c.company,
    ats:      c.ats,
    slug:     c.slug,
    city:     c.city,
    country:  "IE",
    sector:   c.sector,
    verified: c.verified,
  }));

// Companies that require manual curation (with careers URLs)
export const MANUAL_SOURCES = COMPANIES
  .filter(c => c.access === 'manual')
  .map(c => ({
    company:   c.company,
    sector:    c.sector,
    city:      c.city,
    ats:       c.ats,
    frequency: c.frequency,
  }));

// Stats
export const REGISTRY_STATS = {
  total:      COMPANIES.length,
  auto:       COMPANIES.filter(c => c.access === 'auto').length,
  manual:     COMPANIES.filter(c => c.access === 'manual').length,
  verified:   COMPANIES.filter(c => c.verified).length,
  sectors:    [...new Set(COMPANIES.map(c => c.sector))].length,
  workday:    COMPANIES.filter(c => c.ats === 'workday').length,
  greenhouse: COMPANIES.filter(c => c.ats === 'greenhouse').length,
  lever:      COMPANIES.filter(c => c.ats === 'lever').length,
};
