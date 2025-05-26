'use client';

import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const SIGNUP = gql`
  mutation RegisterParent($email: String!, $password: String!) {
    registerParent(email: $email, password: $password) {
      token
      user {
        email
      }
    }
  }
`;

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [registerParent, { loading, error }] = useMutation(SIGNUP);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await registerParent({ variables: form });
    if (data?.registerParent?.token) {
      localStorage.setItem('token', data.registerParent.token);
      router.push('/parent');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-100 via-white to-purple-200 px-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4">👨‍👧 Create Parent Account</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Start guiding your child’s personalized learning experience.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-purple-400"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-purple-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
