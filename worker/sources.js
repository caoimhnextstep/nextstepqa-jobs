// ============================================================
// NextStepQA — Company Registry
// The knowable map of Irish QA hiring
// ============================================================

export const SOURCES = [

  // ── GREENHOUSE — Verified Irish ──────────────────────────────
  { company: "Intercom",        ats: "greenhouse", slug: "intercom",         city: "Dublin",  country: "IE", sector: "SaaS",        verified: true  },
  { company: "Tines",           ats: "greenhouse", slug: "tines",            city: "Dublin",  country: "IE", sector: "Automation",   verified: true  },
  { company: "Flipdish",        ats: "greenhouse", slug: "flipdish",         city: "Dublin",  country: "IE", sector: "FoodTech",     verified: true  },
  { company: "HubSpot",         ats: "greenhouse", slug: "hubspot",          city: "Dublin",  country: "IE", sector: "SaaS",         verified: true  },
  { company: "Stripe",          ats: "greenhouse", slug: "stripe",           city: "Dublin",  country: "IE", sector: "Fintech",      verified: true  },
  { company: "Kaseya",          ats: "greenhouse", slug: "kaseya",           city: "Dublin",  country: "IE", sector: "IT Mgmt",      verified: true  },
  { company: "Rent the Runway", ats: "greenhouse", slug: "renttherunway",    city: "Galway",  country: "IE", sector: "eCommerce",    verified: true  },

  // ── GREENHOUSE — Unverified Irish ────────────────────────────
  { company: "Toast",           ats: "greenhouse", slug: "toasttab",         city: "Dublin",  country: "IE", sector: "FoodTech",     verified: false },
  { company: "Mastercard",      ats: "greenhouse", slug: "mastercard",       city: "Dublin",  country: "IE", sector: "Fintech",      verified: false },
  { company: "Zendesk",         ats: "greenhouse", slug: "zendesk",          city: "Dublin",  country: "IE", sector: "SaaS",         verified: false },
  { company: "Squarespace",     ats: "greenhouse", slug: "squarespace",      city: "Dublin",  country: "IE", sector: "SaaS",         verified: false },
  { company: "Workday",         ats: "greenhouse", slug: "workday",          city: "Dublin",  country: "IE", sector: "HRTech",       verified: false },
  { company: "Figma",           ats: "greenhouse", slug: "figma",            city: "Dublin",  country: "IE", sector: "Design",       verified: false },
  { company: "Datadog",         ats: "greenhouse", slug: "datadog",          city: "Dublin",  country: "IE", sector: "DevOps",       verified: false },
  { company: "Cloudflare",      ats: "greenhouse", slug: "cloudflare",       city: "Dublin",  country: "IE", sector: "Infra",        verified: false },
  { company: "MongoDB",         ats: "greenhouse", slug: "mongodb",          city: "Dublin",  country: "IE", sector: "Database",     verified: false },
  { company: "Coinbase",        ats: "greenhouse", slug: "coinbase",         city: "Dublin",  country: "IE", sector: "Fintech",      verified: false },
  { company: "Wayfair",         ats: "greenhouse", slug: "wayfair",          city: "Dublin",  country: "IE", sector: "eCommerce",    verified: false },
  { company: "Indeed",          ats: "greenhouse", slug: "indeed",           city: "Dublin",  country: "IE", sector: "HRTech",       verified: false },
  { company: "LinkedIn",        ats: "greenhouse", slug: "linkedin",         city: "Dublin",  country: "IE", sector: "SaaS",         verified: false },
  { company: "TikTok",          ats: "greenhouse", slug: "tiktok",           city: "Dublin",  country: "IE", sector: "Social",       verified: false },

  // ── LEVER — Verified Irish ────────────────────────────────────
  { company: "Kitman Labs",     ats: "lever", slug: "kitmanlabs",      city: "Dublin",  country: "IE", sector: "SportsTech",   verified: true  },
  { company: "CarTrawler",      ats: "lever", slug: "cartrawler",      city: "Dublin",  country: "IE", sector: "TravelTech",   verified: true  },

  // ── LEVER — Unverified Irish ──────────────────────────────────
  { company: "Wayflyer",        ats: "lever", slug: "wayflyer",        city: "Dublin",  country: "IE", sector: "Fintech",      verified: false },
  { company: "Hostelworld",     ats: "lever", slug: "hostelworld",     city: "Dublin",  country: "IE", sector: "TravelTech",   verified: false },
  { company: "Immedis",         ats: "lever", slug: "immedis",         city: "Dublin",  country: "IE", sector: "HRTech",       verified: false },
  { company: "Personio",        ats: "lever", slug: "personio",        city: "Dublin",  country: "IE", sector: "HRTech",       verified: false },
  { company: "Amplitude",       ats: "lever", slug: "amplitude",       city: "Dublin",  country: "IE", sector: "Analytics",    verified: false },
  { company: "Notion",          ats: "lever", slug: "notion",          city: "Dublin",  country: "IE", sector: "SaaS",         verified: false },

  // ── WORKABLE — Irish ──────────────────────────────────────────
  { company: "Fenergo",         ats: "workable", slug: "fenergocareers",   city: "Dublin", country: "IE", sector: "Fintech",    verified: true  },
  { company: "Poppulo",         ats: "workable", slug: "poppulo",          city: "Cork",   country: "IE", sector: "SaaS",       verified: false },
  { company: "LearnUpon",       ats: "workable", slug: "learnupon",        city: "Dublin", country: "IE", sector: "EdTech",     verified: false },
  { company: "Teamwork",        ats: "workable", slug: "teamwork",         city: "Cork",   country: "IE", sector: "SaaS",       verified: false },

  // ── SMARTRECRUITERS — Irish ───────────────────────────────────
  { company: "Version 1",       ats: "smartrecruiters", slug: "Version1",          city: "Dublin", country: "IE", sector: "Consulting",  verified: true  },
  { company: "Ergo",            ats: "smartrecruiters", slug: "ErgoGroup",         city: "Dublin", country: "IE", sector: "Consulting",  verified: false },
  { company: "Accenture IE",    ats: "smartrecruiters", slug: "AccentureIreland",  city: "Dublin", country: "IE", sector: "Consulting",  verified: false },
  { company: "Deloitte IE",     ats: "smartrecruiters", slug: "DeloitteIreland",   city: "Dublin", country: "IE", sector: "Consulting",  verified: false },

  // ── ASHBY ─────────────────────────────────────────────────────
  { company: "CalypsoAI",       ats: "ashby", slug: "calypsoai",    city: "Dublin",  country: "IE", sector: "AI Security",  verified: false },
  { company: "Storyblok",       ats: "ashby", slug: "storyblok",    city: "Remote",  country: "EU", sector: "SaaS",         verified: false },
];
