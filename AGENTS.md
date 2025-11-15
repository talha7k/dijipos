# AGENTS.md

## Project Overview

DijiInvoice is a multi-organization SaaS platform for invoice management built with Next.js 16, React 19, Shadcn/ui, and Firebase. It provides quote management, invoice tracking, product/service catalog management, and offline support as a PWA.

## Development Commands

### Core Commands
```bash
# Development server with Turbopack
bun run dev

# Production build  
bun run build

# Start production server
bun run start

# Linting
bun run lint

# Type checking
bun run type-check

# Complete check (lint + type-check + build)
bun run check
```

### Firebase Commands
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy only functions (from functions/ directory)
cd functions && npm run deploy

# Start Firebase emulators
cd functions && npm run serve

# View function logs
cd functions && npm run logs
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **UI**: Shadcn/ui components with Radix UI primitives, Tailwind CSS v4
- **State Management**: Jotai for atomic state management
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with Zod validation
- **Development**: Bun as package manager, ESLint with Next.js config

### Key Architectural Patterns

#### Authentication & Organization System
- Multi-tenant architecture with organization-based data isolation
- Authentication flow: AuthProvider → AuthGuard → OrganizationGuard → AppLayout
- Organization state managed through Jotai atoms in `/src/atoms/`
- User roles and permissions enforced through layout guards

#### State Management with Jotai
- Global state stored in `/src/atoms/index.ts` and `posAtoms.ts`
- Custom hooks in `/src/lib/hooks/` provide business logic
- Real-time Firestore integration with optimistic updates
- Organization-scoped data access patterns

#### Component Organization
```
src/components/
├── ui/                    # Shadcn/ui base components
├── layout/               # Authentication and routing guards
├── [feature]/           # Feature-specific components
└── shared/              # Cross-feature utilities
```

#### Firebase Integration
- Client config in `/src/lib/firebase/client-config.ts`
- Firestore operations in `/src/lib/firebase/firestore/`
- Server-side Firebase Admin for Cloud Functions
- Offline persistence enabled with IndexedDB caching

### File Structure Patterns
- **Pages**: `/src/app/[feature]/page.tsx` with layout.tsx for shared layout
- **Types**: Organized by domain in `/src/types/[domain].ts`
- **Hooks**: Business logic hooks in `/src/lib/hooks/`
- **Utils**: General utilities in `/src/lib/utils.ts`
- **Atoms**: State management atoms in `/src/atoms/`

## Development Patterns

### Code Style
- TypeScript with strict mode enabled
- Tailwind CSS for styling with custom color variants
- Shadcn/ui component patterns with Radix UI primitives
- Custom button variants for status colors (yellow, orange, green, etc.)
- Atomic design principles for component organization

### Data Access Patterns
```typescript
// Typical custom hook pattern
export function use[Feature]() {
  const [state, setState] = useAtom(featureAtom);
  const { user } = useAuth();
  
  useEffect(() => {
    // Fetch and manage real-time data
  }, [user]);
  
  return { state, actions };
}
```

### Component Patterns
- Use compound component patterns for complex features
- Implement loading states and error boundaries
- Follow the `asChild` pattern from Radix UI for flexible composition
- Leverage Tailwind's responsive prefixes for mobile-first design

### Type Safety
- Centralized type definitions in `/src/types/`
- Zod schemas for runtime validation
- Firestore document types match domain models
- Organization-based typing for data isolation

## Firebase Setup & Configuration

### Required Environment Variables
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firestore Database Structure
```
/organizations/{organizationId}/
  ├── invoices/
  ├── quotes/
  ├── products/
  ├── services/
  ├── payments/
  ├── customers/
  ├── suppliers/
  └── users/
```

### Security Rules
- Organization-based data isolation enforced
- User role-based access permissions
- Authentication required for all writes
- Public read access for specific resources as needed

## Common Gotchas & Considerations

### Firebase Integration
- `enableIndexedDbPersistence` is deprecated but still functional
- Multiple tabs can cause persistence conflicts
- Emulator URL handling for local development
- Server-side Firebase Admin vs client Firebase SDK usage

### State Management
- Jotai atoms must be initialized properly to prevent hydration issues
- Organization state management complexity due to multi-tenancy
- Real-time listeners need cleanup on unmount
- Timeout handling for Firestore operations

### Performance Considerations
- Turbopack for faster development builds
- Image optimization through Next.js Image component
- Bundle size optimization with dynamic imports
- PWA capabilities with service worker caching

### Development Environment
- Bun as package manager (not npm) - use `bun run` commands
- Firebase emulators for local development and testing
- TypeScript strict mode requires explicit typing
- ESLint configuration extends Next.js recommended settings

## Testing & Deployment

### Before Deploying
Always run `bun run check` to ensure:
- Code passes ESLint checks
- TypeScript compilation succeeds
- Production build completes without errors

### Deployment Notes
- Firestore rules must be deployed separately with `firebase deploy --only firestore:rules`
- Cloud Functions deployment from `functions/` directory
- Environment variables must be configured in production
- Vercel deployment configured through `vercel.json`

### Offline Features
- IndexedDB persistence for Firestore data
- PWA manifest for installable app experience
- Service worker implementation for asset caching (planned)
- Automatic sync when connectivity restored