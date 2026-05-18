import {
  FALLBACK_PUBLIC_SEARCH_IDS,
  POPULAR_PUBLIC_SEARCH_IDS,
  PUBLIC_SOLUTIONS,
  type PublicSolution,
  type PublicSolutionAudience,
} from "./public-search-data.ts";

export type PublicSearchIntent = "matched" | "popular" | "fallback";

export type PublicSolutionSearchResult = {
  item: PublicSolution;
  score: number;
  matchedFields: string[];
};

export type PublicSolutionSearchResponse = {
  query: string;
  audience: PublicSolutionAudience;
  intent: PublicSearchIntent;
  results: PublicSolutionSearchResult[];
  totalMatches: number;
};

export type PublicSearchEventName =
  | "public_search_submitted"
  | "public_search_result_clicked"
  | "public_search_chip_clicked"
  | "public_search_tab_changed";

export type PublicSearchEventPayload = {
  query?: string;
  audience?: PublicSolutionAudience;
  resultId?: string;
  chip?: string;
};

const synonymGroups = [
  ["doctor", "physician", "consultant", "clinician"],
  ["reception", "front desk", "check in", "queue"],
  ["appointment", "booking", "schedule", "calendar", "visit"],
  ["lab", "laboratory", "test", "blood test", "results", "investigations"],
  ["pharmacy", "medication", "medicine", "drugs", "prescription", "refill"],
  ["billing", "payment", "invoice", "finance", "price", "cost"],
  ["patient file", "medical record", "patient profile", "history", "patient record"],
  ["AI", "assistant", "automation", "agent", "summarize", "chatbot"],
  ["follow up", "reminder", "revisit", "next visit"],
  ["security", "permissions", "roles", "access", "audit", "compliance"],
  ["demo", "contact", "sales", "meeting", "walkthrough", "trial"],
  ["pricing", "price", "plan", "cost", "subscription"],
];

const synonymLookup = new Map<string, string[]>();

for (const group of synonymGroups) {
  const normalizedGroup = group.map(normalizeSearchText);
  for (const term of normalizedGroup) {
    synonymLookup.set(term, normalizedGroup);
  }
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function containsTerm(value: string, term: string) {
  if (!value || !term) return false;
  if (term.includes(" ")) return value === term || value.includes(term);

  return value.split(" ").some((word) => {
    if (word === term) return true;
    if (term.length >= 5 && (word.startsWith(term) || term.startsWith(word))) return true;
    if (term.length >= 4 && (word === `${term}s` || `${word}s` === term)) return true;
    return false;
  });
}

function expandQuery(query: string) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const tokens = normalized.split(" ");
  const expansions = [normalized, ...tokens];

  for (const [term, synonyms] of synonymLookup.entries()) {
    if (containsTerm(normalized, term) || tokens.includes(term)) {
      expansions.push(...synonyms);
    }
  }

  return unique(expansions);
}

function getPopularSolutions(audience: PublicSolutionAudience) {
  return POPULAR_PUBLIC_SEARCH_IDS.map((id) => PUBLIC_SOLUTIONS.find((item) => item.id === id))
    .filter((item): item is PublicSolution => Boolean(item))
    .sort((left, right) => audienceScore(right, audience) - audienceScore(left, audience))
    .map((item, index) => ({ item, score: 100 - index, matchedFields: ["popular"] }));
}

function getFallbackSolutions(audience: PublicSolutionAudience) {
  return FALLBACK_PUBLIC_SEARCH_IDS.map((id) => PUBLIC_SOLUTIONS.find((item) => item.id === id))
    .filter((item): item is PublicSolution => Boolean(item))
    .sort((left, right) => audienceScore(right, audience) - audienceScore(left, audience))
    .map((item, index) => ({ item, score: 50 - index, matchedFields: ["suggested"] }));
}

function audienceScore(item: PublicSolution, audience: PublicSolutionAudience) {
  if (item.audience === audience) return 120;
  if (item.audience === "both") return 34;
  return -80;
}

function scoreTextField(value: string, query: string, terms: string[], exactWeight: number, startsWeight: number, includesWeight: number) {
  const normalized = normalizeSearchText(value);
  let score = 0;

  if (!normalized) return score;
  if (normalized === query) score += exactWeight;
  if (normalized.startsWith(query)) score += startsWeight;
  if (normalized.includes(query)) score += includesWeight;

  for (const term of terms) {
    if (term === query) continue;
    if (normalized === term) score += Math.round(exactWeight * 0.35);
    else if (normalized.startsWith(term) && term.length >= 5) score += Math.round(startsWeight * 0.3);
    else if (containsTerm(normalized, term)) score += Math.round(includesWeight * 0.25);
  }

  return score;
}

function scoreListField(values: string[], query: string, terms: string[], exactWeight: number, includesWeight: number) {
  return values.reduce((score, value) => score + scoreTextField(value, query, terms, exactWeight, 0, includesWeight), 0);
}

function scoreSolution(item: PublicSolution, query: string, terms: string[], audience: PublicSolutionAudience) {
  const matchedFields = new Set<string>();
  let score = 0;

  const fields: Array<[string, number]> = [
    ["title", scoreTextField(item.title, query, terms, 120, 90, 70)],
    ["keywords", scoreListField(item.keywords, query, terms, 42, 26)],
    ["tags", scoreListField(item.tags, query, terms, 38, 22)],
    ["departments", scoreListField(item.departments, query, terms, 38, 22)],
    ["roles", scoreListField(item.roles, query, terms, 38, 22)],
    ["features", scoreListField(item.features, query, terms, 34, 20)],
    ["outcomes", scoreListField(item.outcomes, query, terms, 28, 16)],
    ["category", scoreTextField(item.category, query, terms, 32, 24, 18)],
    ["description", scoreTextField(item.description, query, terms, 24, 0, 14)],
  ];

  for (const [field, fieldScore] of fields) {
    if (fieldScore > 0) {
      score += fieldScore;
      matchedFields.add(field);
    }
  }

  if (score > 0) {
    score += audienceScore(item, audience);
  }

  return { score, matchedFields: [...matchedFields] };
}

export function searchPublicSolutions(
  rawQuery: string,
  audience: PublicSolutionAudience,
  options: { limit?: number; includeAllMatches?: boolean } = {},
): PublicSolutionSearchResponse {
  const query = normalizeSearchText(rawQuery);
  const limit = options.limit ?? 6;

  if (!query) {
    const results = getPopularSolutions(audience).slice(0, limit);
    return { query: rawQuery, audience, intent: "popular", results, totalMatches: results.length };
  }

  const terms = expandQuery(query);
  const matches = PUBLIC_SOLUTIONS.map((item) => {
    const { score, matchedFields } = scoreSolution(item, query, terms, audience);
    return { item, score, matchedFields };
  })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title));

  const strongMatches = matches.filter((result) => result.score >= 18);

  if (strongMatches.length === 0) {
    const results = getFallbackSolutions(audience).slice(0, limit);
    return { query: rawQuery, audience, intent: "fallback", results, totalMatches: results.length };
  }

  const results = (options.includeAllMatches ? strongMatches : strongMatches.slice(0, limit));
  return { query: rawQuery, audience, intent: "matched", results, totalMatches: strongMatches.length };
}

export function trackPublicSearchEvent(_name: PublicSearchEventName, _payload: PublicSearchEventPayload = {}) {
  void _name;
  void _payload;
  return;
}
