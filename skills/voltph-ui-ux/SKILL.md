---
name: voltph-ui-ux
description: UX/UI design patterns and visual styling guidance for Voltpath PH. Use when designing web or mobile interfaces, refining layouts, or implementing design systems to move away from "plain" UI.
---

# Voltpath PH UX/UI Skill

This skill provides the architectural and visual guidance needed to transform Voltpath PH from a functional prototype into a premium, modern application.

## 🚀 Quick Start
When asked to improve the UI or design a new feature:
1.  **Reference Tokens:** Load `references/design-tokens.md` for the core color palette and typography.
2.  **Reference Patterns:** Load `references/ui-patterns.md` for specific code implementations.
3.  **Apply Principles:** Use the "Premium Shift" approach described below.

## 💎 The "Premium Shift" Approach
Move away from default/plain styles by applying these three upgrades:

### 1. Depth & Elevation
- **Instead of:** Flat borders or solid gray backgrounds.
- **Use:** Soft, multi-layered shadows and subtle gradients.
- **Pattern:** `shadow-lg` (Web) or `elevation: 4` (Android/iOS) with background color `#FFFFFF`.

### 2. Spacing & Breathing Room
- **Instead of:** Dense text and tight margins.
- **Use:** Generous padding (`p-6` or `24px`) and logical grouping using whitespace rather than lines.

### 3. Interactive Feedback
- **Instead of:** Static elements.
- **Use:** Micro-interactions (hover states, scale transforms on press, loading skeletons).

## 🇵🇭 Philippine-Specific UX
- **Mobile First:** Assume usage on mid-range devices with potential glare (high contrast is key).
- **Network Awareness:** Use skeleton loaders and optimistic UI updates for slow data connections.
- **Iconography:** Use universal symbols (Lucide) but ensure labels are clear for local users.

## 🛠 Refactoring Workflow
When modernizing a "plain" component:
1.  **Analyze Layout:** Identify if it uses boxes/borders.
2.  **Strip Borders:** Remove harsh borders and replace with shadow/elevation.
3.  **Inject Color:** Use **Electric Green** for the primary CTA and **Charge Blue** for secondary info.
4.  **Round Corners:** Ensure all interactive elements have at least `12px` radius.
5.  **Refine Typography:** Ensure hierarchy (Headings are bold and dark; body is soft gray).
