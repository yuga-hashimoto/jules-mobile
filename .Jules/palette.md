## 2025-02-14 - StatusDot Accessibility
**Learning:** `StatusDot` components rely solely on color to convey state, which is inaccessible to screen readers and colorblind users.
**Action:** Always include `accessibilityLabel` with the state text and `accessibilityRole="image"` (or similar) on visual-only status indicators.
