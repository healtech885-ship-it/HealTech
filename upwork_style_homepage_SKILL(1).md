# SKILL.md — Upwork-Style Conversion Homepage Builder

## 1. Skill Purpose

Use this skill to build a modern, conversion-focused homepage for any product, service, platform, SaaS, marketplace, agency, directory, clinic system, creator platform, AI tool, or business idea.

The goal is not to copy Upwork visually or legally. The goal is to reproduce the same homepage logic:

- help the visitor understand the offer fast,
- split users by intent,
- reduce uncertainty,
- show trust early,
- guide exploration,
- explain how it works,
- lower pricing/risk anxiety,
- prove outcomes,
- push the visitor toward a high-intent action.

This skill should generate a homepage that feels like a premium marketplace-style landing page: clear, dense, trustworthy, discovery-driven, human, and conversion-oriented.

---

## 2. Core Principle

When building the homepage, do not think of it as a simple brochure page.

Think of it as a conversion journey that answers these questions in order:

1. What is this?
2. Is this for me?
3. Can I trust it?
4. What can I explore here?
5. How do I start?
6. How does it work?
7. What does it cost?
8. Has it worked for others?
9. What should I click now?

Every section must move the user one step closer to action.

---

## 3. Required Inputs

Before generating the homepage, collect or infer these inputs:

```yaml
brand_name: "[Name of the brand/platform]"
product_idea: "[What the website offers]"
primary_audience: "[Main audience/user type]"
secondary_audience: "[Second audience/user type if available]"
primary_outcome: "[Main result the user wants]"
main_problem: "[Pain point the product solves]"
main_solution: "[How the product solves the problem]"
top_use_cases:
  - "[Use case 1]"
  - "[Use case 2]"
  - "[Use case 3]"
  - "[Use case 4]"
  - "[Use case 5]"
  - "[Use case 6]"
trust_signals:
  - "[Client logo, stat, credential, review, award, partner, guarantee]"
pricing_model: "[Free, subscription, commission, tiered plans, pay after milestone, custom quote]"
primary_cta: "[Main action button]"
secondary_cta: "[Secondary action button]"
search_object: "[What the user can search for: talent, products, experts, workflows, doctors, templates, services, jobs, etc.]"
```

If any input is missing, make a reasonable assumption and continue. Do not stop unless the product idea itself is impossible to understand.

---

## 4. Mandatory Homepage Structure

Always build the homepage in this exact strategic order:

1. Announcement Strip
2. Header / Navigation
3. Hero Section
4. Trust Logos / Credibility Bar
5. Category or Use-Case Explorer
6. Contextual Search / Discovery Strip
7. How It Works
8. Pricing / Plans / Risk Reduction
9. Testimonials / Reviews / Outcomes
10. Final CTA
11. Dense Footer

Do not remove sections 2, 3, 5, 7, 8, 9, or 10.

Sections 1, 4, 6, and 11 may be simplified only if the product idea is very small, but they should still exist in some form.

---

## 5. Conversion Architecture

The homepage must follow this conversion flow:

```text
Visitor lands
→ understands the promise
→ chooses their intent/audience
→ searches or browses
→ sees credibility
→ understands the process
→ understands pricing/risk
→ sees proof
→ clicks the main CTA
```

The hero should create intent. The explorer should create relevance. The process section should create confidence. The pricing section should reduce fear. The testimonial section should create belief. The final CTA should capture action.

---

## 6. Section Execution Rules

### 6.1 Announcement Strip

Purpose: Promote one high-value message.

Use it for one of these:

- limited offer,
- premium plan,
- new feature,
- guarantee,
- launch announcement,
- free trial,
- marketplace trust promise.

Rules:

- Full-width strip above the header.
- Short copy only.
- One small CTA link.
- Do not use a large button here.
- Height should feel compact.

Template:

```text
[Short announcement message]. [CTA link]
```

Example patterns:

```text
New: Get matched with verified experts faster. Learn more
Start free today — only pay when you activate your first project. Explore plans
```

---

### 6.2 Header / Navigation

Purpose: Help users orient and route themselves.

Desktop header must include:

- logo,
- primary navigation,
- at least one dropdown/mega-nav style group if the product has multiple categories,
- login link if relevant,
- primary CTA button.

