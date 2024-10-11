import useStore from '@/app/store';

const LogoutButton = () => {
  const logout = useStore(state => state.logout);

  const handleLogout = () => {
    logout();
    console.log('Logged out successfully');
    // Handle post-logout actions (e.g., redirect to home page)
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;