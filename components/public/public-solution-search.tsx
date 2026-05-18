"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Search, Sparkles } from "lucide-react";
import type { PublicSolution, PublicSolutionAudience } from "@/lib/public-search-data";
import {
  searchPublicSolutions,
  trackPublicSearchEvent,
  type PublicSolutionSearchResponse,
} from "@/lib/public-solution-search";

type SearchChipsProps = {
  chips: string[];
  selectedChip: string;
  onSelect: (chip: string) => void;
  variant?: "hero" | "compact";
};

export function SearchChips({ chips, selectedChip, onSelect, variant = "hero" }: SearchChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Popular public searches">
      {chips.map((chip) => {
        const selected = selectedChip.toLowerCase() === chip.toLowerCase();
        return (
          <button
            key={chip}
            type="button"
            aria-pressed={selected}
            className={
              variant === "compact"
                ? `rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#b7f4ad] ${
                    selected
                      ? "bg-[#14a800] text-white"
                      : "border border-white/14 bg-white/8 text-white/72 hover:border-[#b7f4ad] hover:text-white"
                  }`
                : `min-h-10 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-sm transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#b7f4ad] ${
                    selected
                      ? "border-[#b7f4ad] bg-[#14a800] text-white shadow-[0_10px_30px_rgba(20,168,0,0.24)]"
                      : "border-white/24 bg-black/18 text-white hover:border-[#b7f4ad] hover:bg-white/12"
                  }`
            }
            onClick={() => onSelect(chip)}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}

type PublicSolutionSearchProps = {
  audience: PublicSolutionAudience;
  query: string;
  selectedChip: string;
  helperText: string;
  chips: string[];
  onQueryChange: (query: string) => void;
  onSubmit: (query: string) => void;
  onChipSelect: (chip: string) => void;
};

export function PublicSolutionSearch({
  audience,
  query,
  selectedChip,
  helperText,
  chips,
  onQueryChange,
  onSubmit,
  onChipSelect,
}: PublicSolutionSearchProps) {
  return (
    <div className="mt-7 max-w-[760px]">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold text-[#b7f4ad] backdrop-blur-md">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Smart Solution Finder
        </span>
        <p className="text-sm font-semibold leading-6 text-white/72">{helperText}</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          trackPublicSearchEvent("public_search_submitted", { query, audience });
          onSubmit(query);
        }}
      >
        <label htmlFor="hero-search" className="sr-only">
          Search by clinic problem, department, role, or feature
        </label>
        <div className="flex flex-col overflow-hidden rounded-[26px] bg-white p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:flex-row">
          <div className="flex min-h-14 flex-1 items-center gap-3 px-5">
            <Search className="h-5 w-5 text-[#60705f]" aria-hidden="true" />
            <input
              id="hero-search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") onQueryChange("");
              }}
              placeholder="Search by clinic problem, department, role, or feature"
              className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#181818] outline-none placeholder:text-[#7b8476]"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#14a800] px-9 text-lg font-bold text-white transition hover:bg-[#108a00] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#b7f4ad]"
          >
            Find solutions
          </button>
        </div>
      </form>

      <div className="mt-5">
        <SearchChips
          chips={chips}
          selectedChip={selectedChip}
          onSelect={(chip) => {
            trackPublicSearchEvent("public_search_chip_clicked", { chip, audience });
            onChipSelect(chip);
          }}
        />
      </div>
    </div>
  );
}

type PublicSearchCardProps = {
  solution: PublicSolution;
  onResultClick?: (solution: PublicSolution, cta: "primary" | "secondary") => void;
};

