'use client';

import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useState, SVGProps } from 'react';
import Link from 'next/link';

// --- GraphQL Mutation (remains the same) ---
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

// --- Icon Components for a professional look ---
const IconEnvelope = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const IconLockClosed = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const IconCheckCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


// --- Main Signup Page Component ---
export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [registerParent, { loading, error }] = useMutation(SIGNUP);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'password' && passwordError) {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* --- Left Panel: Branding & Value Propositions --- */}
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
                A smarter, safer way to learn.
            </h2>
            <p className="text-gray-600 mb-8">
                Join thousands of parents who trust NovaGuardian to provide the best educational experience for their children.
            </p>
            <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                    <IconCheckCircle className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <p><span className="font-semibold">AI-Powered Assignments:</span> Personalized tasks that grow with your child.</p>
                </div>
                <div className="flex items-start gap-3">
                    <IconCheckCircle className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <p><span className="font-semibold">Complete Control:</span> A powerful dashboard to track progress and provide feedback.</p>
                </div>
                <div className="flex items-start gap-3">
                    <IconCheckCircle className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <p><span className="font-semibold">Safe & Secure:</span> A protected environment where your child can thrive.</p>
                </div>
            </div>
        </div>
      </div>

      {/* --- Right Panel: Signup Form --- */}
      <div className="flex items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your Parent Account
          </h2>
          <p className="text-gray-600 mb-8">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Log in
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
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border-gray-300 py-3 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Creating Account...' : 'Create My Account'}
            </button>

            {error && (
              <p className="text-red-600 text-sm text-center">
                Error: {error.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
