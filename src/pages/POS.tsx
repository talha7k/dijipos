import React from 'react';
import Navbar from '../components/Navbar';

const POS: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">POS System</h1>
        <p>POS functionality will be implemented here.</p>
      </div>
    </div>
  );
};

export default POS;
