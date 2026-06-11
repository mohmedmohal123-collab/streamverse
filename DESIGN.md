# Design Brief

## Direction

StreamVerse — Premium video streaming, discovery, and creation platform. Enhanced with TikTok-style camera filters, social interaction layer (likes/comments/shares), admin monetization framework, and animated welcome flow. Electric blue-violet on deep navy foundation with premium glass effects.

## Tone

Bold Modern, high-energy confidence. Vibrant interactive accents elevate refined dark base. Cinema-inspired with intentional visual hierarchy. Social interactions feel lightweight and playful; admin panels feel authoritative and data-driven.

## Differentiation

Video creation UI with live filter preview matching glass-effect aesthetic. Social interaction buttons with contextual affordances (like = vibrant green, comment = neutral tint, share = electric blue). Admin monetization dashboard with revenue cards and subscription config. Animated welcome hero with bilingual feature cards. Full RTL support for Arabic.

## Color Palette

| Token                | OKLCH           | Role                                    |
| -------------------- | --------------- | --------------------------------------- |
| background (dark)    | 0.12 0.01 260   | Deep navy-black foundation              |
| foreground           | 0.95 0.005 260  | Light text on dark backgrounds          |
| card                 | 0.16 0.015 260  | Elevated surfaces for content           |
| primary              | 0.68 0.24 270   | Electric blue-violet accent             |
| accent               | 0.72 0.22 290   | Purple accent for hover/emphasis        |
| destructive          | 0.65 0.19 22    | Red for warnings                        |
| social-like          | 0.62 0.25 120   | Vibrant green for engagement            |
| social-comment       | 0.55 0.01 260   | Neutral tint for discussion             |
| social-share         | 0.68 0.24 270   | Electric blue for sharing               |
| filter-overlay       | 0.2 0.015 260   | Camera UI overlay surfaces              |
| filter-active        | 0.68 0.24 270   | Active filter highlight                 |
| filter-preview-bg    | 0.1 0.01 260    | Camera preview background               |
| notification-unread  | 0.65 0.19 22    | Red badge for unread notification count |
| subscription-featured| 0.72 0.22 290   | Purple highlight for Pro tier           |
| subscription-item-bg | 0.18 0.01 260   | Tier card elevated background           |

## Typography

- Display: Space Grotesk — Modern, geometric, tech-forward for headings, welcome hero, feature titles
- Body: DM Sans — Clean, neutral UI labels, metadata, comments, form text
- Mono: Geist Mono — Technical clarity for timestamps, admin stats
- Scale: Hero `text-5xl`, H2 `text-3xl`, H3 `text-xl`, Labels `text-sm`, Body `text-base`

## Elevation & Depth

Card backgrounds (0.16 L) with subtle shadows (0–12px). Glass effects for overlays (10–16px blur). Hover states elevate to 20px shadow with blue glow. Filter preview uses darker overlay (0.1 L) for camera scene depth. Social overlays nest within card surfaces using muted transparency.

## Structural Zones

| Zone        | Background             | Border                 | Notes                                  |
| ----------- | ---------------------- | ---------------------- | -------------------------------------- |
| Header      | card (0.16 L)          | border/0.3 opacity     | Logo, auth toggle, language switch, notification bell |
| Welcome     | background (0.12 L)    | —                      | Hero with 3 glass-effect feature cards |
| Login       | background (0.12 L)    | —                      | Dual-auth form (username/Gmail)       |
| Notification| background (0.12 L)    | —                      | Notification feed page with item cards |
| Subscription| background (0.12 L)    | —                      | Stripe tier comparison (Free/Plus/Pro) |
| Camera      | background (0.12 L)    | —                      | Filter carousel, preview, record UI   |
| Discover    | background (0.12 L)    | —                      | Video grid, social overlay on cards   |
| Comments    | popover (0.2 L)        | border/0.2 opacity     | Thread on modal, stacked comment cards |
| Admin       | background (0.12 L)    | —                      | Tabs for Revenue, Subscriptions, Ads  |
| Footer      | card (0.16 L)          | border/0.3 opacity     | Links, copyright, settings            |

