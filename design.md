# GDG AJCE — Unified Design System & Editorial Brand Standard
> Warm storybook on cream paper — a friendly editorial canvas where oversized Inter headlines, Google Labs organic shapes, and paper-cut storybook elements share a sunlit, sticker-soft surface.

**Theme:** Light (Warm Editorial)  
**Canvas:** Cream Paper (`#f5f1e4`)  
**Design Paradigm:** Warm Storybook + Google Labs Organic Geometry  
**Target Platform:** Web (Next.js, Tailwind CSS, Framer Motion)

---

## 1. Design Philosophy & Visual Tenets

The GDG AJCE design system is an illustrated editorial experience built on a warm cream-paper canvas (`#f5f1e4`) rather than harsh digital white or dark grey. It merges Google’s developer spirit with a human, tactile, storybook feel:

1. **Warm Cream Canvas over Stark Digital White:**  
   The entire page rests on `#f5f1e4` (Cream Paper). Content cards lift off the page as `#ffffff` (Pure White) surfaces, creating depth purely through warm-to-cool contrast without heavy artificial drop shadows.

2. **Extreme Inter Display Typography:**  
   Inter is our single-family workhorse. Instead of introducing disjointed serif or display fonts, we push Inter to its expressive limits with extreme scales (96px up to 215px on headlines), compressed line heights (0.82–0.95), and tight letter tracking (`-0.065em` to `-0.04em`).

3. **Sticker-Soft Generous Rounding:**  
   Corners are soft and friendly. Interactive pills and floating headers use `50px` (`rounded-full`), major content and bento cards use `36px` to `50px` radii, and nested list items use `28px`. Hard square corners (0–4px) are strictly forbidden.

4. **Signature Expanding Action Dots:**  
   Every primary CTA button is a `50px` pill equipped with a small embedded circular dot (`w-2.5 h-2.5 rounded-full`) at its trailing edge. When hovered, the action dot expands smoothly, signaling tactile interactivity without jarring background flashes.

5. **Google Labs Organic Shapes & Physics:**  
   Vibrant, mathematically precise organic geometries (Yellow Chamfered Hexagon, Blue Sinusoidal Wavy Rosette, Periwinkle Dome, Orange 4-Lobed Clover, Lime Clover, Coral Torus, Sunshine Daisy, Pink Scallop Cloud) float effortlessly across sections and rest on the interactive physics playground in the footer.

6. **Storybook Atmosphere & 2D Mascot Integration:**  
   Multi-layered pure white paper-cut clouds drift gently across the background, framing our official crystal-clear 2D animated mascot equipped with interactive speech bubbles and greeting cycles.

---

## 2. Color System & Tokens

### Core Color Palette

| Color Name | Hex Value | CSS Variable | Role & Application |
|------------|-----------|--------------|-------------------|
| **Cream Paper** | `#f5f1e4` | `--color-cream-paper` | Base page canvas background; structural foundation for all public pages |
| **Pure White** | `#ffffff` | `--color-pure-white` | Elevated card surfaces, floating nav background, storybook clouds |
| **Sandstone** | `#e0dbce` | `--color-sandstone` | Secondary recessed card tone, inset filters, hover states |
| **Ink Black** | `#2c2e2a` | `--color-ink-black` | Primary headlines, body text, nav labels, hairline strokes |
| **Stone Gray** | `#80827f` | `--color-stone-gray` | Secondary subtitles, metadata, breadcrumbs, inactive tab labels |
| **Hairline Mist** | `#d5d5d4` | `--color-hairline-mist` | Subtle borders, nav dividers, card hairpins (`border-[#d5d5d4]`) |
| **Warm Sand Border** | `#e5e1d5` | `--color-border-warm` | High-polish card borders on pure white cards |

### Chromatic Accents & Google Labs Palette

