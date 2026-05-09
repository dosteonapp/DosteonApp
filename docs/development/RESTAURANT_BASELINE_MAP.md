# Restaurant Baseline Map

This document provides a comprehensive mapping of the current Restaurant dashboard infrastructure to guide the implementation of the MVP workflows.

---

## 1. Restaurant Routes Inventory

All routes are located under `frontend/app/dashboard/@restaurant/**`.

| Route URL                       | File Path                     | Description                                         | Data Mode                         |
| :------------------------------ | :---------------------------- | :-------------------------------------------------- | :-------------------------------- |
| `/dashboard`                    | `page.tsx`                    | Main dashboard overview with stats and summaries.   | Mixed (Live Stats / Mock Orders)  |
| `/dashboard/inventory`          | `inventory/page.tsx`          | Inventory management (CRUD) for restaurant stock.   | Mixed (Live API CRUD / Mock Logs) |
| `/dashboard/orders`             | `orders/page.tsx`             | Overview of current, scheduled, and past orders.    | Mock                              |
| `/dashboard/orders/[id]`        | `orders/[id]/page.tsx`        | Detailed view of a single procurement order.        | Mock                              |
| `/dashboard/orders/new`         | `orders/new/page.tsx`         | Multi-step form to create new supplier orders.      | Mock                              |
| `/dashboard/suppliers`          | `suppliers/page.tsx`          | Directory of connected suppliers.                   | Live API                          |
| `/dashboard/suppliers/discover` | `suppliers/discover/page.tsx` | Marketplace to find and connect with new suppliers. | Live API                          |
| `/dashboard/suppliers/[id]`     | `suppliers/[id]/page.tsx`     | Detailed profile of a specific supplier.            | Live API                          |
| `/dashboard/analytics`          | `analytics/page.tsx`          | Detailed trends on consumption and wastage.         | Mock                              |
| `/dashboard/finance`            | `finance/page.tsx`            | Financial overview for restaurant spending.         | Mock                              |
| `/dashboard/notifications`      | `notifications/page.tsx`      | List of system and order alerts.                    | Mock                              |
| `/dashboard/settings`           | `settings/page.tsx`           | Account, team, and preference management.           | Mock                              |

---

## 2. Navigation & Workflow Map (As-is)

### Current Entry Points (Sidebar)

- **Dashboard** (`/dashboard`): General overview.
- **Suppliers** (`/dashboard/suppliers`): Access to the supplier network and discovery.
- **Inventory** (`/dashboard/inventory`): Stock management.
- **Orders** (`/dashboard/orders`): Procurement tracking.
- **Notifications** (`/dashboard/notifications`): Alert monitoring.
- **Settings** (`/dashboard/settings`): Configuration.

### Planned/Missing Entry Points (identified in request)

- **Kitchen Service**: No dedicated route/file yet.
- **Closing**: No dedicated route/file yet.

### Current Flow Logic

1.  **Auth Redirect**: Users are redirected to `/dashboard` after login based on the `restaurant` role.
2.  **Parallel Routing**: The `@restaurant` slot is activated in `frontend/app/dashboard/layout.tsx`.
3.  **Discovery to Order**: Sidebar -> Suppliers -> Discover -> View Supplier -> Create Order -> Orders List.

---

## 3. Reusable UI Components Inventory

### Layout & Navigation

- `RestaurantSidebar`: `frontend/components/restaurant-sidebar.tsx`
- `Logo`: `frontend/components/icons/Logo.tsx`

### Functional Modals

- `InventoryItemModal`: `frontend/components/inventory-item-modal.tsx` (Add/Edit items)
- `LogUsageModal`: `frontend/components/log-usage-modal.tsx` (Record stock usage)
- `NewOrderModal`: `frontend/components/new-order-modal.tsx` (Form for new orders)
- `OrderItemModal`: `frontend/components/order-item-modal.tsx` (Quick reorder or adjustment)
- `DashboardOrderModal`: `frontend/components/dashboard-order-modal.tsx` (Order details popup)

### Core UI (shadcn/ui)

- `Button`: `frontend/components/ui/button.tsx`
- `Card`: `frontend/components/ui/card.tsx`
- `Table`: `frontend/components/ui/table.tsx`
- `Badge` (Status Chips): `frontend/components/ui/badge.tsx`
- `Tabs`: `frontend/components/ui/tabs.tsx`
- `Input` / `Select`: `frontend/components/ui/input.tsx`, `frontend/components/ui/select.tsx`
- `Skeleton`: `frontend/components/ui/skeleton.tsx` (Loading states)

