'use client';

import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// GraphQL Mutation (UNCHANGED, assuming it's correctly defined)
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
  // Destructure loading and error for direct use, and rename mutation function for clarity
  const [executeLogin, { loading, error }] = useMutation(LOGIN_CHILD);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Execute the login mutation
      const { data } = await executeLogin({ variables: form });

      // Check if login was successful and token is received
      if (data?.loginChild?.token) {
        localStorage.setItem('token', data.loginChild.token); // Store token

        // Redirect based on child's age
        const { id, age } = data.loginChild.child;
        if (age >= 3 && age <= 6) {
          router.push(`/child/${id}/young`);
        } else if (age >= 7 && age <= 10) {
          router.push(`/child/${id}/mid`);
        } else {
          router.push(`/child/${id}/teen`);
        }
      } else {
        // Handle cases where token is not returned but no GraphQL error is thrown
        console.error("Login successful but no token received.");
        // Optionally display a generic error message if no specific error was caught by Apollo
      }
    } catch (err: any) {
      // Apollo Client will set the 'error' state, so no need for an extra alert here.
      console.error("Login failed:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md text-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-300/50">
        <div className="mb-6">
          {/* Playful icon/emoji for the login page */}
          <span className="text-6xl sm:text-7xl mb-4 block animate-bounce-subtle">✨</span>
          <h2 className="text-4xl font-extrabold text-purple-800 mb-2 leading-tight">
            Hello, Little Learner!
          </h2>
          <p className="text-base text-gray-600">
            Hop in to start your adventure!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              name="username"
              type="text"
              placeholder="Your Secret Name"
              value={form.username}
              onChange={handleChange}
              className="w-full px-5 py-3 border border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 text-lg placeholder-purple-400 font-medium text-gray-800"
              required
              aria-label="Username"
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Your Magic Word"
              value={form.password}
              onChange={handleChange}
              className="w-full px-5 py-3 border border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 text-lg placeholder-purple-400 font-medium text-gray-800"
              required
              aria-label="Password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-xl font-bold text-xl transition-all duration-300 transform hover:-translate-y-1 ${
              loading
                ? 'bg-purple-300 cursor-not-allowed flex items-center justify-center'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entering...
              </>
            ) : (
              'Let\'s Go!'
            )}
          </button>
          {error && (
            <p className="text-red-600 text-sm mt-3 p-2 bg-red-50 rounded-lg border border-red-200 animate-fade-in">
              Oops! {error.message}. Please check your secret name and magic word.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}