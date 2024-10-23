# DijiPOS - Modern Point of Sale System

DijiPOS is a cutting-edge, web-based Point of Sale (POS) system designed to streamline retail operations and enhance customer experiences. Built with modern web technologies, it offers a robust, scalable solution for businesses of all sizes.

## Features

- **User-friendly Interface**: Intuitive design for quick transactions and easy navigation.
- **Product Management**: Easily add, edit, and categorize products.
- **Inventory Tracking**: Real-time tracking and management of stock levels.
- **Order Management**: Efficiently process and manage customer orders.
- **Customer Management**: Track customer information and purchase history.
- **Payment Type Management**: Customize and manage various payment methods.
- **Reporting**: Generate insightful reports for business analysis.
- **Responsive Design**: Works seamlessly across desktop and mobile devices.

## Technology Stack

- **Frontend**: React.js with Next.js framework
- **State Management**: Zustand
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/talha7k/dijipos.git
   cd dijipos
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase configuration details

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/`: Next.js app directory
- `components/`: React components
  - `manage/`: Management components for various entities
- `lib/`: Utility functions and store
- `types/`: TypeScript type definitions

## Key Components

- `ManageProducts.tsx`: Product management interface
- `ManageProductCategories.tsx`: Category management for products
- `ManageCustomers.tsx`: Customer information management
- `ManageInventory.tsx`: Inventory tracking and management
- `ManagePaymentTypes.tsx`: Payment method configuration
- `MenuItems.tsx`: Display and interaction with menu items

## State Management

The application uses Zustand for state management. The store is defined in `lib/store.ts` and includes actions for managing products, categories, customers, inventory, and orders.

## Contributing

We welcome contributions to DijiPOS! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub issue tracker or contact our support team at support@dijipos.com.

---

DijiPOS - Empowering businesses with efficient, modern point of sale solutions.