---

## 4. Data / Networking Layer Inventory

### Axios Configuration

- **File**: `frontend/lib/axios.ts`
- **Base URL**: `/api/v1` (Rewritten to `http://127.0.0.1:8000/api/v1` via `next.config.mjs`)
- **Auth**: Injects Supabase `access_token` into the `Authorization` header via interceptors.

### TanStack Query Usage

- **Patterns**: Uses `useQuery` for fetch and `useInfiniteQuery` for paginated lists (e.g., Inventory).
- **Query Keys**: Standardized strings e.g., `["inventory", search]`, `["my-network"]`.
- **Mutation Helpers**: Service-level functions in `frontend/lib/services/`.

### Mock System

- **Flag**: `NEXT_PUBLIC_USE_MOCKS` toggles the system via `frontend/lib/flags.ts`.
- **Storage**: Handled in `frontend/mocks/` (e.g., `orders.mock.ts`, `inventory.mock.ts`).

---

## 5. Backend Endpoints Inventory (Restaurant Operations)

| Endpoint           | Path                                         | Service/Repository                            | Description                       |
| :----------------- | :------------------------------------------- | :-------------------------------------------- | :-------------------------------- |
| **Stats**          | `GET /api/v1/restaurant/stats`               | `restaurant_service.py` / `inventory_repo.py` | Dashboard summary counts.         |
| **Low Stock**      | `GET /api/v1/restaurant/inventory/low-stock` | `restaurant_service.py`                       | List critical items.              |
| **Recent Orders**  | `GET /api/v1/restaurant/orders/recent`       | `restaurant_service.py`                       | Last 5 orders summary.            |
| **Inventory CRUD** | `ANY /api/v1/inventory/`                     | `inventory_service.py` / `inventory_repo.py`  | Full management of stock items.   |
| **Order CRUD**     | `ANY /api/v1/orders/`                        | `order_service.py` / `order_repo.py`          | Management of procurement orders. |

---

## 6. Baseline Risks

- **Endpoint Inconsistency**: The frontend `inventoryService.ts` calls `/restaurant/inventory/...` but the backend router prefix is `/inventory/`. This will cause 404s if `NEXT_PUBLIC_USE_MOCKS` is disabled.
- **Mock Leakage**: Many "Details" pages (like Order Details) import directly from `mocks/` rather than checking the `useMocks` flag or using a unified data utility.
- **Type Safety**: Several `page.tsx` files use `any` for complex data structures (especially in `InventoryPage` and `OrdersPage`), risking runtime errors on data shape changes.
- **Role Logic Duplication**: Business logic for "Low Stock" exists both in `restaurant_service.py` and partially recalculated in the frontend components.

---

## 7. Step Template for Workflow Features

Use this template for every new workflow step or page implementation.

### Route Template

- **Route**: `dashboard/restaurant/[workflow-slug]`
- **File**: `app/dashboard/@restaurant/[workflow-slug]/page.tsx`

### UI Sections

1.  **Header**: Title, Subtitle, Breadcrumbs.
2.  **Action Bar**: Search, Filter, Primary CTA.
3.  **Content**: Table, Grid, or Multi-step Form.
4.  **Feedback**: Toasts, Error Banners, Loading Skeletons.

### Interaction Map

- **Input**: `[Trigger Element] -> [Target State/Modal]`
- **Submit**: `[Action Button] -> [Mutation Call] -> [Optimistic Update]`

### Validation Requirements

- **Frontend**: Zod schema for forms.
- **Backend**: Pydantic models in `app/schemas/`.

### API Contract (Draft)

- **Method**: `[GET|POST|PATCH|DELETE]`
- **URL**: `/api/v1/[domain]/[endpoint]`
- **Payload Params**: `[...]`
- **Response Shape**: `{ success: boolean, data: ... }`

### Backend Task List

1.  Create/Update Schema in `app/schemas/`.
2.  Implement Repository method in `app/repositories/`.
3.  Add logic to Service in `app/services/`.
4.  Expose Route in `app/api/api_v1/endpoints/`.

### DB / Persistence Notes

- Table involved: `[...]`
- RLS Policy required: `[...]`

### Checklist

- [ ] Responsive design verified (Mobile/Desktop)
- [ ] Mock data fallback implemented (`if (useMocks) return stubData`)
- [ ] Loading states handled
- [ ] Error boundary tested

### Commit Message Template

`feat(restaurant): implement [feature name] workflow foundation`
