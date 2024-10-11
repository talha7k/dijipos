import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useStore from '../store';

const Navbar = () => {
  const router = useRouter();
  const { currentUser, logout } = useStore((state) => ({
    currentUser: state.currentUser,
    logout: state.logout,
  }));

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav>
      <ul>
        <li><Link href="/">Home</Link></li>
        {currentUser ? (
          <>
            <li><Link href="/profile">Profile</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <li><Link href="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
