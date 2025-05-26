'use client';

import { gql, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';

const GET_CHILD_BY_ID = gql`
  query GetChildById($id: ID!) {
    getChildById(id: $id) {
      name
      age
    }
  }
`;

export default function YoungDashboard() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_CHILD_BY_ID, {
    variables: { id },
  });

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>;

  const child = data?.getChildById;

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-pink-600">
        🧸 Hello, {child.name}! (Age {child.age})
      </h1>
      <p className="mt-2 text-gray-700">Welcome to the teen Explorer Zone!</p>
    </div>
    );
}