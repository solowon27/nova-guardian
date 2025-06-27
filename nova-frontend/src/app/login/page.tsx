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
    try {
      const { data } = await login({ variables: form });
      if (data?.login?.token) {
        localStorage.setItem('token', data.login.token);
        router.push('/parent');
      } else {
        // This case should ideally be caught by Apollo's 'error' state,
        // but included for robustness if token is unexpectedly missing without an error object.
        console.error("Login successful but no token received.");
        // You could set a local error state here if needed
      }
    } catch (err: any) {
      // Apollo Client sets the 'error' state automatically, so it will be displayed by the UI.
      console.error("Login failed:", err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4 sm:p-6 lg:p-8">
      <div className="relative bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 sm:p-10 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-300/50">
        {/* Decorative elements for a more vibrant feel */}
        <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="mb-8">
          <span className="block text-5xl text-center mb-4 animate-scale-in">🔒</span> {/* Modern lock emoji */}
          <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-2 leading-tight animate-fade-in-down">
            Parent Login
          </h2>
          <p className="text-lg text-gray-600 text-center animate-fade-in">
            Access your family's learning hub.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out text-base"
              aria-label="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out text-base"
              aria-label="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 ${
              loading
                ? 'bg-blue-400 cursor-not-allowed flex items-center justify-center'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>

          {error && (
            <p className="text-red-600 text-sm text-center mt-3 p-3 bg-red-50 rounded-lg border border-red-200 animate-fade-in">
              Error: {error.message || 'Login failed. Please check your credentials.'}
            </p>
          )}
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline transition-colors duration-200">
            Create one here!
          </Link>
        </p>
      </div>
    </div>
  );
}