Recommended nav groups:

- Find / Browse / Explore
- Solutions / Categories
- How it works
- Pricing
- Resources
- Enterprise / For Teams
- Log in
- Sign up / Get started

Rules:

- Use a clean white header.
- Keep the logo left.
- Keep auth/CTA actions right.
- Use disclosure-style dropdowns, not complicated hidden menus.
- On mobile, collapse into a dialog or full-screen stacked menu.
- Navigation must be practical, not decorative.

---

### 6.3 Hero Section

Purpose: Explain the value proposition and create immediate intent.

The hero must include:

- eyebrow label,
- strong outcome-focused headline,
- short supporting paragraph,
- audience switch or intent selector,
- search input or primary CTA,
- popular search/use-case chips,
- hero image or product visual.

Hero layout:

- Desktop: two-column split.
  - Left: copy, intent switch, search/CTA.
  - Right: human/product image.
- Mobile: single column.
  - Copy first.
  - Search/CTA second.
  - Image after or hidden if it weakens performance.

Hero headline formula:

```text
[Action/outcome] for [audience] who need [main result]
```

Alternative formula:

```text
Connect with [experts/tools/services] that help you [primary outcome]
```

Supporting copy formula:

```text
Find, compare, and start with [solution] faster — without [main pain/risk].
```

Search placeholder formula:

```text
Search by [use case / service / expert / workflow / category / location]
```

Hero chips:

- 3 to 6 chips.
- Based on popular use cases.
- Short, clickable, and specific.

Examples:

```text
AI automation
Dashboard design
Appointment booking
Fitness coaching
Clinic management
Creator monetization
```

Do not create a vague hero. Do not use generic copy like “We help businesses grow” without specifics.

---

### 6.4 Audience Switch / Intent Selector

Purpose: Let different visitors see themselves quickly.

Use this if there are two sides or two major intents.

Examples:

- I want to hire / I want to work
- I’m a patient / I’m a doctor
- I’m a creator / I’m a fan
- I need a service / I provide a service
- For teams / For individuals
- For buyers / For providers

Rules:

- Place it inside or directly under the hero.
- It can change the headline, CTA, search placeholder, and chips.
- Use tabs only if the content changes in place.
- If it only links elsewhere, use buttons or links, not ARIA tabs.

---

### 6.5 Trust Logos / Credibility Bar

Purpose: Reduce doubt early.

Use any available trust signals:

- client logos,
- partner logos,
- star ratings,
- verified users count,
- press mentions,
- certification badges,
- security/compliance badges,
- case-study metrics.

Rules:

- Place directly after the hero or inside the lower hero area.
- Keep logos muted or monochrome.
- Use 4 to 8 trust items.
- Do not let logos overpower the CTA.
- If no real logos exist, use stat-based trust instead.

Example:

```text
Trusted by teams, creators, and operators building faster workflows
[Logo] [Logo] [Logo] [Logo]
```

---

### 6.6 Category / Use-Case Explorer

Purpose: Let users browse broad solution families.

This section is mandatory.

Use 6 to 10 cards or pills.

Each card must include:

- title,
- short description,
- icon or subtle visual,
- link/action.

Card formula:

```yaml
title: "[Use-case family]"
description: "[What users can achieve here]"
href: "/categories/[slug]"
```

Examples by product type:

For a clinic platform:

- Patient Management
- Doctor Workflow
- Lab Results
- Pharmacy Inventory
- Appointments
- Patient Portal

For a creator platform:

- Paid Communities
- Digital Products
- Memberships
- Live Sessions
- Payouts
- Analytics

For an AI service marketplace:

- AI Agents
- Automation
- Dashboards
- Data Cleaning
- Chatbots
- Integration

Design rules:

- Use a responsive grid.
- Cards should have subtle borders.
- Hover state should show green accent, border, or shadow.
- Keep cards dense but readable.

---

### 6.7 Contextual Search / Discovery Strip

Purpose: Convert broad interest into specific action.

This section should appear after the category explorer.

It should include:

- short section title,
- search input,
- suggestion chips or trending terms.

Replace “skills” depending on the product:

| Product Type | Search Object |
|---|---|
| Marketplace | skills, freelancers, services |
| SaaS | workflows, templates, integrations |
| Clinic | doctors, departments, services |
| Creator platform | creators, memberships, content |
| Fitness platform | coaches, programs, goals |
| E-commerce | products, categories, brands |
| Education | courses, tutors, subjects |

Template:

```text
Find [search_object] by need, category, or goal
```

Rules:

- This search should feel practical.
- Avoid decorative fake search boxes unless the final site will support search.
- If search is not functional, route it to a filtered listing page.

---

### 6.8 How It Works

Purpose: Remove operational uncertainty.

This section is mandatory.

Use 3 to 4 steps.

Recommended structure:

- title,
- short intro,
- optional audience tabs,
- numbered steps,
- supportive image or illustration.

Step formula:

```text
1. Describe what you need
2. Compare relevant options
3. Start safely
4. Track progress or results
```

For non-marketplace products, adapt the logic:

Clinic example:

```text
1. Register or find a patient
2. Create a visit or appointment
3. Complete diagnosis, lab, or pharmacy flow
4. View history and follow-up
```

Creator platform example:

```text
1. Create your page
2. Add memberships or paid content
3. Share your link
4. Track payouts and growth
```

Rules:

- Use concrete verbs.
- Avoid vague steps.
- Mention risk reduction where relevant.
- Use one clear visual per process, not too many illustrations.

---

### 6.9 Pricing / Plans / Risk Reduction

Purpose: Reduce cost anxiety and create a default path.

This section is mandatory.

Use 2 to 3 pricing cards maximum.

Pricing card must include:

- plan name,
- who it is for,
- pricing or fee model,
- 3 to 5 bullets,
- CTA,
- optional badge like “Popular”.

Rules:

- Highlight one recommended plan.
- Avoid overwhelming comparison tables on the homepage.
- Link to a detailed pricing page if needed.
- Mention risk reduction clearly.

Risk reduction examples:

- Start free
- No setup cost
- Pay after activation
- Cancel anytime
- Protected payments
- Transparent pricing
- Manual approval before publishing
- Verified professionals only

Pricing title formulas:

```text
Simple pricing that grows with you
Start free, upgrade when you need more
Only pay after [meaningful milestone]
```

---

### 6.10 Testimonials / Reviews / Outcomes

Purpose: Provide proof.

This section is mandatory.

Use one of these formats:

- quote cards,
- review cards,
- case-study snippets,
- outcome metrics,
- founder/client story cards.

Each testimonial should include:

- quote or result,
- person/company/role,
- relevant category,
- rating or metric if available,
- avatar/logo if available.

Rules:

- Use specific outcomes, not generic praise.
- Use 3 to 6 proof cards.
- Mix emotional trust with measurable results.
- If real testimonials are unavailable, use “example proof cards” clearly marked as placeholder content.

Strong testimonial format:

```text
"[Specific result or transformation]."
— [Name], [Role], [Company/Segment]
Result: [Metric or outcome]
```

---

### 6.11 Final CTA

Purpose: Capture users who needed proof before acting.

Rules:

- Short section.
- One dominant CTA.
- Optional secondary link.
- Restate the core outcome.
- Use stronger contrast than surrounding sections.

CTA headline formula:

```text
Ready to find your next [solution]?
```

Alternative:

```text
Start with [brand] and move from [pain] to [outcome].
```

---

### 6.12 Footer

Purpose: Utility, legitimacy, SEO, and trust.

Footer must include:

- logo,
- short brand description,
- 4 to 5 link columns,
- social links,
- legal links,
- optional app links.

Recommended footer columns:

- For Customers
- For Providers
- Solutions
- Resources
- Company

Rules:

- Footer should be dense.
- Do not make it minimal if the homepage is marketplace-style.
- Include Privacy, Terms, Contact, Help, and Security links.

---

## 7. Visual Style Rules

The homepage should feel:

- clean,
- premium,
- human,
- trustworthy,
- dense but readable,
- discovery-oriented,
- marketplace-like,
- modern and practical.

### 7.1 Color System

