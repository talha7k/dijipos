import RecentOrders from '@/components/RecentOrders';

export default function RecentOrdersPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Recent Orders</h1>
      <RecentOrders />
    </div>
  );
}