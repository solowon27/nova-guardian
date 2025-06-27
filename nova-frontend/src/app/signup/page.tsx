'use client';

import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

// GraphQL Mutation (remains the same)
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
  const [passwordError, setPasswordError] = useState(''); // State for password validation

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear password error when typing
    if (e.target.name === 'password' && passwordError) {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic password validation for aesthetics and user guidance
    if (form.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const { data } = await registerParent({ variables: form });
      if (data?.registerParent?.token) {
        localStorage.setItem('token', data.registerParent.token);
        router.push('/parent');
      }
    } catch (err: any) {
      // Apollo client error already handled by 'error' state
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="relative bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 sm:p-10 transform transition-all duration-300 hover:scale-105">
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-16 h-16 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <h2 className="text-4xl font-extrabold text-center text-purple-700 mb-4 animate-fade-in-down">
          Welcome, Parents!
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8 leading-relaxed animate-fade-in">
          Unlock a world of personalized learning for your child. It's quick, easy, and impactful!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g., yourname@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out"
            />
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            {loading ? 'Creating Your Account...' : 'Create My Account'}
          </button>

          {(error || passwordError) && (
            <p className="text-red-600 text-sm text-center mt-3 animate-fade-in">
              {passwordError || `Error: ${error?.message || 'Something went wrong.'}`}
            </p>
          )}
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already a guardian?{' '}
          <Link href="/login" className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors duration-200">
            Log in here!
          </Link>
        </p>
      </div>
    </div>
  );
}