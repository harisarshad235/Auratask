---
name: agentic-seo
description: "Comprehensive autonomous agentic SEO strategy and implementation skill. Covers technical SEO, programmatic SEO, dynamic metadata, OpenGraph/Twitter social cards, JSON-LD structured data (schema.org), Core Web Vitals optimization, canonical URLs, semantic HTML hierarchy, sitemaps, robots.txt, multilingual hreflang, content discoverability for LLMs/search AI (GEO / Generative Engine Optimization), and automated SEO audits."
---

# Agentic SEO Skill

Comprehensive strategy, engineering patterns, and audit workflows for state-of-the-art Search Engine Optimization (SEO) and Generative Engine Optimization (GEO).

## Table of Contents
1. [Core Pillars & Mental Model](#core-pillars--mental-model)
2. [Technical SEO & Crawl Architecture](#technical-seo--crawl-architecture)
3. [Metadata & Social Card Specifications](#metadata--social-card-specifications)
4. [Structured Data (JSON-LD & Schema.org)](#structured-data-json-ld--schemaorg)
5. [Generative Engine Optimization (GEO / Search AI Readiness)](#generative-engine-optimization-geo--search-ai-readiness)
6. [Core Web Vitals & Performance Engineering](#core-web-vitals--performance-engineering)
7. [Automated SEO Audit Checklist](#automated-seo-audit-checklist)

---

## 1. Core Pillars & Mental Model

Modern SEO requires a dual-track approach:
- **Traditional Search Engines (Google, Bing)**: Rely on crawl efficiency, semantic markup, canonical architecture, fast performance (Core Web Vitals), and rich schema.
- **Generative Engines & LLM Search (ChatGPT Search, Perplexity, Google AI Overviews)**: Rely on direct citation readiness, entity authority, structured summaries, and machine-extractable facts.

When designing or optimizing pages, always follow the **C-S-M-P Framework**:
1. **Crawl & Indexability**: Can Googlebot and AI crawlers find, parse, and understand the page?
2. **Semantics & Hierarchy**: Is the document structured with a strict heading hierarchy (`h1` -> `h2` -> `h3`), landmarks, and schema?
3. **Metadata & Distribution**: Do title, description, OpenGraph, and Twitter tags maximize CTR?
4. **Performance & Vitals**: Does the page achieve near-perfect LCP (<2.5s), INP (<200ms), and CLS (<0.1)?

---

## 2. Technical SEO & Crawl Architecture

### Canonical URLs
Every page must have an explicit self-referential canonical URL to prevent duplicate content penalties from URL query parameters, tracking tags, and casing.

```html
<link rel="canonical" href="https://example.com/current-page" />
```

### Robots.txt Configuration
Serve `robots.txt` from the site root:

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml
```

### Dynamic & Static Sitemaps
Sitemap XML files should list canonical URLs with accurate `lastmod` dates:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-10-12T00:00:00+00:00</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/features</loc>
    <lastmod>2026-10-10T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 3. Metadata & Social Card Specifications

### Recommended Meta Tags Template

```html
<!-- Primary Meta Tags -->
<title>Product Name — Clear, Concise 50-60 Char Value Proposition</title>
<meta name="title" content="Product Name — Clear, Concise 50-60 Char Value Proposition" />
<meta name="description" content="Engaging 140-160 character description highlighting key benefits, core features, and a clear call-to-action for higher search CTR." />
<meta name="keywords" content="keyword1, keyword2, keyword3" />
<meta name="author" content="Company or Author Name" />
<meta name="robots" content="index, follow" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com/page" />
<meta property="og:title" content="Engaging Open Graph Title" />
<meta property="og:description" content="Engaging social sharing preview description." />
<meta property="og:image" content="https://example.com/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Site Name" />

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://example.com/page" />
<meta name="twitter:title" content="Engaging Twitter Card Title" />
<meta name="twitter:description" content="Engaging Twitter preview summary." />
<meta name="twitter:image" content="https://example.com/og-image.jpg" />
<meta name="twitter:creator" content="@handle" />
```

### Best Practices:
- **Title Length**: 50–60 characters (avoid truncation in Google SERPs).
- **Description Length**: 140–160 characters.
- **OG Images**: Standard 1200 x 630 px (1.91:1 ratio), keep key text within safe margins.

---

## 4. Structured Data (JSON-LD & Schema.org)

Always output JSON-LD in `<script type="application/ld+json">`.

### SaaS / Web Application Schema
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Takt",
  "operatingSystem": "All",
  "applicationCategory": "ProductivityApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Minimalist high-efficiency productivity and task tracking tool."
}
</script>
```

### Organization & WebSite Schema with SearchAction
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Takt",
  "url": "https://takt.harisarshad.site",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://takt.harisarshad.site/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

### FAQ Schema (High Visibility Snippets)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Takt?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Takt is a streamlined workflow management suite designed for speed and clarity."
      }
    }
  ]
}
</script>
```

---

## 5. Generative Engine Optimization (GEO / Search AI Readiness)

LLMs and conversational search engines (Perplexity, Google AI Overviews, SearchGPT) index and extract answers differently from traditional crawlers:
1. **Direct Answer Paragraphs**: Place an authoritative, self-contained summary in the first 50–100 words under key headings.
2. **Definitive Terminology & Stats**: Use quantitative facts, source citations, and clear nouns rather than marketing fluff.
3. **Structured Q&A Sections**: Incorporate clear question headers (`<h2>How does X work?</h2>`) followed by step-by-step numbered procedures.
4. **Tables and Comparison Matrices**: LLMs cite Markdown and HTML tables with extraordinarily high frequency.

---

## 6. Core Web Vitals & Performance Engineering

Search engines directly rank based on speed and visual stability:
- **Largest Contentful Paint (LCP) < 2.5s**:
  - Preload hero images: `<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />`
  - Inline critical CSS.
  - Defer non-critical JavaScript.
- **Interaction to Next Paint (INP) < 200ms**:
  - Keep main thread execution short.
  - Break long JavaScript tasks with `requestAnimationFrame` or `setTimeout(..., 0)`.
- **Cumulative Layout Shift (CLS) < 0.1**:
  - Always set explicit `width` and `height` attributes on `<img>` and video tags.
  - Reserve space for dynamic banners and ads.
  - Use `font-display: swap` with matched fallback metrics.

---

## 7. Automated SEO Audit Checklist

When reviewing any page or application:
- [ ] Single `<h1>` tag present on the page.
- [ ] Heading hierarchy unbroken (`h1` -> `h2` -> `h3`, no skipped levels).
- [ ] Descriptive `<title>` tag under 60 characters.
- [ ] Meta `<meta name="description">` under 160 characters.
- [ ] Canonical URL tag present and absolute.
- [ ] `robots.txt` accessible and permits crawlers.
- [ ] Open Graph (`og:title`, `og:image`, `og:url`, `og:description`) and Twitter card tags verified.
- [ ] Valid JSON-LD Schema markup present with zero syntax errors.
- [ ] All `<img>` tags have descriptive, non-empty `alt` attributes.
- [ ] All links have meaningful anchor text (no generic "Click here" or "Read more").
- [ ] No broken links (404/500 errors).
- [ ] Mobile-responsive layout tested across viewport breakpoints.