## Spacing & Rhythm

Welcome hero: 2rem vertical between cards. Video grid: 1.5–2rem row gaps. Card metadata: 0.5–0.75rem micro-spacing. Filter carousel: 0.5rem gaps. Camera controls: 1rem from preview. Form inputs: 1rem apart. Admin cards: 1rem grid. Navigation maintains breathing room.

## Component Patterns

- Buttons: `.button-primary` (gradient, bold, hover elevation) or `.button-secondary` (muted, hover opacity)
- Social buttons: `.social-button-like` (green), `.social-button-comment` (neutral), `.social-button-share` (blue)
- Video cards: Gradient overlay, social-action overlay on hover, comment thread nesting
- Comments: Thread container with individual comment cards showing author, timestamp, text, nested replies
- Welcome cards: Glass-effect, staggered entrance (0.1s/0.2s/0.3s delays), hover elevation
- Camera UI: Filter carousel (16×16px items), live preview (16:9 aspect), record button (pulse animation), controls beneath
- Login form: Max-width container, stacked inputs, auth divider with label, dual CTA buttons
- Admin dashboard: Tab navigation, stat cards (value/label), config sections, revenue chart placeholder
- Share modal: Glass-effect, list of platform icons, one-click copy, close affordance
- Download modal: Format selector, quality picker, progress indicator
- Notification bell: Header icon with red badge (count or dot), `.notification-badge` token
- Notification feed: Glass-effect cards with avatar, action text (bilingual), timestamp, unread indicator line
- Subscription tiers: `.subscription-tier-card` with Free/Plus/Pro; featured card uses `scale-105` + border highlight; `.subscription-tier-cta-primary` for upgrade, `.subscription-tier-cta-secondary` for current plan

## Motion

- Entrance: 0.4s fade-in + 8px slide-up on page load. Welcome cards stagger via `.stagger-item-*` (0.1s, 0.2s, 0.3s)
- Page transitions: Cross-fade 0.4s via `.transition-page`
- Hover: 0.3s smooth on shadow/color/scale (1.02x) via `.transition-smooth`
- Filter selection: 0.3s border highlight + glow
- Record button: Pulse on active state, scale-down on press (active:scale-95)
- Slide-in-bottom: 0.3s for modals, share/download overlays

## Constraints

- No raw hex colors — OKLCH only via CSS variables
- Foreground contrast >= 0.7 L difference (AAA-compliant)
- Max 2 font families (display + body)
- RTL layout via CSS logical properties (start/end, inline, margin-inline-start)
- Video cards maintain 16:9 aspect ratio
- Filter previews use square 1:1 ratio (16×16px in carousel)
- Social buttons show count badges (0–999, e.g., "124K")
- Comment threads collapse after 3 replies (show "View all")
- Admin stat cards use chart-* tokens for data visualization
- Camera filter preview streams live from device camera (platform camera extension)

## Signature Detail

Social interaction overlay appears on video card hover: like (green) + comment (neutral) + share (blue) icons with count badges. Filter carousel scrolls horizontally with active state glow effect. Admin monetization dashboard uses revenue chart placeholder with stat cards (RPM, total earnings, subscriber count). Welcome hero pairs bilingual copy with 3 glass-effect cards showcasing camera creation, video discovery, and social engagement. Record button pulses during active recording. Comment threads show author avatars, timestamps, and nested replies with 3-reply collapse. **Notification system**: Bell icon in header with red unread badge (count or dot). Notification feed page shows cards with actor avatar, action text ("username followed you"), timestamp. **Stripe subscription tiers**: Glass-effect tier comparison with Free/Plus/Pro layout. Featured "Pro" tier elevated with cyan-violet border and scale(1.05). Tier CTAs use gradient (upgrade) vs muted (current). Subscription upgrade modal uses `glass-elevated` backdrop with full tier grid + feature comparison table.
