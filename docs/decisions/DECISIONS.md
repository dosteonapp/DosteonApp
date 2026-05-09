# Architecture Decision Log (ADR)

Each 3-5 line entry documents a critical decision, rationale, and impact.

---

### [2026-02-09] Modular Mock System

- **Decision**: Centralized all dummy data into `frontend/mocks/` and implemented `NEXT_PUBLIC_USE_MOCKS` flag.
- **Why**: Prevent "dummy data pollution" in components and allow clean toggle for MVP feature swap-ins.
- **Impact**: Clean components, visible warning in dev mode, easy transition to live APIs.

---

_(Add new decisions below)_
