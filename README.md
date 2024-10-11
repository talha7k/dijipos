# POS App

A Point of Sale (POS) application built using modern web technologies such as [ShadCN](https://shadcn.dev), [Zod](https://zod.dev), [Zustand](https://github.com/pmndrs/zustand), [Next.js 14](https://nextjs.org/), and [Supabase](https://supabase.com/) as the backend. This app offers efficient management of sales, inventory, and customer orders for small and medium-sized businesses.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Inventory Management**: Keep track of stock levels, product information, and suppliers.
- **Sales Management**: Process customer transactions, manage orders, and generate receipts.
- **User Authentication**: Role-based access control for employees (e.g., admin, cashier) via Supabase Auth.
- **State Management**: Efficient state management with `Zustand`.
- **Form Validation**: Input validation using `Zod` for secure and accurate data handling.
- **Fast and Scalable**: Built with Next.js 14 for optimized performance and scalability.
- **Backend**: Data storage and authentication are powered by Supabase.
- **Responsive Design**: Accessible and responsive UI powered by `ShadCN`.

## Tech Stack

- **Frontend Framework**: [Next.js 14](https://nextjs.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Form Validation**: [Zod](https://zod.dev/)
- **UI Components**: [ShadCN](https://shadcn.dev) (headless components for customizable UI)
- **Backend**: [Supabase](https://supabase.com/) (authentication, database, and storage)
- **Database ORM**: [Prisma](https://www.prisma.io/) (optional for database integration)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/pos-app.git
   cd pos-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up Supabase**:

   - Go to Supabase, sign up, and create a new project.
   - In your Supabase dashboard, go to Settings > API to find your SUPABASE_URL and SUPABASE_ANON_KEY.
   - Set up tables for users, products, orders, etc. in the Database section (or use Supabase's built-in Auth for user management).

4. **Set up environment variables**:

   Create a .env.local file in the root directory and add the necessary environment variables:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

5. **Run the development server**:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 in your browser to view the app.

## Usage

### Running the App in Development Mode

To run the POS app locally:

   ```bash
   npm run dev
   ```

   This starts the app on http://localhost:3000.

## Building the App for Production

To build the app for production:

   ```bash
   npm run build
   ```

   Once built, you can start the production server:

   ```bash
   npm start
   ```

### State Management with Zustand

The app's global state (e.g., cart, product inventory) is managed using Zustand. Refer to the /store folder to see how state slices are created and used across components.

### Form Validation with Zod

Zod is used for validating forms and ensuring data integrity. You can find the validation schemas under /schemas.

### Supabase Integration

Supabase is used to handle backend operations such as:
- Authentication: Using Supabase's Auth API.
- Data Storage: Inventory, sales, and order data are stored in Supabase's PostgreSQL database.

Folder Structure

```bash
├── public/                # Public assets (images, etc.)
├── src/
│   ├── components/        # Reusable UI components (ShadCN-based)
│   ├── pages/             # Next.js pages and routing
│   ├── store/             # Zustand store for state management
│   ├── schemas/           # Zod validation schemas
│   ├── styles/            # Global CSS and Tailwind configuration
│   └── utils/             # Utility functions
├── prisma/                # Prisma schema for database models (optional)
├── .env.local             # Environment variables
├── next.config.js         # Next.js configuration
├── package.json           # Project metadata and dependencies
└── README.md              # Project documentation
```

## Contributing

We welcome contributions! Please follow these steps:

- Fork the repository.
- Create a new feature branch (git checkout -b feature-name).
- Commit your changes (git commit -m 'Add some feature').
- Push to the branch (git push origin feature-name).
- Create a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
