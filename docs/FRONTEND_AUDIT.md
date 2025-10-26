# Frontend Comprehensive Audit & Optimization

## ✅ Fixed Issues

### Routing
- ✅ Landing page "Browse Events" button now routes to `/events` (was `/app`)
- ✅ Event cards in marketplace row are now clickable links to `/events`
- ✅ Removed `.toFixed(2)` from prices per design spec (show `$62` not `$62.00`)

### QR Code Generation
- ✅ Created `/utils/qrcode.ts` utility with:
  - `generateTicketQRData()` - Creates deep links (dropkit://ticket/{id})
  - `parseTicketQRData()` - Parses QR data back to ticket info
  - `generateVerificationUrl()` - Creates check-in URLs for organizers
- ✅ Installed `qrcode.react` package

---

## 🔍 Issues Found & Fixes Needed

### 1. MyTickets Page - QR Code Implementation

**Current State**: QR modal shows placeholder icon
**Fix Needed**: Integrate real QR code generation

```tsx
import { QRCodeSVG } from 'qrcode.react';
import { generateTicketQRData } from '../utils/qrcode';

// In QR Modal:
<QRCodeSVG
  value={generateTicketQRData({
    ticketId: ticket.id,
    ownerAddress: currentAddress(),
    serialNumber: ticket.serialNumber
  })}
  size={256}
  level="H"
  includeMargin={true}
  bgColor="#FFFFFF"
  fgColor="#000000"
/>
```

**Priority**: HIGH - Core feature

---

### 2. Events Page - Missing Event Detail Integration

**Current State**: Event detail sheet is basic, no actual purchase flow
**Fix Needed**: 
- Connect to real event data from RPC
- Implement actual purchase PTB (Programmable Transaction Block)
- Add loading states during transaction
- Show success with confetti + redirect to My Tickets

**Priority**: HIGH

---

### 3. Header Navigation - Active State Issues

**Current State**: Active underline animation doesn't work on `/events` route
**Fix Needed**: Update `VISITOR_NAV` href check logic to handle root routes

```tsx
const activeIndex = VISITOR_NAV.findIndex((n) => {
  if (n.href === '/events' && location.pathname === '/events') return true;
  return location.pathname.startsWith(n.href) && n.href !== '/';
});
```

**Priority**: MEDIUM

---

### 4. Performance Optimizations Needed

#### Image Loading
- [ ] Add blur-up placeholders for event posters
- [ ] Implement image optimization with proper srcset
- [ ] Lazy load images below fold with IntersectionObserver

#### Bundle Size
- [ ] Code-split routes with React.lazy()
- [ ] Defer non-critical animations
- [ ] Remove unused Framer Motion imports

#### Network Requests
- [ ] Debounce search input (300ms)
- [ ] Cache filter results in sessionStorage
- [ ] Prefetch /events data on landing page hover

**Priority**: MEDIUM

---

### 5. Accessibility Issues

#### Keyboard Navigation
- [ ] Events cards need proper focus states (currently missing)
- [ ] Filter chips need Enter/Space key handlers
- [ ] Modal close needs Escape key handler
- [ ] Add skip-to-content link

#### ARIA Labels
- [ ] QR button needs `aria-label="Show QR code for ticket"`
- [ ] Filter chips need `aria-pressed` state
- [ ] Search input needs `role="search"`
- [ ] Loading skeletons need `aria-busy="true"`

#### Contrast
- [ ] Verify all text meets WCAG AA (4.5:1)
- [ ] Check badge text on colored backgrounds
- [ ] Ensure focus rings are visible on all browsers

**Priority**: HIGH (legal compliance)

---

### 6. Error Handling & Edge Cases

#### Network Errors
- [ ] Show toast when RPC call fails
- [ ] Offline detection with banner
- [ ] Retry logic for failed transactions
- [ ] Queue actions when offline (check-ins)

#### Empty States
- ✅ Events page has empty state
- [ ] MyTickets needs per-tab empty states with CTAs
- [ ] Search "no results" should suggest similar events

#### Loading States
- ✅ Events has skeletons
- [ ] MyTickets needs loading skeletons
- [ ] Transaction pending states need spinners
- [ ] Optimistic UI for list/unlist actions

**Priority**: HIGH

---

### 7. Mobile Responsiveness Issues

#### Touch Targets
- [ ] Ensure all buttons are min 44x44px (iOS guidelines)
- [ ] Increase padding on mobile for easier tapping
- [ ] Add safe-area-inset for iPhone notch

#### Layout
- [ ] Test sticky header on iOS Safari (address bar behavior)
- [ ] Verify modal sheets slide from bottom on mobile
- [ ] Check horizontal scroll on filter chips (add snap scroll)

#### Performance
- [ ] Test on slower devices (3G throttling)
- [ ] Reduce animation complexity on mobile
- [ ] Lazy load images more aggressively

**Priority**: MEDIUM

---

### 8. Design Tokens Application

#### Pages Not Using Tokens
- [ ] `Header.tsx` - Still has hardcoded colors
- [ ] `MyTickets.tsx` - Needs token application
- [ ] `CheckIn.tsx` - Needs full redesign with tokens
- [ ] `AppConsole.tsx` - Needs token application

#### Components Not Using Tokens
- [ ] `Button.tsx` - Needs variant system with tokens
- [ ] `Card.tsx` - Apply spacing/radius tokens
- [ ] `Scanner.tsx` - Apply status color tokens

**Priority**: MEDIUM

---

### 9. Copy & Microcopy Issues

#### Inconsistent Terminology
- [ ] "Scan ticket" vs "Check in" - pick one
- [ ] "Buy" vs "Purchase" - be consistent
- [ ] "Resell" vs "List for sale" - pick one

#### Missing Tooltips
- [ ] "Verified" badge needs tooltip explaining what it means
- [ ] "Hot" badge needs explanation
- [ ] Network fee needs breakdown tooltip
- [ ] Royalty percentages need explanations

#### Error Messages
- [ ] Generic "Failed to load" should say why
- [ ] "Transaction failed" needs retry CTA
- [ ] "Wallet not connected" should offer to connect

**Priority**: LOW (polish)

---

### 10. Security & Validation

#### Input Validation
- [ ] Price input in listing sheet needs min/max validation
- [ ] Search query should sanitize XSS
- [ ] QR scanner should validate format before checking in

#### Transaction Safety
- [ ] Show transaction simulation before signing
- [ ] Warn on high network fees
- [ ] Confirm destructive actions (unlist, transfer)

**Priority**: HIGH

---

## 🚀 Quick Wins (Do First)

1. **QR Code Integration** (30 min)
   - Import QRCodeSVG in MyTickets
   - Replace placeholder with real QR
   - Add download QR button

2. **Fix Navigation Active States** (15 min)
   - Update Header.tsx activeIndex logic
   - Test all routes

3. **Add Keyboard Navigation** (45 min)
   - Escape closes modals
   - Enter/Space on chips
   - Tab order verification

4. **Error Boundaries** (30 min)
   - Wrap each route in ErrorBoundary
   - Show friendly error UI with retry

5. **Loading States** (45 min)
   - Add spinners to all buttons during async
   - Disable buttons when loading
   - Show skeleton for MyTickets

---

## 📊 Performance Budget

Target metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

Current issues affecting metrics:
- Font loading causes FOIT (Flash of Invisible Text)
- Framer Motion increases bundle by ~50KB
- No image optimization

---

## 🧪 Testing Checklist

Before considering any page "done":

### Functional
- [ ] Works without wallet connected
- [ ] Works with wallet connected
- [ ] Handles transaction rejection
- [ ] Survives page refresh
- [ ] Works in incognito mode

### Visual
- [ ] No layout shift on load
- [ ] Hover states work
- [ ] Focus states visible
- [ ] Animations smooth at 60fps
- [ ] No content overflow

### Accessibility
- [ ] Screen reader announces content
- [ ] Keyboard navigation works
- [ ] Color contrast passes
- [ ] Works at 200% zoom
- [ ] No motion if prefers-reduced-motion

### Performance
- [ ] Page loads in < 3s on 3G
- [ ] No janky scrolling
- [ ] Smooth animations
- [ ] Images lazy load
- [ ] Bundle size reasonable

---

## 🔧 Files Needing Immediate Attention

Priority 1 (Do Now):
1. `/web/src/pages/MyTickets.tsx` - QR integration, tokens, batch actions
2. `/web/src/pages/Events.tsx` - Real data integration, purchase flow
3. `/web/src/components/Header.tsx` - Fix active states, apply tokens

Priority 2 (This Week):
4. `/web/src/pages/CheckIn.tsx` - Full redesign with scan states
5. `/web/src/pages/AppConsole.tsx` - Timeline checklist, tokens
6. `/web/src/components/Button.tsx` - Token-based variant system

Priority 3 (Polish):
7. All empty states across pages
8. All error states with retry
9. Mobile touch target sizes
10. Add more unit tests

---

## 📝 Next Steps

1. **Integrate QR Codes** - Replace all placeholders with real QR generation
2. **Fix Active Nav States** - Ensure underline follows correct route
3. **Add Error Boundaries** - Catch crashes gracefully
4. **Apply Tokens Everywhere** - No more hardcoded colors/spacing
5. **Performance Pass** - Lazy load, optimize images, code split
6. **Accessibility Pass** - ARIA labels, keyboard nav, contrast check
7. **Mobile Testing** - Real device testing on iOS/Android
8. **Edge Case Handling** - Offline, errors, empty states

---

## ✨ Future Enhancements

- Apple Wallet / Google Pay integration
- Email receipts for purchases
- Push notifications for event updates
- Event recommendations based on history
- Social sharing of tickets
- Multi-language support