Use this approximate palette unless the user provides brand colors:

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #f7f7f7;
  --color-surface-soft: #f2f7f2;
  --color-text: #181818;
  --color-text-muted: #5e6d55;
  --color-border: #d9d9d9;
  --color-brand: #14a800;
  --color-brand-strong: #108a00;
  --color-brand-deep: #13544e;
  --color-focus: #005fcc;
}
```

Rules:

- Use white as the dominant background.
- Use green as the primary action/accent color.
- Use dark green for premium/deep sections.
- Use light grey or soft green for card backgrounds.
- Do not overuse green.
- Reserve strong green for CTAs, active states, badges, and important links.

If the user's brand is not green, preserve the structure and interaction style but replace the accent color with the brand’s primary color.

---

### 7.2 Typography

Use a clean modern sans-serif.

Recommended stack:

```css
font-family: Inter, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

Typography scale:

```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;
--text-4xl: 40px;
--text-5xl: 56px;
--text-6xl: 64px;
```

Rules:

- Hero headline: 48px to 64px desktop, 34px to 42px mobile.
- Section headings: 32px to 44px desktop, 26px to 32px mobile.
- Body text: 16px to 18px.
- Use strong but not overly heavy font weights.
- Use sentence case.
- Keep line-height comfortable.

---

### 7.3 Layout and Spacing

Use a 12-column grid on desktop.

Recommended containers:

```css
.container {
  width: min(1200px, calc(100% - 64px));
  margin-inline: auto;
}
```

Breakpoints:

```text
Mobile: 0–767px
Tablet: 768–1023px
Desktop: 1024–1279px
Wide: 1280px+
```

Spacing:

- Base unit: 8px.
- Card padding: 20px to 32px.
- Section padding: 56px mobile, 88px to 112px desktop.
- Header height: compact but not cramped.
- Hero should feel spacious but not empty.

Rules:

- Use generous white space around hero.
- Use tighter spacing in dense card grids.
- Keep visual hierarchy clear.
- Avoid centered text for everything.
- Left-align most content.

---

### 7.4 Buttons

Primary button:

- pill or rounded shape,
- green fill,
- white text,
- medium-bold label.

Secondary button:

- outline or text link,
- dark text,
- subtle border,
- green hover state.

Button rules:

- CTAs must be obvious.
- Do not create too many competing primary buttons.
- Use one dominant action per section.
- Button labels should be action-based.

Good labels:

- Get started
- Find experts
- Browse services
- Start free
- View pricing
- Join as a provider
- Book a demo

Bad labels:

- Submit
- Click here
- Learn more everywhere

---

### 7.5 Cards

Cards should be:

- clean,
- slightly rounded,
- subtle border,
- soft hover state,
- information-dense.

Recommended CSS:

```css
.card {
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-bg);
  padding: 24px;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.card:hover {
  border-color: var(--color-brand);
  box-shadow: 0 10px 30px rgba(0,0,0,.08);
  transform: translateY(-2px);
}
```

---

### 7.6 Imagery

Use human, task-based imagery when possible.

Preferred image style:

- real people working,
- real environments,
- product in context,
- warm but professional,
- not overly staged,
- not cartoon-heavy,
- not generic corporate stock.

Hero image:

- one large image on desktop,
- rounded corners,
- visible person/task,
- not too busy,
- optimized for performance.

Use image ratios:

- Hero: 2:1 or 4:3 depending on layout.
- Process images: 4:3 or 3:2.
- Avatars: 1:1.

If no images are available:

- use UI mockup cards,
- use abstract but restrained visual panels,
- use screenshots if they clarify the product.

---

## 8. Interaction Rules

### 8.1 Navigation

- Desktop: disclosure/mega-nav.
- Mobile: full-screen or side dialog menu.
- Dropdowns must close on Escape.
- Dropdowns must be keyboard accessible.
- Do not use hover-only navigation.

### 8.2 Search

Search component states:

- idle,
- focused,
- typing,
- suggestions open,
- loading,
- results route,
- error/no results.

Search must include:

- label for accessibility,
- placeholder,
- submit button,
- suggestion chips.

### 8.3 Tabs

Use tabs only when content changes in place.

If each option navigates to another page, use normal links/buttons instead.

### 8.4 Carousels

Avoid carousels unless needed for testimonials or reviews.

