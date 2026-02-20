# MVP Development Workflow

To ensure stability during MVP implementation, follow this branch and PR strategy.

## Branch Strategy

- `main`: Production-stable code only.
- `mvp`: Main integration branch for all MVP features.
- `mvp/feature-*`: Short-lived branches for specific workflow pages or vertical features.

## PR Flow

1. **Feature to MVP**:
   - Branch `mvp/feature-inventory-logs` created from `mvp`.
   - Implement frontend (mocks) -> Backend -> DB.
   - PR into `mvp`.
2. **MVP to Main**:
   - Only when a complete workflow (e.g., "Restaurant Onboarding") is stable.
   - PR from `mvp` into `main`.

## Implementation Sequence (The Clean Way)

For each new page/workflow:

1. **Frontend First**: Implement UI + Routes + Mocks.
2. **API Contract**: Define request/response shapes.
3. **Backend Integration**: Implement FastAPI endpoints.
4. **Data Persistence**: Update Supabase tables/policies.
5. **Final Swap**: Toggle from Mocks to Live API.
