# WAIMO Industrial Frontend Refresh

This document tracks the ongoing UI/UX overhaul and serves as the living reference for the new industrial design system. It will grow as additional phases land.

## Guiding Principles

- **Industrial credibility**: deep graphite background, cyan/teal accents, precise typography, subtle grid overlays.
- **Consistency first**: every page pulls from a shared palette, spacing scale, and UI component library.
- **Low-risk delivery**: no backend changes, no new infra. All updates stay within Next.js App Router + existing data sources.

## Phase 1 · Design System & Shell

### Deliverables (completed in this phase)
1. **Global tokens (`globals.css`, `src/lib/theme.ts`)**
   - Color variables (`--color-bg`, `--color-surface`, `--color-primary`, etc.)
   - Radius / shadow / spacing definitions.
   - Base typography + scrollbar styling + helper utility classes.

2. **Utility helpers**
   - `src/lib/utils.ts` provides `cn()` className combiner.
   - `src/lib/theme.ts` exports token map for programmatic usage.

3. **UI component library (`src/components/ui`)**
   - Button, Input, Select, Badge, Card (+header), Table wrappers, Tabs, Modal, Toast, Skeleton, EmptyState.
   - Components lean on CSS variables for palette + radii.

4. **Layout refresh**
   - Marketing + Shop + Admin layouts include industrial gradient, grid overlay, and consistent padding.
   - Navigation header now exposes Products/Categories/About/Contact with industrial branding and improved search bar.
   - Footer restructured with sitemap, certification block, and contact info.
   - Admin header gains control-panel styling, operational badge, and refined nav treatment.

5. **Session-aware top bar**
   - `UserNav` matches the new palette and keeps role-aware links (Admin Dashboard vs. My Inquiries).
   - Logged-out state now uses uppercase CTA for Register.

6. **Documentation seed**
   - This `web.md` describes the new system and will be expanded per phase.

### Quick Verification
- Visit `/` or `/products` to see the new marketing header/footer + background.
- Authentication menu reflects login status and links to the right destination.
- Admin routes load inside the refreshed shell with grid overlay and new header.
- Component library passes lint/typecheck (no runtime usage yet beyond header/footer).

### Risks / Follow-ups
- Additional screens still use legacy styling; upcoming phases will migrate them to the new components.
- Toast/modal primitives exist but are not yet wired into flows (will happen when RFQ + admin actions are modernized).

## Next Phases (upcoming)
1. **Phase 2 – Marketing homepage**: hero, capability cards, trust metrics, CTA sections.
2. **Phase 3 – Product listing**: card grid, facet drawer, chips, standardized imagery.
3. **Phase 4 – Product detail + RFQ**: gallery, specification stack, actionable RFQ form with industrial feedback.
4. **Phase 5 – About/Contact & lead capture** *(in progress)*：新增 `/about` `/contact` 页面、联系人表单直连邮件服务器。
5. **Phase 6 – Account center**: `/my/inquiries` with new table + empty states.
6. **Phase 7 – Admin console**: dashboards/tables/forms leveraging the design system.
7. **Phase 8 – Final QA & documentation**: extend this file with interaction guidelines, testing script, and sign-off checklist.

Stay tuned to this document for updates as each milestone completes.
