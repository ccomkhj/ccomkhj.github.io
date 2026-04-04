# Site Improvement Suggestions

**Site**: ccomkhj.github.io ("pile of thoughts")
**Date**: 2026-04-04
**Current State**: Jekyll + Minimal Mistakes with Windows 95 retro theme, 107 posts, terminal search, tabbed about page

---

## High Priority

### 1. Performance & Loading Speed
- **Issue**: Multiple custom CSS files (6+) loaded separately; no CSS bundling or minification for custom styles
- **Suggestion**: Bundle `custom.css`, `window-theme.css`, `about.css`, `portfolio.css`, `post-grid.css`, `terminal.css` into one minified file
- **Impact**: Fewer HTTP requests, faster page load

### 2. SEO & Discoverability
- **Issue**: Analytics disabled, no structured data (JSON-LD), no Open Graph images per post, masthead title set to empty string
- **Suggestion**:
  - Enable analytics (Google Analytics or Plausible for privacy)
  - Add JSON-LD structured data for blog posts
  - Set meaningful `og:image` per post (or auto-generate)
  - Add a proper site title in masthead or restore it for SEO
- **Impact**: Better search engine ranking and social sharing previews

### 3. Broken/Placeholder Social Links
- **Issue**: Twitter, Facebook, Instagram links in `_config.yml` appear to be placeholders (not real profile URLs)
- **Suggestion**: Remove placeholders or replace with actual profiles
- **Impact**: Avoids dead links in author sidebar

### 4. Mobile Experience
- **Issue**: Windows 95 UI elements (title bars, beveled borders, menu bars) can feel cramped on small screens
- **Suggestion**: Simplify or hide decorative chrome (title bars, status bars) on mobile viewports
- **Impact**: Better readability and usability on phones

---

## Medium Priority

### 5. Dark Mode Support
- **Issue**: No dark mode option; the Windows 95 theme is light-only
- **Suggestion**: Add a toggle (perhaps a "Display Properties" dialog, staying in theme) for a darker palette
- **Impact**: Better reading experience in low-light conditions

### 6. Post Navigation & Discovery
- **Issue**: No "previous/next post" navigation within posts; related posts exist but are auto-generated
- **Suggestion**:
  - Add prev/next post links at bottom of each post
  - Consider manual "related posts" curation for key articles
  - Add a "popular posts" or "featured posts" section on homepage
- **Impact**: Better content discovery, longer session duration

### 7. RSS Feed & Newsletter
- **Issue**: RSS feed plugin is enabled but not prominently linked
- **Suggestion**: Add visible RSS icon in navigation or footer; consider adding email subscription option
- **Impact**: Enables readers to follow updates

### 8. Comments System
- **Issue**: Comments are disabled (`provider: false`) despite `comments: true` in post defaults
- **Suggestion**: Enable a lightweight system (Giscus for GitHub-based comments, or Utterances) -- fits the developer audience
- **Impact**: Reader engagement and feedback

### 9. Accessibility (a11y)
- **Issue**: Small pixel fonts, low contrast in some areas (gray on gray for Windows 95 chrome), scanline overlay on terminal may cause readability issues
- **Suggestion**:
  - Increase minimum font size to 14px
  - Ensure WCAG AA contrast ratios (4.5:1 for text)
  - Add `aria-label` attributes to decorative UI elements
  - Make terminal searchable without animation for users who prefer reduced motion
- **Impact**: Inclusive for all visitors

### 10. Content Organization / Taxonomy
- **Issue**: Posts span many topics (philosophy, tech, Korean, German, personal) without clear categorization beyond tags
- **Suggestion**:
  - Create 3-5 top-level categories (e.g., "Engineering", "Reflections", "Notes")
  - Add category-based navigation or filtering on the writings page
  - Consider series/collection grouping for multi-part content
- **Impact**: Easier for readers to find content they care about

---

## Low Priority (Nice-to-Haves)

### 11. 404 Page
- **Issue**: No custom 404 page found
- **Suggestion**: Create a themed 404 page (Windows 95 "program not found" dialog style)
- **Impact**: Better UX for broken links, stays on-brand

### 12. Sitemap & robots.txt
- **Issue**: jekyll-sitemap plugin present, but no custom robots.txt seen
- **Suggestion**: Add robots.txt to ensure proper crawling; exclude docs/ theme documentation from indexing
- **Impact**: Prevents search engines from indexing theme docs as your content

### 13. Image Optimization
- **Issue**: Images in `/img/` appear to be full-resolution
- **Suggestion**: Add WebP conversion, lazy loading (`loading="lazy"`), and srcset for responsive images
- **Impact**: Faster page loads, lower bandwidth

### 14. Print Stylesheet
- **Issue**: No print-specific styles
- **Suggestion**: Add `@media print` rules to hide navigation chrome and show clean article text
- **Impact**: Better experience for readers who print articles

### 15. Favicon
- **Issue**: Logo exists but unclear if proper favicon set (multiple sizes for different devices)
- **Suggestion**: Generate full favicon set (16x16, 32x32, apple-touch-icon, etc.) from the H logo
- **Impact**: Professional appearance in browser tabs and bookmarks

---

## Summary

| Priority | Count | Theme |
|----------|-------|-------|
| High | 4 | Performance, SEO, broken links, mobile |
| Medium | 6 | Dark mode, navigation, RSS, comments, a11y, taxonomy |
| Low | 5 | 404 page, robots.txt, images, print, favicon |

The site has a strong visual identity (Windows 95 theme is distinctive and memorable) and solid content. The biggest wins would come from **performance bundling**, **SEO improvements**, and **mobile UX polish**.