export function PublicSearchCard({ solution, onResultClick }: PublicSearchCardProps) {
  const primaryOutcome = solution.outcomes[0] ?? "Improve clinic operations";
  const roleSummary = solution.roles.slice(0, 3).join(", ");
  const featureSummary = solution.features.slice(0, 3).join(", ");

  return (
    <article className="group flex min-h-[330px] flex-col rounded-[24px] border border-white/12 bg-white/[0.065] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-[#14a800]/80 hover:bg-white/[0.085] hover:shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-[#b7f4ad]/14 px-3 py-1 text-xs font-bold text-[#b7f4ad]">{solution.category}</span>
        <span className="rounded-full border border-white/12 px-3 py-1 text-xs font-bold text-white/68">
          {solution.audience === "clinic-teams" ? "Clinic teams" : solution.audience === "patients" ? "Patients" : "Clinics and patients"}
        </span>
      </div>

      <h3 className="mt-5 text-2xl font-bold leading-tight tracking-normal text-white">{solution.title}</h3>
      <p className="mt-3 flex-1 text-[15px] font-medium leading-7 text-white/66">{solution.description}</p>

      <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 text-sm">
        <p className="text-white/72">
          <span className="font-bold text-white">Used by:</span> {roleSummary}
        </p>
        <p className="text-white/72">
          <span className="font-bold text-white">Helps with:</span> {primaryOutcome}
        </p>
        <p className="line-clamp-2 text-white/52">
          <span className="font-bold text-white/78">Features:</span> {featureSummary}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={solution.path}
          onClick={() => onResultClick?.(solution, "primary")}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#14a800] px-5 text-sm font-bold text-white transition hover:bg-[#108a00] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#b7f4ad]"
        >
          {solution.primaryCta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
        <a
          href="#request-demo"
          onClick={() => onResultClick?.(solution, "secondary")}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-white/18 px-5 text-sm font-bold text-white transition hover:border-[#b7f4ad] hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#b7f4ad]"
        >
          {solution.secondaryCta ?? "Request demo"}
        </a>
      </div>
    </article>
  );
}

type PublicSearchResultsProps = {
  response: PublicSolutionSearchResponse;
  visibleCount: number;
  onShowMore: () => void;
};

export function PublicSearchResults({ response, visibleCount, onShowMore }: PublicSearchResultsProps) {
  const visibleResults = response.results.slice(0, visibleCount);
  const hasMore = response.totalMatches > visibleResults.length;
  const heading =
    response.intent === "popular"
      ? "Explore popular HealTech solutions"
      : response.intent === "fallback"
        ? "We couldn't find an exact match, but these solutions may help."
        : "Recommended solutions";
  const subheading =
    response.intent === "popular"
      ? "Start with the most common ways clinics and patients explore HealTech."
      : response.intent === "fallback"
        ? "Tell us what you want to improve and we can map the right workflow with you."
        : "Based on what you searched for, these HealTech capabilities may be the best fit.";

  return (
    <section id="recommended-solutions" className="-mt-px bg-[#181818] py-16 text-white lg:py-22">
      <div className="mx-auto w-[min(1200px,calc(100%_-_32px))]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#14a800]">Smart Solution Finder</p>
            <h2 className="mt-3 max-w-[780px] text-[32px] font-bold leading-tight tracking-normal text-white md:text-[44px]">
              {heading}
            </h2>
            <p className="mt-3 max-w-[700px] text-base font-semibold leading-7 text-white/58">{subheading}</p>
          </div>
          {response.query.trim() ? (
            <p className="w-fit rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-[#b7f4ad]">
              Search: {response.query}
            </p>
          ) : null}
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleResults.map((result) => (
            <PublicSearchCard
              key={result.item.id}
              solution={result.item}
              onResultClick={(solution) => {
                trackPublicSearchEvent("public_search_result_clicked", {
                  query: response.query,
                  audience: response.audience,
                  resultId: solution.id,
                });
              }}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          {hasMore ? (
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/18 px-6 text-sm font-bold text-white transition hover:border-[#b7f4ad] hover:bg-white/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#b7f4ad]"
              onClick={onShowMore}
            >
              Show more
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          {response.intent === "fallback" ? (
            <a
              href="#request-demo"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-[#181818] transition hover:bg-[#b7f4ad] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#b7f4ad]"
            >
              Tell us about your clinic workflow
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type NavbarPublicSearchProps = {
  audience: PublicSolutionAudience;
  onSubmit: (query: string) => void;
};

export function NavbarPublicSearch({ audience, onSubmit }: NavbarPublicSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();

  const response = useMemo(() => searchPublicSolutions(query, audience, { limit: 5 }), [audience, query]);
  const results = response.results.slice(0, 5);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function submit(value: string) {
    const submittedQuery = value.trim() || query.trim();
    trackPublicSearchEvent("public_search_submitted", { query: submittedQuery, audience });
    onSubmit(submittedQuery);
    setQuery(submittedQuery);
    setOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div ref={rootRef} className="relative hidden xl:block">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Search HealTech
        </label>
        <div className="flex h-12 min-w-[270px] items-center gap-3 rounded-full border border-white/28 bg-white/5 px-5 text-base text-white/82 transition focus-within:border-[#b7f4ad] focus-within:bg-white/8">
          <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
          <input
            id={inputId}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
                setActiveIndex(-1);
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                setActiveIndex((index) => Math.min(index + 1, results.length - 1));
                return;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
                return;
              }
              if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
                event.preventDefault();
                submit(results[activeIndex].item.title);
              }
            }}
            placeholder="Search clinic solutions"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/52"
            role="combobox"
            aria-controls={listId}
            aria-expanded={open}
            autoComplete="off"
          />
        </div>
      </form>

      {open ? (
        <div
          id={listId}
          className="absolute right-0 top-14 z-[70] w-[380px] overflow-hidden rounded-2xl border border-white/12 bg-[#181818] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.34)]"
        >
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/42">Public solutions</div>
          <div role="listbox" aria-label="HealTech public search results">
            {results.map((result, index) => (
              <button
                key={result.item.id}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                className={`w-full rounded-xl px-3 py-3 text-left transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#b7f4ad] ${
                  activeIndex === index ? "bg-white/12" : "hover:bg-white/8"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  trackPublicSearchEvent("public_search_result_clicked", {
                    query,
                    audience,
                    resultId: result.item.id,
                  });
                  submit(result.item.title);
                }}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-white">{result.item.title}</span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[11px] font-bold text-[#b7f4ad]">
                    {result.item.category}
                  </span>
                </span>
                <span className="mt-1 line-clamp-1 block text-xs font-medium leading-5 text-white/55">{result.item.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
