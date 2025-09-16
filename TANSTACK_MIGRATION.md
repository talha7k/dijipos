

# 🔄 TanStack Query Firebase Migration Guide

## 📦 What Was Installed

* `@tanstack/react-query` – Core TanStack Query library
* `@tanstack-query-firebase/react` – Firebase integration (Firestore hooks)
* `@tanstack/react-query-devtools` – Devtools for debugging queries

---

## 🏗️ What Was Added

### 1. QueryProvider (`src/components/QueryProvider.tsx`)

* Wraps the app with `QueryClientProvider`
* Configured with sensible defaults:

  * `staleTime: 60_000` (1 minute)
  * `refetchOnWindowFocus: false`
* Includes `ReactQueryDevtools` for debugging

---

### 2. Firestore Query Integration (`src/lib/firebase-query.ts`)

* Centralized wrappers around Firestore hooks:

  * `useDocumentQuery<T>()` – For single doc fetches (realtime or one-time)
  * `useCollectionQuery<T>()` – For collection queries (with constraints)
 hh
  * `useRunTransactionMutation()` – Custom wrapper for Firestore `runTransaction`
  * `useWaitForPendingWritesQuery()` – Custom hook for consistency after critical writes

---

### 3. Example Migration: Orders (`src/hooks/orders/useOrdersQuery.ts`)

* Migrated from manual Firestore SDK to `useCollectionQuery`
* Features:

  * Automatic caching + background refetch
  * Real-time sync with `subscribe: true`
  * Error & loading state built into query lifecycle
  * Cache invalidation on mutations

---

### 4. App Layout Integration (`src/app/layout.tsx`)

* Wrapped app with `QueryProvider`
* Provider order: `ThemeProvider → QueryProvider → AuthProvider`

---

## 🚀 Benefits of Migration

### 1. Performance

* Firestore reads are cached by React Query
* Deduplicated requests prevent wasted reads
* Background refresh without blocking UI

### 2. DX (Developer Experience)

* Devtools for cache & query inspection
* Type-safe hooks + query keys
* No manual `useEffect` or `onSnapshot` boilerplate

### 3. Reliability

* Retry & error recovery built-in
* Optimistic updates with rollback
* Transactions handled atomically

### 4. Cleaner Code

* Fewer custom atoms & manual state
* Declarative queries → less boilerplate
* Consistent queryKey naming convention

---

## 📘 Usage Examples

### Single Document

```ts
import { useDocumentQuery } from "@tanstack-query-firebase/react/firestore";
import { doc } from "firebase/firestore";

const ref = doc(firestore, "orders", orderId);

const { data, isLoading } = useDocumentQuery(["order", orderId], ref, {
  subscribe: false, // one-time fetch
});
```

### Collection (Realtime)

```ts
import { useCollectionQuery } from "@tanstack-query-firebase/react/firestore";
import { collection, query, where } from "firebase/firestore";

const ref = query(
  collection(firestore, "products"),
  where("organizationId", "==", organizationId)
);

const { data, isLoading } = useCollectionQuery(["products", organizationId], ref, {
  subscribe: true, // live updates
});
```

### Mutation

```ts
import { useDocumentMutation } from "@tanstack-query-firebase/react/firestore";
import { doc } from "firebase/firestore";

const ref = doc(firestore, "orders", orderId);

const updateOrder = useDocumentMutation(ref);

await updateOrder.mutateAsync({ status: "completed" });
```

---

## 📋 Migration Strategy

1. **Audit existing hooks** → categorize into Single Doc / Collection / Mutation / Transaction
2. **Replace**:

   * `getDoc` → `useDocumentQuery`
   * `onSnapshot` → `useDocumentQuery` or `useCollectionQuery` with `subscribe: true`
   * Mutations (`setDoc`, `updateDoc`, `deleteDoc`) → `useDocumentMutation` / `useCollectionMutation`
   * Transactions → `useRunTransactionMutation` (custom wrapper)
3. **Adopt conventions**: consistent queryKeys, error handling, enabled flags
4. **Test critical flows**: orders, invoices, payments (transactions + consistency)
5. **Clean up** old SDK usage after confirming stability

---

## 📊 Migration Target Mapping

| Hook File                         | Category              | Realtime       | Migration Target            | Priority |
| --------------------------------- | --------------------- | -------------- | --------------------------- | -------- |
| useOrderState.ts                  | Single Document Query | One-time fetch | `useDocumentQuery`          | High     |
| useCustomerState.ts               | Single Document Query | One-time fetch | `useDocumentQuery`          | High     |
| useAuthState.ts                   | Single Document Query | One-time fetch | `useDocumentQuery`          | High     |
| use-organization-data.ts          | Single Document Query | One-time fetch | `useDocumentQuery`          | High     |
| use-settings-data.ts              | Single Document Query | One-time fetch | `useDocumentQuery`          | High     |
| useProducts.ts                    | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| usePOSState.ts                    | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| usePurchaseInvoices.ts            | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| useOrders.ts                      | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| useCategories.ts                  | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| usePayments.ts                    | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| useTables.ts                      | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| useSuppliers.ts                   | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| useInvoices.ts                    | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| use-printer-settings-data.ts      | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| use-organization-users-data.ts    | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| use-invitation-codes-data.ts      | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| use-users-data.ts                 | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| use-quote-templates-data.ts       | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| use-invoice-templates-data.ts     | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| use-receipt-templates-data.ts     | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| use-templates-data.ts             | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| usePurchaseProductsServices.ts    | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| useQuotes.ts                      | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| useServices.ts                    | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| useOrderTypes.ts                  | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| usePaymentTypes.ts                | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| useCurrencySettings.ts            | Collection Query      | Realtime       | `useCollectionQuery`        | High     |
| use-organization-actions.ts       | Mutation              | N/A            | `useDocumentMutation`       | High     |
| use-organization-users-actions.ts | Mutation              | N/A            | `useDocumentMutation`       | High     |
| use-invitation-codes-actions.ts   | Mutation              | N/A            | `useDocumentMutation`       | High     |
| use-table-management.ts           | Transaction           | N/A            | `useRunTransactionMutation` | High     |
| use-media-query.ts                | Special/Other         | N/A            | Not applicable              | Low      |
| useOrganizationState.ts           | Special/Other         | Mixed          | Partial migration           | Medium   |
| useSidebarState.ts                | Special/Other         | N/A            | Not applicable              | Low      |
| useThemeState.ts                  | Special/Other         | N/A            | Not applicable              | Low      |

--- 