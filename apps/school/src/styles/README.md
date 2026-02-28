# Paperbook Design System

This document provides guidelines for using the Paperbook design system consistently across the application.

## Overview

The design system uses:
- **Tailwind CSS v4** with CSS variables
- **OKLCH color space** for perceptual uniformity
- **Dark mode** via `.dark` class with full overrides
- **CVA (Class Variance Authority)** for component variants

## Color Architecture

### CSS Variables (`globals.css`)

All colors are defined as CSS variables in `src/styles/globals.css` and can be accessed:

1. **In CSS/Tailwind**: `var(--color-status-success)`
2. **In TypeScript**: Import from `@/lib/design-tokens`

### Design Tokens (`design-tokens.ts`)

```typescript
import { statusColors, moduleColors, chartColors, getGradeColor } from '@/lib/design-tokens'
```

---

## Color Categories

### 1. Status Colors

Use for indicating state, feedback, and alerts.

| Token | Light Mode | Usage |
|-------|------------|-------|
| `--color-status-success` | Green | Positive actions, completed states |
| `--color-status-warning` | Amber | Warnings, pending actions |
| `--color-status-error` | Red | Errors, destructive actions |
| `--color-status-info` | Blue | Informational messages |
| `--color-status-pending` | Amber | Waiting states |
| `--color-status-overdue` | Red | Overdue items |
| `--color-status-inactive` | Gray | Disabled/inactive states |

Each status color has a `-light` variant for backgrounds:
- `--color-status-success-light` (light green background)

**Usage Example:**
```tsx
import { statusColors } from '@/lib/design-tokens'

<div style={{ color: statusColors.success }}>Success!</div>
<div style={{ backgroundColor: statusColors.successLight }}>Light bg</div>
```

### 2. Module Colors

Use for feature/module identification. Each module has a brand color and light variant.

| Module | Color | Light BG |
|--------|-------|----------|
| students | Purple | `#f5f3ff` |
| finance | Amber | `#fef3c7` |
| attendance | Emerald | `#d1fae5` |
| exams | Rose | `#ffe4e6` |
| behavior | Orange | `#fff7ed` |
| library | Teal | `#ccfbf1` |
| ... | ... | ... |

**Usage Example:**
```tsx
import { moduleColors } from '@/lib/design-tokens'

// Icon with module color
<div style={{ backgroundColor: moduleColors.finance }}>
  <IndianRupee />
</div>

// Card with light module background
<Card style={{ backgroundColor: moduleColors.financeLight }}>
```

### 3. Chart Colors

Use for data visualizations (Recharts, etc).

```tsx
import { chartColors } from '@/lib/design-tokens'

// Array of 8 colors
<Pie>
  {data.map((entry, index) => (
    <Cell fill={chartColors[index % chartColors.length]} />
  ))}
</Pie>
```

### 4. Grade Colors

Use for academic grade displays.

```tsx
import { getGradeColor } from '@/lib/design-tokens'

<span style={{ color: getGradeColor('A+') }}>A+</span>  // Green
<span style={{ color: getGradeColor('B') }}>B</span>    // Blue
<span style={{ color: getGradeColor('C') }}>C</span>    // Amber
<span style={{ color: getGradeColor('F') }}>F</span>    // Red
```

---

## Component Patterns

### Badge Variants

Use the built-in Badge variants from `@/components/ui/badge`:

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error/Destructive</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="outline">Outline</Badge>
```

**DO NOT** use inline styles for common status badges.

### MetricCard Variants

```tsx
import { MetricCard } from '@/components/ui/metric-card'

<MetricCard variant="amber" ... />   // Warning/Finance
<MetricCard variant="green" ... />   // Success
<MetricCard variant="rose" ... />    // Error/Critical
<MetricCard variant="blue" ... />    // Info
<MetricCard variant="purple" ... />  // Primary
```

### Icon Boxes

Use the `.icon-box` CSS class for consistent icon containers:

```tsx
<div
  className="icon-box"
  style={{ backgroundColor: statusColors.successLight }}
>
  <CheckIcon style={{ color: statusColors.success }} />
</div>
```

### Stat Cards

Use `.stat-card` with color variants:

```tsx
<div className="stat-card stat-card-primary">
  // Primary purple top border
</div>
<div className="stat-card stat-card-success">
  // Green top border
</div>
```

---

## Dark Mode

All CSS variables automatically update in dark mode. The system uses:
- OKLCH colors for core UI
- RGBA with 0.15 alpha for light backgrounds

**DO NOT** use Tailwind `dark:` classes for colors defined in the system.

**DO:**
```tsx
style={{ backgroundColor: 'var(--color-status-success-light)' }}
```

**DON'T:**
```tsx
className="bg-green-100 dark:bg-green-800"
```

---

## Anti-Patterns

### Avoid Hardcoded Hex Colors

```tsx
// BAD
<div style={{ color: '#22c55e' }}>Success</div>

// GOOD
<div style={{ color: statusColors.success }}>Success</div>
```

### Avoid Mixing Systems

```tsx
// BAD - mixing Tailwind and CSS vars
className="text-green-600" style={{ backgroundColor: 'var(--color-...' }}

// GOOD - consistent system
style={{ color: statusColors.success, backgroundColor: statusColors.successLight }}
```

### Use Badge Variants

```tsx
// BAD - inline styling
<Badge style={{ backgroundColor: '#22c55e', color: 'white' }}>Paid</Badge>

// GOOD - variant
<Badge variant="success">Paid</Badge>
```

---

## Quick Reference

| Need | Use |
|------|-----|
| Success feedback | `statusColors.success` or `Badge variant="success"` |
| Error feedback | `statusColors.error` or `Badge variant="destructive"` |
| Module branding | `moduleColors.{module}` |
| Light backgrounds | `statusColors.{status}Light` or `moduleColors.{module}Light` |
| Chart colors | `chartColors[index]` |
| Grade display | `getGradeColor(grade)` |
| Icon container | `.icon-box` class |
| Stat card | `.stat-card` + `.stat-card-{variant}` |

---

## Files

| File | Purpose |
|------|---------|
| `src/styles/globals.css` | CSS variable definitions |
| `src/lib/design-tokens.ts` | TypeScript token exports |
| `src/components/ui/badge.tsx` | Badge component with variants |
| `src/components/ui/metric-card.tsx` | MetricCard component |
