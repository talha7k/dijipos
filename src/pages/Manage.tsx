import React from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import useStore from '../store';
import { StoreState } from '../store'; 

const Manage: React.FC = () => {
  const router = useRouter();
  const currentUser = useStore(state => state.currentUser);

  if (currentUser?.role !== 'admin') {
    router.push('/');
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">Management Dashboard</h1>
        <p>Admin-only management features will be implemented here.</p>
      </div>
    </div>
  );
};

export default Manage;
