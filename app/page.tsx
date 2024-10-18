import OrderDetails from '@/components/OrderDetails';
import MenuItems from '@/components/MenuItems';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Restaurant POS</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Menu</h2>
          <MenuItems />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Current Order</h2>
          <OrderDetails />
        </div>
      </div>
    </div>
  );
}