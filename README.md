# DijiInvoice

A multi-organization SaaS platform for invoice management built with Next.js, Shadcn/ui, and Firebase.

## Features

- **Multi-organization SaaS**: Isolated data per organization
- **Quotes Management**: Create quotes and convert to invoices
- **Invoice Tracking**: Manage invoices with partial payments
- **Products & Services**: Catalog management
- **Offline Support**: PWA with offline capabilities
- **Firebase Integration**: Auth, Firestore, Storage

## Setup

1. **Firebase Project**:
   - Create a new Firebase project at https://console.firebase.google.com/
   - **Authentication**: Enable Email/Password and Google providers
   - **Firestore Database**: Enable and deploy the security rules from `firestore.rules`
   - **Storage**: Enable (optional for file uploads)

2. **Environment Variables**:
   - Copy `.env.local` and fill in your Firebase config:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

3. **Deploy Firestore Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Install Dependencies**:
   ```bash
   npm install
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - Reusable UI components
- `src/contexts/` - React contexts (Auth)
- `src/lib/` - Utilities, Firebase config, types
- `public/` - Static assets

## Database Schema

Data is stored in Firestore with organization isolation:

```
/organizations/{organizationId}/
  - quotes/
  - invoices/
  - products/
  - services/
  - payments/
```

## Authentication

- **Email/Password**: Standard registration and login
- **Google Sign-In**: One-click authentication with Google
- **Password Reset**: Email-based password recovery
- **Multi-organization**: Each user belongs to their own organization
- **Auto Organization Creation**: Google users get automatic organization setup

## Offline Support

- **Firestore Offline Persistence**: Data is cached locally in IndexedDB, allowing the app to work offline
- **Automatic Sync**: Changes sync automatically when connectivity is restored
- **PWA Manifest**: Installable as a progressive web app on mobile devices
- **Service Worker**: Caching for static assets (to be implemented)

### Offline Persistence Details

The app uses Firestore's `enableIndexedDbPersistence` to cache data locally:

- **Client-side Only**: Persistence is enabled only in the browser to avoid SSR issues
- **Error Handling**: Gracefully handles multiple tabs and unsupported browsers
- **Real-time Sync**: Local changes sync with the server when online
- **Data Availability**: Quotes, invoices, products, and services remain accessible offline

## Next Steps

- PDF generation for invoices
- Email notifications for invoices/quotes
- Advanced reporting and analytics
- Subscription management
- Multi-language support beyond Arabic
- Advanced user management (team members, roles)
