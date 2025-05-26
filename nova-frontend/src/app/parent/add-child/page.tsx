'use client';

import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

  const [createChild, { loading, error }] = useMutation(CREATE_CHILD);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createChild({
      variables: {
        name: form.name,
        age: parseInt(form.age),
        username: form.username,
        password: form.password
      }
    });

    router.push('/parent');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 px-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center mb-4">➕ Add New Child</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Child's Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
            required
          />
          <input
            name="age"
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
            required
          />
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
          >
            {loading ? 'Adding...' : 'Add Child'}
          </button>
          {error && <p className="text-red-500 text-sm">{error.message}</p>}
        </form>
      </div>
    </div>
  );
}