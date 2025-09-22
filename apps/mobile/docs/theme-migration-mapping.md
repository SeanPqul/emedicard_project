# Theme Migration Mapping

## Color Reference Migration Guide

### Old Structure → New Structure Mapping

#### Primary Colors
- `theme.colors.primary` → `theme.colors.brand.primary` or `theme.colors.green[500]`
- `theme.colors.primary[XXX]` → `theme.colors.green[XXX]`
- `theme.colors.primary.light` → `theme.colors.green[300]`
- `theme.colors.primary.dark` → `theme.colors.green[700]`
- `theme.colors.primaryButton` → `theme.colors.ui.primaryButton`

#### Secondary Colors
- `theme.colors.secondary` → `theme.colors.brand.secondary` or `theme.colors.blue[500]`
- `theme.colors.secondary[XXX]` → `theme.colors.blue[XXX]`
- `theme.colors.secondary.light` → `theme.colors.blue[300]`
- `theme.colors.secondary.dark` → `theme.colors.blue[700]`
- `theme.colors.secondaryButton` → `theme.colors.ui.secondaryButton`

#### Semantic Colors
- `theme.colors.success` → `theme.colors.semantic.success` or `theme.colors.status.success`
- `theme.colors.error` → `theme.colors.semantic.error` or `theme.colors.status.error`
- `theme.colors.warning` → `theme.colors.semantic.warning` or `theme.colors.status.warning`
- `theme.colors.info` → `theme.colors.semantic.info` or `theme.colors.status.info`

#### UI Colors
- `theme.colors.disabled` → `theme.colors.ui.disabled`
- `theme.colors.white` → `theme.colors.ui.white`
- `theme.colors.black` → `theme.colors.ui.black`
- `theme.colors.transparent` → `theme.colors.ui.transparent`

#### Background Colors
- `theme.colors.background` → `theme.colors.background.primary`
- `theme.colors.backgroundSecondary` → `theme.colors.background.secondary`
- `theme.colors.backgroundTertiary` → `theme.colors.background.tertiary`

#### Text Colors
- `theme.colors.text` → `theme.colors.text.primary`
- `theme.colors.textSecondary` → `theme.colors.text.secondary`
- `theme.colors.textTertiary` → `theme.colors.text.tertiary`
- `theme.colors.textInverse` → `theme.colors.text.inverse`

#### Border Colors
- `theme.colors.border` → `theme.colors.border.light`
- `theme.colors.borderMedium` → `theme.colors.border.medium`
- `theme.colors.borderDark` → `theme.colors.border.dark`

#### Gray Scale
- `theme.colors.gray` → `theme.colors.gray[500]`
- `theme.colors.grayLight` → `theme.colors.gray[300]`
- `theme.colors.grayDark` → `theme.colors.gray[700]`

#### Neutral Colors
- `theme.colors.neutral` → `theme.colors.neutral[400]`
- `theme.colors.neutral100` → `theme.colors.neutral[100]`
- `theme.colors.neutral200` → `theme.colors.neutral[200]`

#### Accent Colors
- `theme.colors.accent` → `theme.colors.accent.primaryGreen`
- `theme.colors.accentBlue` → `theme.colors.accent.medicalBlue`
- `theme.colors.accentSky` → `theme.colors.accent.accentSky`

#### Job Category Colors
- `theme.colors.foodHandler` → `theme.colors.jobCategories.foodHandler`
- `theme.colors.securityGuard` → `theme.colors.jobCategories.securityGuard`
- `theme.colors.others` → `theme.colors.jobCategories.others`
- `theme.colors.pink` → `theme.colors.jobCategories.pink`

## Typography Migration
- `getTypography('bodyMedium')` → `getTypography('body')`
- `getTypography('bodyLarge')` → `getTypography('h4')` or custom size

## Common Patterns to Replace

### Direct Color Access
```typescript
// OLD
color: theme.colors.primary
// NEW
color: theme.colors.brand.primary

// OLD
backgroundColor: theme.colors.secondary[500]
// NEW
backgroundColor: theme.colors.blue[500]
```

### Nested Access
```typescript
// OLD
borderColor: theme.colors.primary.light
// NEW
borderColor: theme.colors.green[300]
```

### Status Colors
```typescript
// OLD
color: theme.colors.success
// NEW
color: theme.colors.status.success
```
