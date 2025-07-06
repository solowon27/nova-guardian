'use client';

import { useMutation, gql } from '@apollo/client';
import { useState, SVGProps, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

// 1. This is our unified LOGIN mutation. It works for both parents and children.
const LOGIN = gql`
  mutation Login($email: String, $username: String, $password: String!) {
    login(email: $email, username: $username, password: $password) {
      token
      user {
        _id
        name
        email
        username
        role
      }
    }
  }
`;

// --- Icon Components (unchanged) ---
const IconEnvelope = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
);
const IconLockClosed = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
);


// --- Main Login Page Component ---
export default function ParentLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loginMutation, { loading, error }] = useMutation(LOGIN);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // 2. We call the mutation with the 'email' variable.
      // The 'username' variable will be implicitly null.
      const { data } = await loginMutation({
        variables: {
          email: form.email,
          password: form.password
        }
      });
      
      // 3. On success, we pass the entire user object to our AuthContext.
      if (data?.login?.user && data?.login?.token) {
        login({
          ...data.login.user,
          token: data.login.token, // ✅ Include token
        });
      }

    } catch (err: any) {
      // This will catch network errors, but GraphQL errors are in the `error` object.
      console.error("Login mutation failed:", err.message);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* --- Left Panel: Branding & Welcome Back Message --- */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-slate-50 p-12 text-center">
        <div className="max-w-md">
            <Link href="/" className="flex items-center justify-center gap-2 text-xl font-bold text-gray-800 mb-8">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"></path>
                    <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="currentColor" opacity="0.6"></path>
                </svg>
                <span className="text-2xl font-extrabold tracking-tight">NovaGuardian</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome Back, Guardian!
            </h2>
            <p className="text-gray-600">
              Access your family's learning hub to track progress, assign tasks, and guide your child's educational journey.
            </p>
        </div>
      </div>

      {/* --- Right Panel: Login Form --- */}
      <div className="flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Parent Login
          </h2>
          <p className="text-gray-600 mb-8">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <IconEnvelope className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border-gray-300 py-3 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <IconLockClosed className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border-gray-300 py-3 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging In...
                </>
              ) : (
                'Login to Parent Dashboard'
              )}
            </button>

            {error && (
              <p className="text-red-600 text-sm text-center">
                {/* Display a user-friendly message and the actual error from GraphQL */}
                Error: {error.message.replace('GraphQL error: ', '')}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
