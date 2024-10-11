import React from 'react';
import Navbar from '../components/Navbar';
import useStore from '../store';

const Home: React.FC = () => {
  const login = useStore(state => state.login);

  const handleLogin = async() => {
    try {
        await login({ email: 'user@example.com', password: 'password123' });
        // Login successful
      } catch (error) {
        // Handle login error
      }
        };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Restaurant App</h1>
        <p>Select an option from the navbar to get started.</p>
        <button onClick={handleLogin} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Login as Admin (Test)
        </button>
      </div>
    </div>
  );
};

export default Home;
