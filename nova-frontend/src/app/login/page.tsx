'use client';

import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        email
      }
    }
  }
`;

export default function ParentLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [login, { loading, error }] = useMutation(LOGIN);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await login({ variables: form });
    if (data?.login?.token) {
      localStorage.setItem('token', data.login.token);
      router.push('/parent');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4">👨‍👧 Parent Login</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Log in to manage your children’s learning journey.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
