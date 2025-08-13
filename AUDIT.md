# Apocalypse Idle Audit

## Overview

- Idle colony sim built with React 19, Vite, and TailwindCSS v4.
- Core loop: seasonal time system drives building harvest cycles and settler production.
- Autosave every 10s; offline progress applied on load with capacity clamping.
- Base view exposes food/resource buildings and event log; population view manages settler roles.

## Feature Matrix

| Feature                                                 | Status        |
| ------------------------------------------------------- | ------------- |
| Time, year and season tracking                          | ✅            |
| Season modifiers affecting farming and wood             | ✅            |
| Autosave & offline progress with capacity clamp         | ✅            |
| Resource sidebar with capacities & rates                | ✅            |
| Building construction/demolition with cost & 50% refund | ✅            |
| Population roles and basic stats                        | ✅            |
| Accessibility (focus states/aria)                       | ⚠️ basic only |
| Persistence schema versioning                           | ✅ (added)    |
| Tests / type safety                                     | ❌            |

## Architecture Map

- **State**: `GameContext` provider storing game state, actions and timers.
- **Engine**: `time.js`, `production.js`, `persistence.js`, `useGameLoop.tsx`.
- **Data**: `buildings.js`, `names.js`.
- **UI**: Components (TopBar, Drawer, ResourceSidebar, etc.) and Views (Base, Population, Research, Expeditions).

## Issues & Recommendations

| Rank   | Issue                                                     | Recommendation                                                    |
| ------ | --------------------------------------------------------- | ----------------------------------------------------------------- |
| High   | No test coverage                                          | Introduce basic unit tests for production & time calculations.    |
| High   | Accessibility gaps (modals, focus order)                  | Add ARIA roles/labels, ensure keyboard navigation.                |
| Medium | Season modifiers limited to farming names                 | Extend modifiers to support per-resource keys if needed.          |
| Medium | Persistence lacks migration strategy beyond version guard | Implement migration routines when schema evolves.                 |
| Low    | Placeholder CSS/assets from Vite template                 | Removed, continue trimming unused code.                           |
| Low    | Components may re-render frequently                       | Evaluate memoization for heavy components like `ResourceSidebar`. |

## Quick-wins Applied

- `chore: clean up assets and add save schema version`

## Proposed Refactors

- **Modular storage buildings** – define storage structures and capacities in data files; risk: medium (touches production & UI).
- **Advanced food system** – abstract farming buildings for different crops with modifiers; risk: medium-high.
- **Mission/expedition framework** – new state slice and engine loop; risk: high.
- **TypeScript migration** – long term maintainability; risk: high.