If used:

- provide previous/next controls,
- stop autoplay on focus,
- allow keyboard use,
- respect reduced motion.

### 8.5 Motion

Motion should be subtle.

Allowed:

- fade in,
- slight slide,
- hover lift,
- border transition,
- background transition.

Avoid:

- heavy parallax,
- spinning objects,
- distracting animations,
- autoplay motion that cannot be paused.

Respect:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 9. Accessibility Rules

The page must follow WCAG-friendly behavior.

Mandatory:

- semantic HTML,
- one clear H1,
- logical heading order,
- skip link,
- visible focus states,
- keyboard-accessible navigation,
- accessible form labels,
- descriptive alt text,
- sufficient color contrast,
- no color-only meaning,
- responsive text,
- touch targets large enough on mobile.

Do not:

- hide focus outlines,
- use placeholder as the only label,
- trap keyboard in menus,
- use fake buttons with divs,
- use inaccessible custom selects,
- use autoplay carousels without controls.

---

## 10. Performance Rules

Mandatory:

- Do not lazy-load the hero image.
- Use responsive images with `srcset` and `sizes`.
- Use explicit image width and height.
- Lazy-load below-the-fold images.
- Keep initial JavaScript small.
- Avoid heavy animation libraries unless needed.
- Avoid more than 1 to 2 font families.
- Avoid more than 4 font weights.
- Use CSS for simple interactions when possible.

Performance targets:

- LCP under 2.5s.
- CLS under 0.1.
- INP under 200ms.
- Initial JS under 180KB gzipped if possible.
- Above-the-fold requests under 20 if possible.

---

## 11. SEO Rules

Homepage title formula:

```text
[Brand] | [Primary outcome] for [audience]
```

Meta description formula:

```text
Find, compare, and start with [product/service category] faster. Explore [use cases], see pricing, and get started with [brand] today.
```

Mandatory:

- one H1,
- descriptive title,
- useful meta description,
- internal links to major categories,
- crawlable navigation,
- Organization JSON-LD,
- WebSite JSON-LD,
- optimized images,
- meaningful footer links.

Do not:

- title the page “Home”.
- keyword-stuff headings.
- generate fake reviews as real testimonials.
- use FAQ schema unless the FAQ content is real and appropriate.

---

## 12. Content Generation Rules

Copy must be:

- specific,
- direct,
- outcome-focused,
- trustworthy,
- practical,
- non-hypey.

Avoid:

- “revolutionary”
- “game-changing”
- “ultimate solution”
- “best platform ever”
- vague SaaS copy
- generic hero text

Use:

- concrete outcomes,
- clear user actions,
- clear risk reduction,
- trust signals,
- plain English.

Good pattern:

```text
Find verified [solution/provider] for [specific outcome] — compare options, start safely, and track progress in one place.
```

Bad pattern:

```text
We empower businesses with innovative solutions for the future.
```

---

## 13. Required Content Output

When using this skill, output these deliverables in this order:

1. Homepage strategy summary
2. Final sitemap/header nav
3. Section-by-section homepage copy
4. Component structure
5. Design tokens
6. Responsive behavior
7. Accessibility notes
8. SEO metadata
9. Content JSON
10. Implementation prompt for developer/AI builder

If the user asks for code, then output:

- semantic HTML or React/Next.js components,
- CSS/Tailwind styling,
- content JSON,
- accessibility behavior,
- responsive behavior.

---

## 14. Content JSON Schema

Generate homepage content using a structured object like this:

```json
{
  "brand": {
    "name": "[Brand Name]",
    "tagline": "[Short tagline]"
  },
  "announcement": {
    "enabled": true,
    "text": "[Announcement text]",
    "ctaLabel": "[CTA label]",
    "ctaHref": "[CTA URL]"
  },
  "navigation": {
    "logoText": "[Brand]",
    "items": [
      {
        "label": "Explore",
        "type": "dropdown",
        "groups": [
          {
            "title": "Popular categories",
            "links": [
              { "label": "[Category]", "href": "/categories/[slug]" }
            ]
          }
        ]
      },
      { "label": "How it works", "href": "/how-it-works" },
      { "label": "Pricing", "href": "/pricing" },
      { "label": "Resources", "href": "/resources" }
    ],
    "auth": {
      "login": { "label": "Log in", "href": "/login" },
      "signup": { "label": "Get started", "href": "/signup" }
    }
  },
  "hero": {
    "eyebrow": "[Audience or capability label]",
    "headline": "[Outcome-focused headline]",
    "subheadline": "[Short supporting copy]",
    "modes": [
      {
        "id": "primary",
        "label": "[Audience A]",
        "searchPlaceholder": "Search by [object]",
        "primaryCta": { "label": "[CTA]", "href": "[URL]" },
        "popularSearches": ["[Chip 1]", "[Chip 2]", "[Chip 3]"]
      },
      {
        "id": "secondary",
        "label": "[Audience B]",
        "searchPlaceholder": "Search by [object]",
        "primaryCta": { "label": "[CTA]", "href": "[URL]" },
        "popularSearches": ["[Chip 1]", "[Chip 2]", "[Chip 3]"]
      }
    ],
    "image": {
      "src": "/images/hero.webp",
      "alt": "[Descriptive alt text]"
    }
  },
  "trust": {
    "label": "Trusted by",
    "items": [
      { "name": "[Logo/Stat]", "type": "logo" }
    ]
  },
  "categories": {
    "title": "Explore [solution families]",
    "items": [
      {
        "title": "[Category]",
        "description": "[Short description]",
        "href": "/categories/[slug]",
        "icon": "[icon-name]"
      }
    ]
  },
  "contextualSearch": {
    "title": "Find [search object] by need, category, or goal",
    "placeholder": "Search [object]",
    "suggestions": ["[Suggestion 1]", "[Suggestion 2]"]
  },
  "howItWorks": {
    "title": "How it works",
    "steps": [
      {
        "title": "Describe what you need",
        "description": "[Step explanation]"
      },
      {
        "title": "Compare relevant options",
        "description": "[Step explanation]"
      },
      {
        "title": "Start safely",
        "description": "[Step explanation]"
      }
    ]
  },
  "pricing": {
    "title": "Simple pricing that grows with you",
    "plans": [
      {
        "name": "[Plan]",
        "subtitle": "[Who it is for]",
        "price": "[Price/Fee]",
        "featured": false,
        "bullets": ["[Benefit 1]", "[Benefit 2]", "[Benefit 3]"],
        "cta": { "label": "[CTA]", "href": "[URL]" }
      }
    ]
  },
  "testimonials": {
    "title": "Proof from people who used it",
    "items": [
      {
        "quote": "[Quote]",
        "name": "[Name]",
        "role": "[Role]",
        "result": "[Specific result]",
        "rating": 5
      }
    ]
  },
  "finalCta": {
    "headline": "Ready to [primary outcome]?",
    "body": "[Short closing reassurance]",
    "primaryCta": { "label": "[CTA]", "href": "[URL]" },
    "secondaryCta": { "label": "[CTA]", "href": "[URL]" }
  },
  "footer": {
    "columns": [
      {
        "title": "For customers",
        "links": [
          { "label": "[Link]", "href": "[URL]" }
        ]
      }
    ],
    "legal": [
      { "label": "Privacy", "href": "/privacy" },
      { "label": "Terms", "href": "/terms" }
    ]
  }
}
```

---

## 15. Example Mapping Rules by Website Type

### Marketplace

Map like this:

- Audience switch: buyers / providers
- Search: services, experts, skills
- Categories: service categories
- How it works: post need → compare → hire/start → pay safely
- Pricing: commission or service fee
- Trust: verified providers, client logos, reviews

### SaaS Product

Map like this:

- Audience switch: teams / individuals or admins / users
- Search: workflows, integrations, templates
- Categories: feature families
- How it works: connect tools → automate workflow → monitor results
- Pricing: subscription tiers
- Trust: logos, security, uptime, case studies

### Clinic / Healthcare Platform

Map like this:

- Audience switch: patients / staff or doctors / admins
- Search: doctors, departments, services
- Categories: appointments, visits, lab, pharmacy, records
- How it works: register → book/create visit → complete care → follow up
- Pricing: clinic package or subscription
- Trust: privacy, compliance, doctors, patient outcomes

