'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import SciencePuzzleSection from "@/components/SciencePuzzleSection"; // Ensure this component exists and works

// --- GraphQL Queries and Mutations ---
import { GET_FUN_IMAGE } from '@/graphql/queries';
import { GET_CHILD_BY_ID } from '@/graphql/queries';
import { GET_MY_ASSIGNMENTS } from '@/graphql/queries';
import { UPDATE_ASSIGNMENT_STATUS, UPDATE_CHILD_XP, ADD_CHILD_BADGE } from '@/graphql/mutations';

// --- Type Definitions ---
interface Child {
  id: string;
  name: string;
  age: number;
  xp: number;
  badges: string[];
}

interface Question {
  type: 'EXPLAIN' | 'SHORT_ANSWER' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  prompt: string;
  options?: string[]; // Optional for non-multiple choice
  answer?: string; // The correct answer from the server
}

interface Response {
  questionIndex: number;
  answer: string;
}

interface Evaluation {
  questionIndex: number;
  isCorrect: boolean;
  feedback?: string; // Feedback specific to this question from parent/server
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'PENDING' | 'COMPLETED' | 'EVALUATED'; // Updated to reflect Mongoose schema
  questions: Question[];
  responses?: Response[]; // Student's responses
  evaluation?: Evaluation[]; // Server's evaluation of responses
  feedback?: string; // Overall feedback from parent
  totalCorrect: number; // New: Total correct answers
  score: number; // New: Percentage score
  createdAt: string;
  completedAt?: string | null; // When the assignment was completed
}

interface GetChildByIdData {
  getChildById: Child;
}

interface GetMyAssignmentsData {
  getMyAssignments: Assignment[];
}

interface GetFunImageData {
  getFunImage: {
    imageUrl: string;
    explanation: string;
  };
}

