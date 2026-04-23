# Lapaas OS - UI/UX Design Guide

## Design System

### Color Palette

**Primary Colors**
- Primary: `#0ea5e9` (Sky Blue)
- Primary Dark: `#0284c7`
- Primary Light: `#7dd3fc`

**Secondary Colors**
- Secondary: `#8b5cf6` (Purple)
- Secondary Dark: `#7c3aed`
- Secondary Light: `#c4b5fd`

**Status Colors**
- Success: `#22c55e` (Green)
- Warning: `#f59e0b` (Amber)
- Danger: `#ef4444` (Red)
- Info: `#3b82f6` (Blue)

**Neutral Colors**
- Gray 50: `#f9fafb`
- Gray 100: `#f3f4f6`
- Gray 200: `#e5e7eb`
- Gray 300: `#d1d5db`
- Gray 400: `#9ca3af`
- Gray 500: `#6b7280`
- Gray 600: `#4b5563`
- Gray 700: `#374151`
- Gray 800: `#1f2937`
- Gray 900: `#111827`

### Typography

**Font Family**
- Primary: Inter
- Monospace: Fira Code

**Font Sizes**
- Display: 48px (font-weight: 700)
- Heading 1: 36px (font-weight: 700)
- Heading 2: 28px (font-weight: 700)
- Heading 3: 24px (font-weight: 600)
- Heading 4: 20px (font-weight: 600)
- Body Large: 18px (font-weight: 400)
- Body: 16px (font-weight: 400)
- Body Small: 14px (font-weight: 400)
- Caption: 12px (font-weight: 400)

**Line Heights**
- Tight: 1.2
- Normal: 1.5
- Relaxed: 1.75

### Spacing System

```
4px   - xs
8px   - sm
12px  - md
16px  - lg
24px  - xl
32px  - 2xl
48px  - 3xl
64px  - 4xl
```

### Border Radius

```
2px   - xs
4px   - sm
8px   - md
12px  - lg
16px  - xl
24px  - 2xl
```

### Shadows

```
xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1)
md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

---

## Page Structure

### Main Layout

```
┌─────────────────────────────────────────────┐
│         Header / Navigation Bar              │
├──────────┬──────────────────────────────────┤
│          │                                   │
│ Sidebar  │       Main Content Area          │
│          │                                   │
│          │                                   │
├──────────┴──────────────────────────────────┤
│              Footer                          │
└─────────────────────────────────────────────┘
```

### Header Components
- Logo
- Search bar
- Notifications bell
- User profile dropdown
- Settings icon
- Help icon

### Sidebar Navigation
- Dashboard
- Billing
- Analytics
- Integrations
- Settings
- Support
- Documentation

---

## Page Specifications

### 1. Dashboard Page

**URL:** `/dashboard`

**Components:**
- Welcome card
- KPI cards (4 columns)
  - Monthly Recurring Revenue (MRR)
  - Active Users
  - Churn Rate
  - Net Retention Rate
- Revenue chart (line chart)
- User growth chart (area chart)
- Recent activity (table)
- Quick actions (buttons)

**Layout:**
```
┌─────────────────────────────────────────┐
│ Welcome, John!                          │
├─────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ │ MRR    │ │ Users  │ │ Churn  │ │ NRR    │
│ │ $45K   │ │ 1,250  │ │ 2.5%   │ │ 105%   │
│ └────────┘ └────────┘ └────────┘ └────────┘
├─────────────────────────────────────────┤
│ Revenue Chart      │ User Growth Chart  │
│                    │                    │
│                    │                    │
├─────────────────────────────────────────┤
│ Recent Activity                         │
│ ┌─────────────────────────────────────┐ │
│ │ User signed up                      │ │
│ │ Subscription upgraded               │ │
│ │ Payment received                    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 2. Billing Page

**URL:** `/billing/subscription`

**Components:**
- Current plan card
- Plan comparison table
- Upgrade/Downgrade buttons
- Payment method section
- Invoice history (table)
- Usage tracking

