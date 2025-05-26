'use client';

import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LOGIN_CHILD = gql`
  mutation LoginChild($username: String!, $password: String!) {
    loginChild(username: $username, password: $password) {
      token
      child {
        id
        name
        age
      }
    }
  }
`;

export default function ChildLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loginChild, { loading, error }] = useMutation(LOGIN_CHILD);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await loginChild({ variables: form });
    if (data?.loginChild?.token) {
      localStorage.setItem('token', data.loginChild.token);

      // Redirect based on age
      const { id, age } = data.loginChild.child;
      if (age >= 3 && age <= 6) router.push(`/child/${id}/young`);
      else if (age >= 7 && age <= 10) router.push(`/child/${id}/mid`);
      else router.push(`/child/${id}/teen`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl font-bold mb-4 text-purple-700">Child Login</h2>
        <p className="text-sm text-gray-600 mb-6">Enter your username and password to access your dashboard.</p>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl transition duration-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
        </form>
      </div>
    </div>
  );
}
