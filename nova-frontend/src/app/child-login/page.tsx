'use client';

import { gql, useMutation } from '@apollo/client';
import { useState, SVGProps, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { useAuth } from '@/app/contexts/AuthContext';

// 1. Use the SAME unified LOGIN mutation as the parent page.
const LOGIN = gql`
  mutation Login($email: String, $username: String, $password: String!) {
    login(email: $email, username: $username, password: $password) {
      token
      user {
        _id
        name
        role
        age
      }
    }
  }
`;

// --- Icon Components (unchanged) ---
const IconUser = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
);
const IconKey = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.79-.235 1.115l-7.5 11.25a.75.75 0 00.97 1.045l11.25-7.5a.75.75 0 00.27-.917l-3.09-5.148a6.746 6.746 0 005.024-6.44a6.75 6.75 0 00-6.75-1.5zm-3 8.625a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" /></svg>
);


// --- Main Child Login Page Component ---
export default function ChildLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const [executeLogin, { loading, error }] = useMutation(LOGIN);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

 const handleSubmit = async (e: FormEvent) => { 
  e.preventDefault();
  try {
    const { data } = await executeLogin({
      variables: {
        username: form.username,
        password: form.password,
      },
    });

    const { user, token } = data?.login;
    if (user && token) {
      login({ ...user, token }); // ✅ Token is now saved properly
      router.push('/child');  // Redirect to child dashboard
    }
  } catch (err: any) {
    console.error("Login failed:", err.message);
  }
};


  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&display=swap" rel="stylesheet" />
      </Head>
      <main style={{ fontFamily: "'Nunito', sans-serif" }} className="min-h-screen w-full flex items-center justify-center bg-blue-100 p-4 overflow-hidden relative">
        {/* --- Floating Background Shapes --- */}
        <div className="absolute top-10 -left-10 w-48 h-48 bg-yellow-200 rounded-full opacity-50 mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-20 right-0 w-72 h-72 bg-purple-200 rounded-full opacity-50 mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 w-60 h-60 bg-teal-200 rounded-full opacity-50 mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000"></div>

        {/* --- Login Form Character --- */}
        <div className="relative w-full max-w-sm">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="w-32 h-16 bg-white rounded-t-full shadow-lg border-b-4 border-gray-200 flex items-center justify-center gap-4">
               <div className="w-5 h-5 bg-gray-800 rounded-full animate-blink"></div>
               <div className="w-5 h-5 bg-gray-800 rounded-full animate-blink animation-delay-100"></div>
             </div>
          </div>

          <div className="bg-white pt-16 p-8 rounded-3xl shadow-2xl text-center">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
              Ready for an Adventure?
            </h2>
            <p className="text-gray-500 mb-8">
              Let's get you logged in!
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <IconUser className="h-6 w-6 text-purple-400" />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Your Secret Name"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-lg font-bold text-gray-700 placeholder-gray-400 transition-all focus:border-purple-400 focus:ring-4 focus:ring-purple-200 focus:outline-none"
                />
              </div>
              
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <IconKey className="h-6 w-6 text-teal-400" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your Magic Word"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-lg font-bold text-gray-700 placeholder-gray-400 transition-all focus:border-teal-400 focus:ring-4 focus:ring-teal-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-yellow-400 py-4 text-xl font-extrabold text-yellow-900 shadow-lg transition-all duration-200 hover:bg-yellow-500 hover:-translate-y-1 active:translate-y-0.5 active:shadow-md disabled:bg-gray-300 disabled:text-gray-500 disabled:transform-none"
              >
                {loading ? 'Entering...' : "Let's Go!"}
              </button>

              {error && (
                <p className="text-red-500 text-sm pt-2">
                  Oops! Check your details and try again.
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