| Accent Name | Hex Value | CSS Variable | Role & Application |
|-------------|-----------|--------------|-------------------|
| **Fresh Grass** | `#8ed462` | `--color-fresh-grass` | Chapter brand structural accent, status indicators, green card highlights |
| **Coral Pop** | `#ff705d` | `--color-coral-pop` | Primary event CTA button fill (`bg-[#ff705d]`), quote marks, flame accents |
| **Sky Pop** | `#2ba0ff` | `--color-sky-pop` | Action indicator dot fill, link accents, cloud technology highlights |
| **Sunshine Pop** | `#ffd600` / `#f5e211` | `--color-sunshine-pop` | Yellow feature cards, daisy petals, chapter badge highlights |
| **Google Blue** | `#4285F4` | `--color-google-blue` | GDG Code token stroke, tech track badge |
| **Google Green** | `#34A853` | `--color-google-green` | Active live pulse dot, verified checkmarks |
| **Google Red** | `#EA4335` | `--color-google-red` | Urgent announcements, deadline badges |
| **Google Yellow** | `#FBBC04` | `--color-google-yellow` | Trophy icons, podium badges, stars |
| **Periwinkle** | `#95a8fe` | `--color-periwinkle` | Organic floating dome shape |
| **Pink Scallop** | `#ffaff6` | `--color-pink-scallop` | Organic floating cloud shape |
| **Lime Clover** | `#c6eb3d` | `--color-lime-clover` | Organic 4-leaf clover shape |

---

## 3. Typography Scale & Specifications

**Primary Family:** `Inter`, ui-sans-serif, system-ui, -apple-system, sans-serif  
**Monospace Family:** `Roboto Mono`, monospace (used strictly for code snippets, counters, and technical timestamps)

### Type Hierarchy

| Level | Desktop Size | Mobile Size | Weight | Tracking | Leading | Usage |
|-------|--------------|-------------|--------|----------|---------|-------|
| **Display Hero** | `185px–215px` | `96px–145px` | `900` (Black) | `-0.065em` | `0.82` | Home page hero acronym ("GDG AJCE") |
| **Headline Display** | `60px–72px` | `38px–48px` | `500` / `600` | `-0.04em` | `1.05` | Section titles ("Innovation Pathways", "Real Builders") |
| **Section Title** | `32px–40px` | `24px–28px` | `500` | `-0.035em` | `1.15` | Subsection headings, page hero taglines |
| **Card Heading** | `22px–28px` | `18px–20px` | `500` / `600` | `-0.03em` | `1.25` | Bento card titles, modal headings |
| **Subheading** | `18px–20px` | `16px–17px` | `400` / `500` | `-0.02em` | `1.4` | Introductions, lead paragraphs |
| **Body Standard** | `15px–16px` | `14px–15px` | `400` | `normal` | `1.5` | Main body copy, explanations, form text |
| **Body Small** | `13px–14px` | `12px–13px` | `400` / `500` | `normal` | `1.5` | Metadata, card footnotes, author info |
| **Micro / Chip** | `11px–12px` | `10px–11px` | `500` / `600` | `0.02em` | `1.2` | Pill badges, status chips, rank numbers |

---

## 4. Spacing, Shapes & Corner Radii

### Corner Radii Hierarchy

| Token Name | Radius | Applied Elements |
|------------|--------|------------------|
| `radius-full` | `50px` / `9999px` | Floating navigation bar, CTA buttons, status badges, filter chips |
| `radius-bento` | `36px`–`50px` | Bento grid cards, story cards, hero panels, modal containers |
| `radius-card` | `28px`–`32px` | Nested leaderboard items, media items, input containers |
| `radius-md` | `16px`–`20px` | Small preview thumbnails, icon containers |
| `radius-sm` | `10px`–`12px` | Micro code tags, tooltip bubbles |

### Elevation & Surfaces Stack

```
Level 2: Sandstone (#e0dbce) / Inset Sub-Surfaces
   ↑
Level 1: Pure White (#ffffff) / Bento & Feature Cards (36px–50px radii, border: #d5d5d4 / #e5e1d5)
   ↑
Level 0: Cream Paper Canvas (#f5f1e4) (Global Page Background)
```

No heavy fuzzy drop shadows are used (`shadow-[0_2px_12px_rgba(0,0,0,0.02)]` or `shadow-xs` only). Depth is established through the crisp transition from `#f5f1e4` canvas to `#ffffff` elevated surfaces.

---

## 5. Standard Component Patterns

### 1. Floating Pill Navigation Bar
- **Container:** `bg-[#ffffff] border border-[#d5d5d4] rounded-[50px] px-4 sm:px-5 py-2.5`
- **Position:** `sticky top-6 sm:top-8 z-50 max-w-[980px] mx-auto`
- **Nav Links:** `px-4 py-2 rounded-[50px] text-[15px] font-medium text-[#2c2e2a]`
- **Active Link:** `bg-[#f5f1e4] font-semibold text-[#2c2e2a]`

