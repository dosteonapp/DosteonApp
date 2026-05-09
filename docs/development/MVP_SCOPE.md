# MVP Scope Definition

This document outlines the current state of features as we move towards MVP.

## Status Legend

✅ **Locked**: Production-ready, core infrastructure.
🟡 **Mixed**: Core functional but relies on mock data for specific sub-features.
❌ **Placeholder**: UI present but entirely mock-data driven.

## Feature Mapping

### Core Infrastructure

| Feature            | Status | Notes                                                    |
| :----------------- | :----: | :------------------------------------------------------- |
| Authentication     |   ✅   | Supabase Auth integrated (Social, Magic Link, Passwords) |
| Role-based Routing |   ✅   | Parallel routes for Supplier/Restaurant dashboards       |
| Networking         |   ✅   | Live Discovery and Connection management                 |
| Core UI/Layout     |   ✅   | Responsive design, shadcn components                     |

### Restaurant Workflow

| Feature        | Status | Notes                                   |
| :------------- | :----: | :-------------------------------------- |
| Inventory List |   ✅   | Integrated with FastAPI / Supabase      |
| Inventory Logs |   🟡   | List is live, but detail logs are mocks |
| Orders List    |   ✅   | List is live (recent orders)            |
| Orders Detail  |   ❌   | Tracking and detailed views are mocks   |
| Notifications  |   ❌   | UI exists, data is mocked               |

### Supplier Workflow

| Feature            | Status | Notes                                      |
| :----------------- | :----: | :----------------------------------------- |
| Finance Dashboard  |   ❌   | Entirely dummy data / charts               |
| Product Management |   🟡   | Basic list present, deeper features mocked |
| Customer Network   |   ✅   | Integrated with Networking system          |

### Integration Points

- **Database**: Supabase PostgreSQL
- **Backend API**: FastAPI (Python)
- **Frontend State**: TanStack Query (React Query)