### Creator Platform

Map like this:

- Audience switch: creators / fans
- Search: creators, memberships, content types
- Categories: memberships, live sessions, digital products, payouts
- How it works: create page → add offer → share link → get paid
- Pricing: platform fee or subscription
- Trust: payout reliability, creator earnings, community proof

### Fitness / Coaching Platform

Map like this:

- Audience switch: athletes / coaches
- Search: programs, coaches, goals, sports
- Categories: strength, conditioning, recovery, nutrition, assessment
- How it works: assess → match plan → train → track progress
- Pricing: coaching plans or marketplace fee
- Trust: coach credentials, athlete outcomes, testimonials

---

## 16. Do / Do Not Rules

### Do

- Build a dense but readable homepage.
- Prioritize user intent.
- Include discovery/search behavior.
- Use trust signals early.
- Use human imagery where possible.
- Use a clear pricing/risk section.
- Include proof before the final CTA.
- Use accessible components.
- Generate reusable content data.
- Keep all copy brand-agnostic and original.

### Do Not

- Do not copy Upwork’s exact copy, logo, brand name, or proprietary assets.
- Do not create a thin generic landing page.
- Do not remove the audience/intent logic.
- Do not hide pricing or risk information if the product has a pricing model.
- Do not use fake testimonials as real ones.
- Do not overuse animation.
- Do not make all sections look the same.
- Do not rely only on a hero CTA.
- Do not create inaccessible custom UI components.

---

## 17. Mandatory Final Checklist

Before finalizing the homepage, verify:

```text
[ ] The page has a clear announcement or promotional strip.
[ ] The header has practical navigation and CTA.
[ ] The hero has a strong outcome-focused headline.
[ ] The hero includes audience or intent segmentation.
[ ] The hero includes search, CTA, or both.
[ ] The page includes trust signals near the top.
[ ] The page includes a category/use-case explorer.
[ ] The page includes contextual search or discovery.
[ ] The page explains how it works in 3–4 steps.
[ ] The page includes pricing or risk reduction.
[ ] The page includes testimonials, reviews, or proof.
[ ] The page ends with a strong final CTA.
[ ] The footer is dense and useful.
[ ] The design uses clean typography, green/accent CTAs, and card-based layout.
[ ] The layout is responsive.
[ ] Navigation and forms are keyboard accessible.
[ ] Images are optimized.
[ ] Copy is original and not copied from Upwork.
[ ] The homepage can be adapted to a different business idea.
```

---

## 18. Universal AI Builder Prompt

Use this prompt when giving the skill to another AI builder:

```text
You are a senior product designer, conversion strategist, and frontend architect.

Build a production-ready homepage for the following business idea:

[INSERT BUSINESS IDEA HERE]

Use the attached SKILL.md as your operating rulebook.

Your task:
- Do not copy Upwork branding, copy, logos, or exact visuals.
- Recreate the same conversion architecture and homepage logic.
- Build a homepage that helps users understand the product, choose their intent, search or browse, trust the platform, understand the process, compare pricing/risk, see proof, and click a clear CTA.

Required homepage order:
1. Announcement Strip
2. Header / Navigation
3. Hero Section with audience/intent switch
4. Trust Logos / Credibility Bar
5. Category or Use-Case Explorer
6. Contextual Search / Discovery Strip
7. How It Works
8. Pricing / Plans / Risk Reduction
9. Testimonials / Reviews / Outcomes
10. Final CTA
11. Dense Footer

Output:
1. Homepage strategy
2. Section-by-section copy
3. Content JSON
4. Component structure
5. Design tokens
6. Responsive behavior
7. Accessibility behavior
8. SEO metadata
9. Implementation-ready code or detailed build instructions

Style:
- clean white background
- strong green or brand-colored CTAs
- large modern typography
- card-based discovery sections
- human/product imagery
- dense but readable layout
- premium marketplace feel
- accessible and responsive
```

---

## 19. Final Instruction to the AI

When using this skill, always preserve the logic, not the brand.

The target output should feel like:

```text
A professional conversion-focused marketplace homepage inspired by the structural logic of Upwork, adapted completely to a different business idea.
```

It should never feel like:

```text
A clone of Upwork.
```
