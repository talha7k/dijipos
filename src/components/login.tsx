import { FormEvent } from 'react';
import useStore from '../store';

const LoginForm = () => {
  const login = useStore(state => state.login);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await login({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });
      console.log('Login successful');
      // Handle successful login (e.g., redirect)
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;