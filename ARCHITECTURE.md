# Architecture

```
src/
├─ data/          # Static game data (buildings, names)
├─ engine/        # Time, production, persistence, game loop
├─ state/         # React context, default state, selectors
├─ components/    # Reusable UI pieces (TopBar, ResourceSidebar, etc.)
├─ views/         # Screen-level views (Base, Population, ...)
├─ utils/         # Formatting helpers
```

State flows from `GameProvider` → views/components. Engine modules are pure functions acting on state. Data modules define game content.
