'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';

const GET_CHILD_BY_ID = gql`
  query GetChildById($id: ID!) {
    getChildById(id: $id) {
      name
      age
    }
  }
`;

const GET_ASSIGNMENTS = gql`
  query GetAssignmentsByChild($childId: ID!) {
    getAssignmentsByChild(childId: $childId) {
      id
      title
      description
      status
    }
  }
`;

const UPDATE_ASSIGNMENT_STATUS = gql`
  mutation UpdateAssignmentStatus($assignmentId: ID!, $status: String!) {
    updateAssignmentStatus(assignmentId: $assignmentId, status: $status) {
      id
      status
    }
  }
`;

export default function YoungDashboard() {
  const { id } = useParams();
  const childId = typeof id === 'string' ? id : '';

  const { data: childData, loading: childLoading, error: childError } = useQuery(GET_CHILD_BY_ID, {
    variables: { id: childId },
    skip: !childId,
  });

  const {
    data: assignmentsData,
    loading: assignmentsLoading,
    error: assignmentsError,
    refetch,
  } = useQuery(GET_ASSIGNMENTS, {
    variables: { childId },
    skip: !childId,
  });

  const [updateStatus] = useMutation(UPDATE_ASSIGNMENT_STATUS);

  const handleComplete = async (assignmentId: string) => {
    try {
      await updateStatus({
        variables: {
          assignmentId,
          status: 'COMPLETED',
        },
      });
      refetch();
    } catch (err) {
      console.error("❌ Mutation error:", err);
    }
  };

  if (childLoading || assignmentsLoading) return <p className="p-6">Loading...</p>;
  if (childError || assignmentsError)
    return (
      <p className="p-6 text-red-500">
        ⚠️ Error: {childError?.message || assignmentsError?.message}
      </p>
    );

  const child = childData?.getChildById;
  const assignments = assignmentsData?.getAssignmentsByChild ?? [];

  return (
    <div className="p-6 text-center bg-yellow-50 min-h-screen">
      <h1 className="text-2xl font-extrabold text-orange-500 mb-4">
        🐥 Hi there, {child?.name || 'Kiddo'}!
      </h1>
      <p className="mb-6 text-lg text-gray-700">
        Let's play and learn with fun little tasks!
      </p>

      <div className="space-y-4 max-w-lg mx-auto">
        {assignments.length === 0 ? (
          <p className="text-gray-500 italic">No tasks yet, enjoy your day!</p>
        ) : (
          assignments.map((assignment: any) => (
            <div
              key={assignment.id}
              className="bg-white border-4 border-pink-200 shadow-lg rounded-xl p-4"
            >
              <h2 className="font-bold text-lg text-pink-600">{assignment.title}</h2>
              <p className="text-gray-700">{assignment.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                Status: {assignment.status}
              </p>
              {assignment.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleComplete(assignment.id)}
                  className="mt-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-full text-sm transition"
                >
                  ✅ I Did It!
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}