**Layout:**
```
┌─────────────────────────────────────────┐
│ Current Plan: Pro                       │
│ $99/month • Renews on Feb 15, 2024     │
│ [Change Plan] [Cancel Subscription]    │
├─────────────────────────────────────────┤
│ Plan Comparison                         │
│ ┌────────┬────────┬────────┬────────┐  │
│ │ Free   │ Pro    │ Premium│ Custom │  │
│ │ $0     │ $99    │ $299   │ Custom │  │
│ │        │ ✓      │ ✓      │ ✓      │  │
│ └────────┴────────┴────────┴────────┘  │
├─────────────────────────────────────────┤
│ Payment Method                          │
│ Visa ending in 4242                    │
│ Expires 12/2025                        │
│ [Update Payment Method]                │
├─────────────────────────────────────────┤
│ Invoice History                         │
│ ┌─────────────────────────────────────┐ │
│ │ INV-001  $99.00  Paid  Jan 15, 2024 │ │
│ │ INV-002  $99.00  Paid  Dec 15, 2023 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 3. Analytics Page

**URL:** `/analytics/dashboard`

**Components:**
- Date range selector
- Metric selector
- Revenue chart
- User growth chart
- Feature usage table
- Export button

**Layout:**
```
┌─────────────────────────────────────────┐
│ [Date Range ▼] [Metrics ▼] [Export]   │
├─────────────────────────────────────────┤
│ Revenue Trend          │ User Growth    │
│ (Line Chart)           │ (Area Chart)   │
│                        │                │
├─────────────────────────────────────────┤
│ Feature Usage                           │
│ ┌─────────────────────────────────────┐ │
│ │ Feature    │ Users │ Adoption │ Trend│ │
│ │ Dashboard  │ 1,200 │ 96%      │ ↑   │ │
│ │ Reports    │ 850   │ 68%      │ ↑   │ │
│ │ API        │ 450   │ 36%      │ ↓   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4. Settings Page

**URL:** `/settings/organization`

**Components:**
- Organization info form
- Logo upload
- Team members list
- Roles and permissions
- API settings
- Notification preferences
- Security settings

**Layout:**
```
┌─────────────────────────────────────────┐
│ Settings                                │
├─────────────────────────────────────────┤
│ Organization Information                │
│ ┌─────────────────────────────────────┐ │
│ │ Company Name: [________________]    │ │
│ │ Website: [________________]         │ │
│ │ Industry: [________________]        │ │
│ │ [Save Changes]                      │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Team Members                            │
│ ┌─────────────────────────────────────┐ │
│ │ John Doe    admin    [Remove]       │ │
│ │ Jane Smith  member   [Remove]       │ │
│ │ [+ Add Member]                      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 5. Integrations Page

**URL:** `/integrations`

**Components:**
- Integration search
- Integration cards (grid)
- Integration status
- Connect/Disconnect buttons
- Integration logs

**Layout:**
```
┌─────────────────────────────────────────┐
│ [Search integrations...]                │
├─────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Stripe   │ │ Slack    │ │ GitHub   │ │
│ │ ✓ Active │ │ ○ Inactive│ │ ○ Inactive│ │
│ │[Configure]│ │[Connect] │ │[Connect] │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ SendGrid │ │ Zapier   │ │ Custom   │ │
│ │ ✓ Active │ │ ✓ Active │ │ ○ Inactive│ │
│ │[Configure]│ │[Configure]│ │[Configure]│ │
│ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────┘
```

### 6. Support Page

**URL:** `/support/tickets`

**Components:**
- Create ticket button
- Ticket list (table)
- Ticket status filter
- Priority filter
- Search bar

**Layout:**
```
┌─────────────────────────────────────────┐
│ [+ Create Ticket] [Status ▼] [Priority ▼]
├─────────────────────────────────────────┤
│ Support Tickets                         │
│ ┌─────────────────────────────────────┐ │
│ │ #1234  API Integration Issue        │ │
│ │ Status: Open  Priority: High        │ │
│ │ Created: Jan 15, 2024               │ │
│ │                                     │ │
│ │ #1233  Feature Request              │ │
│ │ Status: In Progress  Priority: Low  │ │
│ │ Created: Jan 14, 2024               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Component Library

### Buttons

**Primary Button**
```
Background: #0ea5e9
Text: White
Padding: 12px 24px
Border Radius: 8px
Font Weight: 600
Hover: #0284c7
Active: #0369a1
```

**Secondary Button**
```
Background: #f3f4f6
Text: #374151
Border: 1px solid #d1d5db
Padding: 12px 24px
Border Radius: 8px
Font Weight: 600
Hover: #e5e7eb
```

**Danger Button**
```
Background: #ef4444
Text: White
Padding: 12px 24px
Border Radius: 8px
Font Weight: 600
Hover: #dc2626
Active: #b91c1c
```

### Input Fields

**Text Input**
```
Border: 1px solid #d1d5db
Border Radius: 8px
Padding: 12px 16px
Font Size: 16px
Focus: Border #0ea5e9, Ring #0ea5e9
Error: Border #ef4444
```

**Textarea**
```
Border: 1px solid #d1d5db
Border Radius: 8px
Padding: 12px 16px
Font Size: 16px
Min Height: 120px
Resize: Vertical
```

### Cards

**Standard Card**
```
Background: White
Border: 1px solid #e5e7eb
Border Radius: 12px
Padding: 24px
Shadow: md
Hover: Shadow lg
```

**Elevated Card**
```
Background: White
Border Radius: 12px
Padding: 24px
Shadow: lg
```

### Tables

