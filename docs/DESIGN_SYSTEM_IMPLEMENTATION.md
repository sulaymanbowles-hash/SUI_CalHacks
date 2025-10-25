# Design System Implementation Summary

## ✅ Completed: Design Tokens System

Created `/web/src/design-tokens.ts` with:

### Color Palette
- **Background**: `canvas` (#061522), `card`, `surface1-3` with consistent opacity overlays
- **Brand**: `primary` (#4DA2FF), `secondary` (#5AE0E5) with hover states
- **Status**: Verified (green), Hot (orange), Upcoming (blue), Used (gray), Listed (amber), Error (red)
- **Text**: 4-level hierarchy (primary, secondary, tertiary, muted)
- **Border**: Default, hover, focus states

### Typography Scale
- Display: 64px (hero headlines)
- H1: 44px, H2: 32px, H3: 24px
- Body: 16px, Small: 14px, Micro: 12px
- Consistent line-heights: 1.1–1.2 for headings, 1.6 for body
- Letter-spacing: tighter for display (-0.02em), normal for body

### Spacing (8pt grid)
- xs: 8px, sm: 12px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px, 4xl: 96px
- Page gutters: 24px desktop, 16px mobile
- Max content width: 1280px

### Border Radius
- sm: 8px, md: 12px, lg: 16px, xl: 20px, 2xl: 24px, full: 9999px
- Cards/menus use `lg`, hero CTAs use `xl`

### Elevation (Shadows)
- 0: none
- 1: Faint (chip hover)
- 2: Card hover (12px blur)
- 3: Modal/sheet (24px blur)
- Glow: Brand-colored shadows for active states

### Motion
- **Duration**: fast (120ms), base (180ms), slow (240ms), slower (320ms)
- **Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)` for smooth, confident feel
- **Spring**: `cubic-bezier(0.34, 1.56, 0.64, 1)` for playful bounces

### Ambient Effects
- **Orb**: 520px radius, 8% opacity, 76px blur with 50s float animation
- **Glow**: 280px radius, 7% opacity, 52px blur with pointer interaction
- **Noise**: Sui glyph watermark at 2.8% opacity

### Icon Sizes
- Inline: 18px, Button: 20px, Button large: 24px, Empty states: 48px

---

## ✅ Completed: Events Marketplace Enhancements

### Sticky Search Bar
- Fixed position after 80px scroll with backdrop blur
- Smooth shadow and border transitions
- Search input with ⌘K hotkey hint
- Proper focus states with brand-colored ring

### Filter System
- **Quick filter chips** with:
  - Count badges showing results ("• 12")
  - Selected state with brand glow and 2px scale
  - Hover states with 120ms transitions
  - "Reset" chip appears when filters are active
- **Result count** display ("38 events")
- **Sort dropdown** right-aligned with chevron icon

### Card Anatomy (Refined)
- **16:9 aspect ratio** with object-fit cover
- **Top-left**: Date pill (month + day in monospace)
- **Top-right**: Verified/Hot badges with proper contrast
- **Gradient overlay** for text legibility (bottom 20%, black/60%)
- **Hover states**:
  - Lift 4px with shadow/2
  - Image scales to 1.03
  - Border alpha +4%
  - Arrow indicator slides in bottom-right
  - "View tickets" CTA bar fades in
- **Low stock indicator**: Progress bar + ⚡ emoji when <15%
- **Loading skeletons** with shimmer animation
- **Empty state** with friendly copy + "Clear filters" action

### Motion & Performance
- **Staggered entrance**: 40ms delay per card, 220ms duration
- **Spring transitions** on filter changes (stiffness 240, damping 28)
- **Prefers-reduced-motion** support:
  - Disables parallax drift
  - Freezes ambient background
  - Removes shimmer effects
  - Keeps fade transitions only

### Ambient Background
- **Aurora orb** with parallax mouse tracking (8px movement range)
- **Proximity glow** follows cursor at 5–8% brightness swing
- **Sui glyph watermark** in lower corners, fades on scroll
- All respects reduced motion preference

---

## 🚧 Next Steps (Priority Order)

### 1. Update MyTickets Page (HIGH PRIORITY)

Apply design tokens to:
- Tab system (Active/Listed/Used/Transfers)
- Ticket card hover states (lift 2px, left rail accent animates in)
- QR drawer with high-contrast mode
- Listing sheet with live split math
- Batch actions sticky footer bar
- Demo wallet banner + mock tickets

**Key interactions to implement**:
```
Row hover: bg +3%, left 2px accent slides in (180ms)
List button: scale 1.02, inner glow on hover
QR modal: backdrop blur 12px, spring entrance
Batch select: checkboxes left, sticky footer slides up from bottom
```

### 2. Create Reusable Components

Extract to `/web/src/components/`:

**Button.tsx** (already exists, needs token upgrade):
```typescript
// Variants: primary, secondary, ghost
// Sizes: sm, md, lg
// States: default, hover (scale 1.02), focus (2px ring), disabled
// Motion: 160ms cubic-bezier
```

**Chip.tsx**:
```typescript
// Selected vs unselected states
// Count badge support
// Hover: bg +6%, scale 1.02
// Icon slot (leading)
```

**Badge.tsx**:
```typescript
// Status variants: verified, hot, upcoming, used, listed
// Size: sm (default), xs
// Icon + text or icon-only
```

**Sheet.tsx**:
```typescript
// Side drawer and bottom sheet (mobile-responsive)
// Backdrop blur + dismiss on outside click
// Spring animation (damping 25, stiffness 300)
// Close button top-right
```

**Toast.tsx**:
```typescript
// Success, error, info variants
// Auto-dismiss after 3.5s
// Slide from bottom-right
// Undo action support for optimistic UI
```

### 3. Organizer Scanner Page

**Scan states to design**:
- Success: Green pulse around frame (320ms), big check, owner info
- Already used: Red pulse, reason + Override CTA
- Invalid: Yellow warning with retry
- Offline: Queue badge, sync on reconnect

**Motion specs**:
```
Scan frame pulse: scale 1.08 → 1.0 over 280ms with spring easing
Success check: slide up + fade in (200ms)
Error shake: translateX(±8px) 3 times over 240ms
```

### 4. Review & Publish Checklist (Organizer)

**3-step timeline design**:
1. Create event (icon: ticket) → "Set up event"
2. Get paid (icon: dollar) → "Set up payouts"  
3. Where to sell (icon: channels) → "Enable channels"

**Row anatomy**:
```
[Icon] [Title + description] [Status chip or CTA button]
Completed: soft green bg (#22C55E20), "Edit" link right
Pending: white/4% bg, primary CTA right
```

**Copy**:
- Active voice: "Set up payouts" not "Payout setup"
- Clear CTAs: "Go live" when all complete
- Demo support: "Test payouts" with instant success

### 5. Global Navigation (Header)

Apply tokens to:
- Nav underline animation (text-hugging, 2px height)
- Account dropdown with proper elevation
- Organizer dropdown menu
- Focus states for keyboard navigation

### 6. Landing Page Hero

**Ambient background**:
- 2 layered auroras + noise
- Slow drift animation (35–50s loop)
- Pointer-reactive vignette (200px falloff)
- Sui watermark at 1–2% opacity

**Hero CTA panel**:
- Faint shimmer on border (hover only)
- Primary button: bg +6%, inner glow, 160ms
- Secondary button: border +4%, bg +3%

---

## 📐 Design Consistency Checklist

### Before shipping any page, verify:

- [ ] All colors use `tokens.colors.*` (no hardcoded hex)
- [ ] Spacing uses `tokens.spacing.*` (8pt grid)
- [ ] Border radius uses `tokens.radius.*` consistently
- [ ] Typography uses `tokens.typography.*` scale
- [ ] Shadows use `tokens.shadow[0-3]` or `tokens.shadow.glow`
- [ ] Motion uses `tokens.motion.duration.*` and `tokens.motion.easing.*`
- [ ] Icons use `tokens.icon.*` sizes
- [ ] Hover states: 180–240ms transitions, scale 1.02 on buttons, lift 2–4px on cards
- [ ] Focus states: 2px outline in brand primary, 2px offset
- [ ] Reduced motion: check `@media (prefers-reduced-motion: reduce)`
- [ ] Contrast: WCAG AA (4.5:1 for text, 3:1 for UI elements)
- [ ] Loading states: skeleton with shimmer or spinner
- [ ] Empty states: icon + title + description + CTA
- [ ] Error states: friendly message + retry action

---

## 🎨 Copy & Tone Guidelines

### Buyer-facing (Events, My Tickets)
- **Verbs over nouns**: "Find a show" not "Event discovery"
- **Clear value**: "From $62" not "Starting at $62.00"
- **Trust signals**: "Counterfeit-proof", "Instant settlement" (tooltip with detail)
- **Time format**: "Fri, Jun 21 • 6:00 PM" (consistent, never shouty)

### Organizer-facing (Console, Scanner)
- **Action-oriented**: "Scan at the door", "Set up payouts", "Go live"
- **Progress-focused**: "2 of 3 complete" with visual timeline
- **Clear outcomes**: "You'll receive $50.24" (specific, not vague)

### Error messages
- **What happened**: "Ticket already used at 6:34 PM"
- **What to do**: "Override check-in" or "View log"
- **Tone**: Calm, not alarming. "No connection" not "ERROR: OFFLINE"

---

## 🚀 Performance Optimizations Applied

1. **Lazy loading**: Event card images with `loading="lazy"`
2. **Dominant color placeholders**: Gradient backgrounds before images load
3. **Backdrop blur limit**: Max 12px to avoid GPU cost
4. **Spring animations**: Use `type: 'spring'` for natural feel, but cap stiffness at 300
5. **IntersectionObserver**: Trigger scroll animations only when in viewport (not yet implemented)
6. **Reduced motion**: Complete override for accessibility
7. **Font preloading**: Display weights preloaded in `index.html` (check if needed)

---

## 📱 Responsive Breakpoints (Already in Tailwind)

- Mobile: < 640px
- Tablet: 640–1024px
- Desktop: > 1024px
- Wide: > 1280px (max content width)

**Grid adjustments**:
- Mobile: 1 column, 16px gutters, 12px gaps
- Tablet: 2 columns, 20px gutters, 16px gaps
- Desktop: 3–4 columns, 24px gutters, 24px gaps

---

## 🔧 Files Modified

- ✅ `/web/src/design-tokens.ts` - NEW: Complete token system
- ✅ `/web/src/pages/Events.tsx` - UPDATED: Applied tokens, sticky bar, refined cards
- 🚧 `/web/src/pages/MyTickets.tsx` - NEEDS: Token application, enhanced interactions
- 🚧 `/web/src/components/Header.tsx` - NEEDS: Token application
- 🚧 `/web/src/pages/Landing.tsx` - NEEDS: Hero ambient background
- 🚧 `/web/src/pages/CheckIn.tsx` - NEEDS: Scan states, token application
- 🚧 `/web/src/pages/AppConsole.tsx` - NEEDS: Checklist timeline, tokens

---

## 🎯 Success Metrics

When complete, you should have:
- **One visual language** across all pages
- **120–240ms transitions** everywhere (no janky 500ms delays)
- **Consistent hover physics**: cards lift 4px, buttons scale 1.02
- **Accessible focus states**: 2px rings, high contrast
- **Reduced motion support** on all animated elements
- **Empty/loading/error states** that feel polished, not apologetic
- **Copy that uses verbs** and speaks clearly to buyers vs organizers