### 2. Action Buttons with Expanding Action Dots
- **Primary CTA (Coral):**
  ```tsx
  <Link
    href="/programs"
    className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-[50px] bg-[#ff705d] hover:bg-[#ee6350] text-[#ffffff] text-[15px] font-medium transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs"
  >
    <span>Explore Events</span>
    <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff] transition-all duration-300 group-hover:scale-125" />
  </Link>
  ```
- **Secondary CTA (White on Cream):**
  ```tsx
  <Link
    href="/about"
    className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-[15px] font-medium border border-[#d5d5d4] hover:border-[#2c2e2a]/30 transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-xs"
  >
    <span>About Us</span>
    <span className="w-2.5 h-2.5 rounded-full bg-[#2ba0ff] transition-all duration-300 group-hover:scale-125" />
  </Link>
  ```
- **Dark Neutral CTA:**
  ```tsx
  <button className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1f201d] text-[#ffffff] text-[15px] font-medium transition-all shadow-xs">
    <span>View Standings</span>
    <span className="w-2.5 h-2.5 rounded-full bg-[#8ed462] transition-all duration-300 group-hover:scale-125" />
  </button>
  ```

### 3. Chapter Pill Badges & Chips
- **Standard Header Chip:**
  ```tsx
  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
    <span className="w-2 h-2 rounded-full bg-[#8ed462]" />
    <span>Google Developer Groups on Campus</span>
  </div>
  ```

### 4. Bento & Story Cards
- **Pure White Bento Card:** `rounded-[36px] bg-[#ffffff] border border-[#e5e1d5] p-7 sm:p-9 shadow-xs`
- **Fresh Grass Card:** `rounded-[36px] bg-[#8ed462] p-7 sm:p-8 text-[#2c2e2a]`
- **Sunshine Yellow Card:** `rounded-[36px] bg-[#ffd600] p-7 sm:p-8 text-[#2c2e2a]`
- **Leaderboard Row:** `p-4 rounded-[28px] bg-[#f5f1e4] hover:bg-[#eae5d7] border border-transparent hover:border-[#d5d5d4] transition-all`

### 5. Form Elements
- **Input / Select:** `w-full bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus:border-[#2c2e2a] rounded-2xl px-4 py-3 text-sm text-[#2c2e2a] outline-none transition-all placeholder-[#80827f]`
- **Textarea:** `w-full bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus:border-[#2c2e2a] rounded-2xl p-4 text-sm text-[#2c2e2a] outline-none transition-all resize-none`

---

## 6. Do's and Don'ts

### Do:
- **Do** maintain `#f5f1e4` cream paper as the canvas across every page.
- **Do** use `rounded-[50px]` for buttons, floating headers, and category chips.
- **Do** use `rounded-[36px]` to `rounded-[50px]` for cards and content containers.
- **Do** include the trailing action indicator dot on primary action buttons.
- **Do** use Inter with tight tracking (`-0.04em` to `-0.065em`) for prominent headlines.
- **Do** contrast white cards against the cream canvas cleanly with subtle hairline borders (`#d5d5d4` / `#e5e1d5`).
- **Do** leverage the Google Labs organic shapes suite (Hexagon, Rosette, Clover, Dome, Donut) as playful visual accents.

### Don't:
- **Don't** introduce dark gray/black backgrounds (`#18191b`, `#0c0c0e`) on public platform pages.
- **Don't** use sharp rectangular corners (`0px`–`4px`) on buttons or cards.
- **Don't** use heavy dark box-shadows (`shadow-2xl`, `shadow-black`); let tonal contrast do the work.
- **Don't** add arbitrary third-party fonts (like geometric serifs) for display headers; Inter carries the full brand.
- **Don't** place white cards directly on white backgrounds; always preserve the cream paper canvas base.

---

## 7. Quick Code Reference

### Tailwind CSS Tokens (`@theme` / Config)

```css
:root {
  --color-cream-paper: #f5f1e4;
  --color-pure-white: #ffffff;
  --color-sandstone: #e0dbce;
  --color-ink-black: #2c2e2a;
  --color-stone-gray: #80827f;
  --color-hairline-mist: #d5d5d4;
  --color-fresh-grass: #8ed462;
  --color-coral-pop: #ff705d;
  --color-sky-pop: #2ba0ff;
  --color-sunshine-pop: #ffd600;
  --font-inter: 'Inter', sans-serif;
  --radius-full: 50px;
  --radius-bento: 36px;
  --radius-card: 28px;
}
```
