export const CATEGORIES = [
  "Polity",
  "Economy",
  "International Relations",
  "Environment",
  "Science & Technology",
  "Geography",
  "History & Culture",
  "Social Issues",
  "Government Schemes",
  "Others",
];

export const GS_PAPERS = ["GS I", "GS II", "GS III", "GS IV"];
export const EXTRA_BUCKETS = ["Schemes", "Reports", "Persons", "Places"];
export const ALL_BUCKETS = [...GS_PAPERS, ...EXTRA_BUCKETS];

export const BUCKET_META = {
  "GS I": { sublabel: "History, Geography..." },
  "GS II": { sublabel: "Polity, Governance..." },
  "GS III": { sublabel: "Economy, Environment..." },
  "GS IV": { sublabel: "Ethics, Integrity..." },
  Schemes: { sublabel: "Govt Schemes" },
  Reports: { sublabel: "Indices & Reports" },
  Persons: { sublabel: "In News" },
  Places: { sublabel: "In News" },
};

const KEYWORDS = {
  Polity: [
    "parliament", "lok sabha", "rajya sabha", "supreme court", "high court",
    "constitution", "bill", "amendment", "president", "governor", "cabinet",
    "ministry", "election commission", "judiciary", "panchayat", "municipal",
    "governance", "niti aayog", "ordinance", "assembly election", "chief justice",
    "assembly", "mla", "disqualification", "no-confidence", "speaker",
    "election result", "by-election", "cabinet reshuffle", "governor's rule",
    "president's rule", "court verdict", "verdict", "court order", "sc verdict",
    "civic body", "mayor", "collector", "sedition", "public interest litigation",
  ],
  Economy: [
    "gdp", "inflation", "rbi", "reserve bank", "budget", "fiscal", "tax",
    "gst", "export", "import", "trade deficit", "stock market", "sensex",
    "nifty", "economic survey", "disinvestment", "unemployment", "msme",
    "startup", "fdi", "monetary policy", "rupee", "repo rate",
    "ipo", "merger", "acquisition", "layoffs", "job cuts", "market crash",
    "share price", "investment", "infrastructure project", "real estate",
    "railway budget", "logistics", "manufacturing sector",
  ],
  "International Relations": [
    "united nations", "bilateral", "diplomat", "embassy", "foreign ministry",
    "summit", "g20", "g7", "saarc", "brics", "quad", "visa", "border dispute",
    "treaty", "sanctions", "united states", "china", "pakistan", "russia",
    "ukraine", "external affairs", "trade deal", "tariff", "export ban",
    "import ban", "ceasefire", "refugee", "consulate", "passport",
  ],
  Environment: [
    "climate change", "carbon", "emission", "biodiversity", "wildlife",
    "forest", "pollution", "wetland", "conservation", "renewable energy",
    "solar power", "wind energy", "endangered species", "tiger reserve",
    "national park", "global warming", "cop28", "cop29", "cop30", "ecology",
    "air quality", "aqi", "drought", "flood", "heatwave", "deforestation",
    "mining", "water crisis", "sewage", "waste management",
  ],
  "Science & Technology": [
    "isro", "satellite", "space mission", "nasa", "artificial intelligence",
    " ai ", "robot", "vaccine", "research", "scientist", "technology", "5g",
    "semiconductor", "quantum", "drdo", "missile test", "cyber security",
    "digital india", "space station", "chandrayaan", "gaganyaan", "telecom",
    "data breach", "electric vehicle", "battery technology",
  ],
  Geography: [
    "river", "glacier", "earthquake", "cyclone", "tsunami", "volcano",
    "mountain", "plateau", "monsoon", "geographical", "coastal", "delta",
  ],
  "History & Culture": [
    "heritage", "archaeolog", "festival", "temple", "monument",
    "independence movement", "freedom fighter", "unesco", "museum",
    "art and culture", "sculpture", "manuscript", "classical dance",
    "literature festival", "national award", "padma", "sahitya akademi",
    "ancient", "medieval",
  ],
  "Social Issues": [
    "women", "child", "caste", "reservation", "education policy",
    "health scheme", "poverty", "literacy", "tribal", "minority",
    "human rights", "gender", "labour", "migrant", "healthcare", "hospital",
    "disease outbreak", "vaccination drive", "hiv", "malnutrition", "school",
    "university", "exam leak", "paper leak", "students protest",
    "domestic violence", "dowry", "child marriage",
  ],
  "Government Schemes": [
    "yojana", "scheme launched", "govt scheme", "government scheme", "abhiyan",
    "pm-kisan", "pm kisan", "ayushman bharat", "jan dhan", "svanidhi", "pmay",
    "ujjwala", "skill india", "startup india", "welfare scheme", "subsidy scheme",
    "mission launched", "pmgsy", "midday meal", "public distribution system",
    "direct benefit transfer", "housing scheme", "insurance scheme",
  ],
};

const REPORT_KEYWORDS = [
  "index", "report released", "annual report", "survey report",
  "ranking", "rankings", "global report", "who report", "world bank report",
  "study finds", "study reveals", "released its report", "census data",
  "cag report", "comptroller and auditor general",
];

const PERSON_KEYWORDS = [
  "minister", "president", "governor", "chief justice", "cji",
  "prime minister", " pm modi", "chairman", "secretary general", " cm ",
  " mla ", " mp ", "commissioner", "director general", "chief secretary",
  "ias officer", "ips officer",
];

const ETHICS_KEYWORDS = ["ethics", "integrity", "moral", "corruption case", "bribery case"];

const HIGH_PRIORITY_SCORE = 3;

export function categorize(title, description) {
  const text = ` ${title} ${description || ""} `.toLowerCase();
  let bestCategory = "Others";
  let bestScore = 0;

  for (const category of Object.keys(KEYWORDS)) {
    let score = 0;
    for (const keyword of KEYWORDS[category]) {
      if (text.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  const bucket = classifyBucket(bestCategory, text);
  const highPriority = bestScore >= HIGH_PRIORITY_SCORE;

  return { category: bestCategory, score: bestScore, bucket, highPriority };
}

export function categorySlug(category) {
  return category.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
}

function classifyBucket(category, lowerText) {
  if (REPORT_KEYWORDS.some((k) => lowerText.includes(k))) return "Reports";
  if (category === "Government Schemes") return "Schemes";
  if (PERSON_KEYWORDS.some((k) => lowerText.includes(k))) return "Persons";
  if (category === "Geography") return "Places";
  if (ETHICS_KEYWORDS.some((k) => lowerText.includes(k))) return "GS IV";
  if (category === "History & Culture") return "GS I";
  if (["Polity", "International Relations", "Social Issues"].includes(category)) return "GS II";
  if (["Economy", "Environment", "Science & Technology"].includes(category)) return "GS III";
  return "Others";
}