**Table Header**
```
Background: #f9fafb
Border Bottom: 1px solid #e5e7eb
Padding: 16px
Font Weight: 600
Font Size: 14px
```

**Table Row**
```
Border Bottom: 1px solid #e5e7eb
Padding: 16px
Hover: Background #f9fafb
```

### Modals

**Modal Overlay**
```
Background: rgba(0, 0, 0, 0.5)
Animation: Fade in 200ms
```

**Modal Content**
```
Background: White
Border Radius: 12px
Padding: 32px
Shadow: xl
Max Width: 500px
Animation: Slide up 300ms
```

### Notifications

**Toast Notification**
```
Position: Bottom right
Background: White
Border Left: 4px solid (color based on type)
Padding: 16px
Border Radius: 8px
Shadow: lg
Auto dismiss: 5 seconds
```

**Alert Box**
```
Background: Light color (based on type)
Border: 1px solid (darker shade)
Border Radius: 8px
Padding: 16px
Icon: Left aligned
Close button: Right aligned
```

---

## Responsive Design

### Breakpoints

```
Mobile: 0px - 640px
Tablet: 641px - 1024px
Desktop: 1025px+
```

### Mobile Layout

**Sidebar Navigation**
- Collapsed by default
- Hamburger menu to expand
- Full width when expanded

**Cards**
- Full width
- Single column layout
- Stacked vertically

**Tables**
- Horizontal scroll
- Or convert to card view
- Collapsible rows

---

## Accessibility

### WCAG 2.1 AA Compliance

- Color contrast ratio: 4.5:1 for text
- Focus indicators: Visible outline
- Keyboard navigation: Tab order
- Alt text: All images
- ARIA labels: Form inputs
- Semantic HTML: Proper heading hierarchy

### Keyboard Navigation

- Tab: Move to next element
- Shift+Tab: Move to previous element
- Enter: Activate button/link
- Space: Toggle checkbox/radio
- Arrow keys: Navigate lists/menus
- Escape: Close modals/dropdowns

---

## Dark Mode

### Dark Mode Colors

**Primary**
- Primary: `#06b6d4` (Cyan)
- Primary Dark: `#0891b2`

**Backgrounds**
- Surface: `#1f2937`
- Surface Dark: `#111827`
- Surface Light: `#374151`

**Text**
- Primary: `#f9fafb`
- Secondary: `#d1d5db`
- Tertiary: `#9ca3af`

---

## Animation Guidelines

### Transitions

**Standard Duration:** 200ms
**Easing:** cubic-bezier(0.4, 0, 0.2, 1)

### Common Animations

**Fade In**
```
Opacity: 0 → 1
Duration: 200ms
```

**Slide Up**
```
Transform: translateY(20px) → translateY(0)
Opacity: 0 → 1
Duration: 300ms
```

**Scale**
```
Transform: scale(0.95) → scale(1)
Duration: 200ms
```

---

## Loading States

**Skeleton Loader**
- Gray placeholder
- Animated shimmer effect
- Matches content layout

**Spinner**
- Circular progress indicator
- Animated rotation
- Size: 24px (default)

**Progress Bar**
- Linear progress indicator
- Animated width change
- Height: 4px

---

## Error Handling

### Error Messages

**Inline Error**
- Red text below input
- Icon: ⚠️
- Font size: 12px
- Margin top: 4px

**Error Toast**
- Red background
- White text
- Icon: ✕
- Auto dismiss: 5 seconds

**Error Page**
- Large error code (404, 500, etc.)
- Descriptive message
- Action button (Go Home, Retry, etc.)

---

## Form Design

### Form Layout

**Vertical Layout**
- Labels above inputs
- Full width inputs
- Spacing: 16px between fields

**Horizontal Layout**
- Labels left of inputs
- Fixed label width: 120px
- Spacing: 16px between fields

### Form Validation

**Real-time Validation**
- Validate on blur
- Show error immediately
- Clear error on valid input

**Submit Validation**
- Validate on submit
- Show all errors
- Prevent submission if invalid

---

## Micro-interactions

### Button Hover
- Background color change
- Slight shadow increase
- Cursor change to pointer

### Link Hover
- Underline appears
- Color change
- Cursor change to pointer

### Input Focus
- Border color change to primary
- Shadow ring appears
- Cursor appears

### Checkbox/Radio Change
- Smooth animation
- Color change
- Checkmark/dot appears

---

## Best Practices

1. **Consistency** - Use design system components
2. **Clarity** - Clear labels and instructions
3. **Feedback** - Provide user feedback for actions
4. **Efficiency** - Minimize steps to complete tasks
5. **Accessibility** - Support keyboard and screen readers
6. **Performance** - Optimize images and animations
7. **Mobile-first** - Design for mobile first
8. **Testing** - Test with real users
