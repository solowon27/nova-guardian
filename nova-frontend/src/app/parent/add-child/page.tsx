'use client';

import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// GraphQL Mutation for creating a child profile
const CREATE_CHILD = gql`
  mutation CreateChildProfile(
    $name: String!
    $age: Int!
    $username: String!
    $password: String!
  ) {
    createChildProfile(name: $name, age: $age, username: $username, password: $password) {
      id
      name
      age
    }
  }
`;

export default function AddChildPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    age: '',
    username: '',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  const [createChild, { loading, error }] = useMutation(CREATE_CHILD, {
    onCompleted: () => {
      setSuccessMessage("Child profile created successfully! Redirecting...");
      setTimeout(() => {
        router.push('/parent');
      }, 2000); // Redirect after 2 seconds
    },
    onError: (err) => {
      // Error is already handled by the 'error' state from useMutation, but we can log it here.
      console.error("Error creating child:", err);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear success message if user starts typing again
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(''); // Clear any previous success messages

    try {
      await createChild({
        variables: {
          name: form.name,
          age: parseInt(form.age),
          username: form.username,
          password: form.password
        }
      });
      // The onCompleted callback will handle setting success message and redirection
    } catch (err) {
      // Error state from useMutation will handle displaying the error message
      console.error("Submission error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-purple-100 to-blue-200 p-4">
      <div className="bg-white shadow-2xl rounded-xl w-full max-w-md p-8 border border-gray-100 transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6 flex items-center justify-center space-x-2">
          <span role="img" aria-label="add child emoji">✨</span>
          <span>Add New Child Profile</span>
          <span role="img" aria-label="child emoji">👶</span>
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Fill out the details below to create a new profile for your child.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Child's Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Alex"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              id="age"
              name="age"
              type="number"
              placeholder="e.g., 7"
              value={form.age}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              min="0" // Assuming age cannot be negative
              max="18" // You might want to set a max age for "child" profiles
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Unique username for your child"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Set a password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition duration-300 ease-in-out ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Child...
              </span>
            ) : (
              'Add Child Profile'
            )}
          </button>

          {successMessage && (
            <p className="text-green-600 text-center text-sm font-medium mt-3 animate-fade-in">
              {successMessage}
            </p>
          )}

          {error && (
            <p className="text-red-500 text-center text-sm mt-3 animate-fade-in">
              Error: {error.message || "Something went wrong. Please try again."}
            </p>
          )}
        </form>

        <div className="mt-8 text-center text-gray-500">
          <p>This information is used to create a unique learning experience for your child.</p>
        </div>
      </div>
    </div>
  );
}