export default function MidDashboard() {
  const { id } = useParams();
  const childId = typeof id === 'string' ? id : '';

  // --- Data Fetching ---
  const { data: childData, loading: childLoading, error: childError } = useQuery<GetChildByIdData>(GET_CHILD_BY_ID, {
    variables: { id: childId },
    skip: !childId,
  });

  const {
    data: assignmentsData,
    loading: assignmentsLoading,
    error: assignmentsError,
    refetch,
  } = useQuery<GetMyAssignmentsData>(GET_MY_ASSIGNMENTS);

  // Sort assignments: Most recent uncompleted first, then completed by most recent
  const sortedAssignments = [...(assignmentsData?.getMyAssignments ?? [])].sort((a, b) => {
    // Bring uncompleted to the top, then sort by createdAt descending
    const statusA = a.status;
    const statusB = b.status;

    // Prioritize 'PENDING' over 'COMPLETED' or 'EVALUATED'
    if (statusA === 'PENDING' && (statusB === 'COMPLETED' || statusB === 'EVALUATED')) return -1;
    if ((statusA === 'COMPLETED' || statusA === 'EVALUATED') && statusB === 'PENDING') return 1;

    // For completed/evaluated assignments, sort by completedAt if available, otherwise createdAt
    if ((statusA === 'COMPLETED' || statusA === 'EVALUATED') && (statusB === 'COMPLETED' || statusB === 'EVALUATED')) {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime; // Most recent completed first
    }

    // For pending assignments, sort by createdAt descending (most recent pending first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });


  // --- Mutations ---
  const [updateStatus] = useMutation(UPDATE_ASSIGNMENT_STATUS);
  const [updateChildXP] = useMutation(UPDATE_CHILD_XP);
  const [addChildBadge] = useMutation(ADD_CHILD_BADGE);

  const { loading: imageLoading, data: imageData, error: imageError } = useQuery<GetFunImageData>(GET_FUN_IMAGE);

  // --- Component State ---
  const [answers, setAnswers] = useState<Record<string, string>>({}); // For assignment text/radio answers
  const [inProgress, setInProgress] = useState<Record<string, boolean>>({}); // To track if an assignment is being worked on
  const [xpAnimating, setXpAnimating] = useState(false); // State for XP animation trigger

  // --- Handlers ---
  const handleInputChange = (assignmentQuestionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [assignmentQuestionId]: value }));
    const assignmentId = assignmentQuestionId.split('-')[0];
    // Set inProgress for the specific assignment
    setInProgress(prev => ({ ...prev, [assignmentId]: true }));
  };

  const handleSubmitAnswer = async (assignment: Assignment) => {
    const responsePayload = assignment.questions.map((q, index) => ({
      questionIndex: index,
      answer: answers[`${assignment.id}-${index}`] || '',
    }));

    const allQuestionsAnswered = responsePayload.every(res => res.answer.trim() !== '');

    if (!allQuestionsAnswered && assignment.questions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }

    if (!childData?.getChildById) {
      alert('Child data not loaded. Cannot submit assignment.');
      return;
    }

    const child = childData.getChildById;

    try {
      // The backend (updateAssignmentStatus resolver) is now responsible for:
      // 1. Setting status to 'COMPLETED' (or 'EVALUATED')
      // 2. Storing responses
      // 3. Calculating evaluation, totalCorrect, score
      // 4. Updating child XP and badges
      // 5. Sending parent notifications

      // Call updateStatus mutation
      await updateStatus({
        variables: {
          assignmentId: assignment.id,
          status: 'COMPLETED', // Or 'EVALUATED' if you prefer to skip 'COMPLETED'
          responses: responsePayload,
        },
      });

      // Refetch assignments data to reflect the changes, including evaluation, score, XP, and badges
      const { data: refetchedAssignmentsResult } = await refetch();
      const updatedAssignment = refetchedAssignmentsResult?.getMyAssignments.find(a => a.id === assignment.id);

      if (updatedAssignment) {
        // Trigger XP animation if XP has changed (or always for a visual cue)
        setXpAnimating(true);
        setTimeout(() => setXpAnimating(false), 1000); // Reset animation state after 1 second

        alert(`✅ Assignment "${updatedAssignment.title}" submitted and evaluated! You scored ${updatedAssignment.score.toFixed(0)}%!`);

        // Badges are now handled on the server.
        // You might want to display a toast notification here if the server pushParentNotification
        // mechanism doesn't directly update the client in real-time, or if you want an immediate client-side alert.
        // The XP and badge updates are now done in the backend `updateAssignmentStatus` mutation.
        // We just need to refetch to get the latest `child.xp` and `child.badges`.
        // The `updateChildXP` and `addChildBadge` mutations here are likely redundant if your backend is handling them.
        // If your backend *only* returns the assignment, and you still need to call XP/badge mutations, keep them.
        // But based on the backend resolver changes we discussed, they are integrated.
      } else {
        alert('Assignment submitted, but could not retrieve updated details.');
      }

      // Clear answers for the submitted assignment
      setAnswers(prev => {
        const newAnswers = { ...prev };
        assignment.questions.forEach((_, index) => {
          delete newAnswers[`${assignment.id}-${index}`];
        });
        return newAnswers;
      });
      // Set inProgress for this assignment to false
      setInProgress(prev => ({ ...prev, [assignment.id]: false }));

    } catch (err) {
      console.error("❌ ApolloError during assignment submission:", err);
      // More specific error handling could be added based on err.graphQLErrors
      alert('❌ Failed to submit assignment. Please try again.');
    }
  };

  // Helper function for badge classes
  const getBadgeClass = (badgeName: string) => {
    switch (badgeName) {
      case '🌟 Star Student': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '📖 Avid Reader': return 'bg-green-100 text-green-800 border-green-200';
      case '🏅 Assignment Ace': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'First Task': return 'bg-purple-100 text-purple-800 border-purple-200'; // Updated to 'First Task' as per server
      case 'Task Master': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Rising Star': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Hard Worker': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // --- Loading and Error States ---
  if (childLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl border-4 border-indigo-200 animate-fade-in-up">
          <svg className="animate-spin h-16 w-16 text-indigo-600 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-2xl font-bold text-gray-700 animate-pulse">Gathering your learning adventure... Hang tight! 🚀</p>
        </div>
      </div>
    );
  }

  if (childError || assignmentsError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-10 text-center bg-red-100 rounded-3xl shadow-xl border-4 border-red-400 animate-fade-in-up">
          <p className="text-2xl font-bold text-red-800 mb-6">
            ⚠️ Oh dear! Something went wrong!
          </p>
          <p className="text-lg text-red-700 mb-6">{childError?.message || assignmentsError?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-8 py-4 bg-red-600 text-white rounded-xl font-bold text-xl hover:bg-red-700 transition-all duration-300 shadow-lg transform hover:-translate-y-1"
          >
            Try Reloading the Page
          </button>
        </div>
      </div>
    );
  }

  // --- Child Profile Calculations ---
  const child = childData?.getChildById;
  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-700 text-xl">Child profile not found. Please select a child.</p>
      </div>
    );
  }

  const xp = child.xp || 0;
  const levelThreshold = 50; // XP needed for each level
  const level = Math.floor(xp / levelThreshold);
  const xpForCurrentLevel = xp % levelThreshold;
  const progress = (xpForCurrentLevel / levelThreshold) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4 sm:p-6 lg:p-8 mt-20 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- Child Profile Section --- */}
        <section className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-4 border-blue-200 overflow-hidden group">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-blue-50 opacity-50 rounded-2xl z-0">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 L 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-100 opacity-70" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(child.name || 'explorer')}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&flip=true`}
                alt="Child Avatar"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-lg object-cover mb-4 transform group-hover:scale-105 transition-transform duration-300 ease-out"
              />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-1 leading-tight">
                Hello, <span className="text-purple-600">{child.name}!</span>
              </h1>
              <p className="text-lg text-gray-600">Age: <span className="font-semibold text-blue-500">{child.age || 'N/A'}</span></p>
            </div>

            {/* Progress & Badges */}
            <div className="flex-1 w-full md:max-w-2xl mt-6 md:mt-0 space-y-5">
              {/* XP Progress */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl shadow-md border border-blue-100">
                <h2 className="text-xl font-bold text-indigo-700 mb-2 flex items-center">
                  <span className="mr-2 text-2xl">🌟</span> Your Progress
                </h2>
                <div className="flex items-center justify-between text-base font-medium mb-2">
                  <span className={`text-green-600 ${xpAnimating ? 'animate-bounce-quick' : ''}`}>XP: {xp}</span>
                  <span className="text-purple-600">Level {level}</span>
                  <span className="text-gray-500">{progress.toFixed(0)}% to Level {level + 1}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-lime-400 to-green-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Badges */}
              {child.badges?.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl shadow-md border border-yellow-100">
                  <h2 className="text-xl font-bold text-orange-700 mb-2 flex items-center">
                    <span className="mr-2 text-2xl">🏆</span> Your Badges
                  </h2>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {child.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className={`
                          ${getBadgeClass(badge)}
                          px-3 py-1.5 rounded-full text-sm font-semibold border
                          shadow-sm transform hover:scale-105 transition-transform duration-200 cursor-pointer
                        `}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (Assignments) - Takes 2/3 width on large screens */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-4 border-blue-200 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-8 flex items-center">
              <span className="mr-4 text-4xl">📚</span> Your Adventures
              {sortedAssignments.length > 0 && (
                <span className="ml-auto text-lg font-bold text-gray-500 bg-yellow-300 px-4 py-2 rounded-full shadow-inner hidden sm:inline-block">
                  ({sortedAssignments.filter(a => a.status === 'PENDING').length} pending)
                </span>
              )}
            </h2>
            <div className="space-y-6">
              {sortedAssignments.length === 0 ? (
                <p className="text-gray-500 italic text-xl text-center p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-lg">
                  No adventures assigned yet. Time to explore! 🗺️
                </p>
              ) : (
                sortedAssignments.map((assignment) => {
                  // The server now sends 'COMPLETED' or 'EVALUATED' for finished assignments
                  const isCompletedOrEvaluated = assignment.status === 'COMPLETED' || assignment.status === 'EVALUATED';
                  // InProgress status is client-side, set if user has typed something but not submitted
                  const isInProgressStatus = inProgress[assignment.id] && !isCompletedOrEvaluated;

                  const statusBadgeColor = isCompletedOrEvaluated
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : isInProgressStatus
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                      : 'bg-indigo-100 text-indigo-700 border-indigo-300'; // Default for PENDING

                  const statusBadgeLabel = isCompletedOrEvaluated
                    ? (assignment.status === 'EVALUATED' ? '✨ Evaluated' : '✅ Completed')
                    : isInProgressStatus
                      ? '✍️ In Progress'
                      : '🆕 New';

                  const difficultyColors = {
                    EASY: 'text-green-600 font-extrabold',
                    MEDIUM: 'text-yellow-600 font-extrabold',
                    HARD: 'text-red-600 font-extrabold',
                  };

                  return (
                    <div
                      key={assignment.id}
                      className={`
                        bg-white rounded-xl shadow-md p-5 border-b-4
                        ${isCompletedOrEvaluated ? 'border-green-100 opacity-90' : 'border-blue-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300'}
                      `}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                          <h3 className="font-extrabold text-xl sm:text-2xl text-blue-800 mb-1">{assignment.title}</h3>
                          <p className={`text-base ${difficultyColors[assignment.difficulty] || 'text-gray-600'}`}>
                            Difficulty: {assignment.difficulty || 'N/A'}
                          </p>
                        </div>
                        <span
                          className={`mt-2 sm:mt-0 px-3 py-1.5 rounded-full text-sm font-semibold border ${statusBadgeColor}`}
                        >
                          {statusBadgeLabel}
                        </span>
                      </div>
                      <p className="mb-5 text-gray-700 text-base leading-relaxed">{assignment.description}</p>

                      {/* Display Score and Correct Answers if Completed or Evaluated */}
                      {isCompletedOrEvaluated && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-sm flex flex-col sm:flex-row justify-around items-center text-center sm:text-left space-y-2 sm:space-y-0">
                          <p className="text-lg font-bold text-blue-700">
                            Score: <span className="text-purple-600">{assignment.score.toFixed(0)}%</span>
                          </p>
                          <p className="text-lg font-bold text-blue-700">
                            Correct: <span className="text-green-600">{assignment.totalCorrect}</span> / <span className="text-gray-600">{assignment.questions.length}</span>
                          </p>
                          {assignment.completedAt && (
                              <p className="text-sm text-gray-500">
                                Completed on: {new Date(assignment.completedAt).toLocaleDateString()}
                              </p>
                          )}
                        </div>
                      )}

                      {/* Show questions if not completed */}
                      {!isCompletedOrEvaluated && assignment.questions?.length > 0 && (
                        <div className="space-y-4 border-t pt-4 mt-4 border-gray-100">
                          <h4 className="text-lg font-bold text-gray-700 flex items-center">
                            <span className="mr-2 text-indigo-500">✍️</span> Your Turn:
                          </h4>
                          {assignment.questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                              <p className="font-bold text-base mb-2 text-gray-800">
                                <span className="text-blue-600 mr-2">{qIndex + 1}.</span> {q.prompt}
                              </p>

                              {q.type === 'EXPLAIN' || q.type === 'SHORT_ANSWER' ? (
                                <textarea
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800 focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 shadow-sm"
                                  rows={3}
                                  placeholder="Type your answer here..."
                                  value={answers[`${assignment.id}-${qIndex}`] || ''}
                                  onChange={(e) => handleInputChange(`${assignment.id}-${qIndex}`, e.target.value)}
                                />
                              ) : null}

                              {q.type === 'MULTIPLE_CHOICE' && q.options && (
                                <div className="space-y-1">
                                  {q.options.map((opt, optIndex) => (
                                    <label key={optIndex} className="flex items-center p-2 rounded-md cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                                      <input
                                        type="radio"
                                        name={`mc-${assignment.id}-${qIndex}`}
                                        value={opt}
                                        checked={answers[`${assignment.id}-${qIndex}`] === opt}
                                        onChange={() => handleInputChange(`${assignment.id}-${qIndex}`, opt)}
                                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      />
                                      <span className="text-gray-800 text-sm">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {q.type === 'TRUE_FALSE' && (
                                <div className="flex space-x-4">
                                  {["True", "False"].map((boolOpt) => (
                                    <label key={boolOpt} className="flex items-center p-2 rounded-md cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                                      <input
                                        type="radio"
                                        name={`tf-${assignment.id}-${qIndex}`}
                                        value={boolOpt}
                                        checked={answers[`${assignment.id}-${qIndex}`] === boolOpt}
                                        onChange={() => handleInputChange(`${assignment.id}-${qIndex}`, boolOpt)}
                                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      />
                                      <span className="text-gray-800 text-sm">{boolOpt}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            className="w-full bg-indigo-500 text-white py-3 rounded-lg text-lg font-bold hover:bg-indigo-600 transition-colors duration-300 shadow-md transform hover:scale-[1.005] flex items-center justify-center"
                            onClick={() => handleSubmitAnswer(assignment)}
                          >
                            Send My Answers <span className="ml-2">🚀</span>
                          </button>
                        </div>
                      )}

                      {/* Display Results and Feedback if Completed/Evaluated */}
                      {isCompletedOrEvaluated && (
                        <div className="space-y-3 border-t pt-4 mt-4 border-gray-100">
                          <h4 className="text-lg font-bold text-gray-700 flex items-center">
                            <span className="mr-2 text-indigo-500">🌟</span> Your Results:
                          </h4>
                          {assignment.questions.map((q, qIndex) => {
                            const evaluation = assignment.evaluation?.find(e => e.questionIndex === qIndex);
                            const response = assignment.responses?.find(r => r.questionIndex === qIndex); // Get student's response

                            return (
                              <div key={qIndex} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                                <p className="font-bold text-base mb-2 text-gray-800">
                                  <span className="text-blue-600 mr-2">{qIndex + 1}.</span> {q.prompt}
                                </p>
                                {response && (
                                  <p className="text-sm text-gray-600 italic">
                                    Your Answer: <span className="font-semibold text-purple-600">{response.answer}</span>
                                  </p>
                                )}
                                {q.answer && ( // Show correct answer if available (e.g., for MC, TF)
                                  <p className="text-sm text-gray-600 italic">
                                    Correct Answer: <span className="font-semibold text-green-600">{q.answer}</span>
                                  </p>
                                )}
                                {evaluation && (
                                  <div className="mt-2">
                                    <p className={`font-semibold text-sm ${evaluation.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                      {evaluation.isCorrect ? 'Correct! 🎉' : 'Incorrect 😔'}
                                    </p>
                                    {evaluation.feedback && (
                                      <p className="text-sm text-gray-700 mt-1">
                                        Server feedback for this question: <span className="italic">{evaluation.feedback}</span>
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {assignment.feedback && (
                        <div className="mt-4 p-4 bg-purple-50 border-l-4 border-purple-400 rounded-lg text-base text-gray-800 shadow-sm">
                          <span className="font-bold text-purple-800 flex items-center mb-1">
                            <span className="text-xl mr-2">💬</span> Overall Parent's Note:
                          </span>
                          <p>{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Right Column (AI Image & Puzzle) - Takes 1/3 width on large screens */}
          <div className="lg:col-span-1 space-y-8">
            {/* AI Image Section */}
            <section className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-4 border-purple-200 animate-fade-in-up delay-200">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-700 mb-6 flex items-center">
                <span className="mr-3 text-3xl">💡</span> Discover with AI
              </h2>

              {imageLoading && (
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl shadow-inner">
                  <svg className="animate-spin h-10 w-10 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-center text-gray-500 italic text-md">Conjuring a new image... 🎨</p>
                </div>
              )}

              {imageData?.getFunImage && (
                <div className="mt-4 text-center">
                  <img
                    src={imageData.getFunImage.imageUrl}
                    alt="AI Generated Learning Image"
                    className="mx-auto rounded-lg shadow-lg w-full max-w-sm object-cover border-2 border-purple-300 transform hover:scale-[1.02] transition-transform duration-300"
                  />
                  <p className="text-md text-gray-700 mt-4 leading-relaxed p-3 bg-purple-50 rounded-lg shadow-inner border border-purple-100">
                    <span className="font-semibold text-purple-800">Explanation:</span> {imageData.getFunImage.explanation}
                  </p>
                </div>
              )}
              {imageError && (
                <p className="text-red-600 text-center p-4 bg-red-50 rounded-lg border border-red-200 text-sm">Error loading image: {imageError.message}.</p>
              )}
            </section>

            {/* Science Puzzle Section */}
            <section className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-4 border-green-200 animate-fade-in-up delay-400">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-green-700 mb-6 flex items-center">
                <span className="mr-3 text-3xl">🧪</span> Science Challenge
              </h2>
              <p className="text-md text-gray-700 mb-6 leading-relaxed">
                Test your science smarts and earn bonus XP!
              </p>
              {/* This is where your actual SciencePuzzleSection component would render */}
              <SciencePuzzleSection childId={childId} /> {/* Pass childId if SciencePuzzleSection needs it */}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}