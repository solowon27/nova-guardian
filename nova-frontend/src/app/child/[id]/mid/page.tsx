'use client';

import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios'; // Keeping axios for potential future API calls, though not strictly needed after trivia removal
import { fetchImageExplanation } from '@/utils/openai'; // Keeping this import as it's used for the AI Image section
import SciencePuzzleSection from "@/components/SciencePuzzleSection";

// --- GraphQL Queries and Mutations ---
import { GET_FUN_IMAGE } from '@/graphql/queries'; // Assuming this is the query for the AI image
import { GET_CHILD_BY_ID } from '@/graphql/queries';
import { GET_MY_ASSIGNMENTS } from '@/graphql/queries';
import { UPDATE_ASSIGNMENT_STATUS, UPDATE_CHILD_XP, ADD_CHILD_BADGE } from '@/graphql/mutations';

// --- Type Definitions (Added for better type safety) ---
interface Child {
  id: string;
  name: string;
  age: number;
  xp: number;
  badges: string[];
}

interface Question {
  prompt: string;
  type: 'EXPLAIN' | 'SHORT_ANSWER' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  options?: string[]; // Optional for non-multiple choice
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  questions: Question[];
  feedback?: string;
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

// --- END Mock GraphQL operations ---


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

  const assignments = assignmentsData?.getMyAssignments ?? [];

  // --- Mutations ---
  const [updateStatus] = useMutation(UPDATE_ASSIGNMENT_STATUS);
  const [updateChildXP] = useMutation(UPDATE_CHILD_XP); // Still used for general XP updates
  const [addChildBadge] = useMutation(ADD_CHILD_BADGE); // Still used for general badge updates

  const { loading: imageLoading, data: imageData, error: imageError } = useQuery<GetFunImageData>(GET_FUN_IMAGE);

  // --- Component State ---
  const [answers, setAnswers] = useState<Record<string, string>>({}); // For assignment text/radio answers
  const [inProgress, setInProgress] = useState<Record<string, boolean>>({}); // To track if an assignment is being worked on

  // Profile Specific States - Keeping minimal necessary for subtle effects
  const [previousXp, setPreviousXp] = useState(0); // To trigger XP animation on change

  // --- Handlers ---
  const handleInputChange = (assignmentQuestionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [assignmentQuestionId]: value }));
    const assignmentId = assignmentQuestionId.split('-')[0];
    setInProgress(prev => ({ ...prev, [assignmentId]: true }));
  };


  const handleSubmitAnswer = async (assignment: Assignment) => { // Explicitly type 'assignment'
    const responsePayload = assignment.questions.map((q, index) => ({
      questionIndex: index,
      answer: answers[`${assignment.id}-${index}`] || '',
    }));

    const allQuestionsAnswered = responsePayload.every(res => res.answer.trim() !== '');

    if (!allQuestionsAnswered && assignment.questions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }

    // Ensure child data is available before proceeding
    if (!childData?.getChildById) {
      alert('Child data not loaded. Cannot submit assignment.');
      return;
    }

    const child = childData.getChildById; // Now 'child' is guaranteed to exist and be typed

    try {
      await updateStatus({
        variables: {
          assignmentId: assignment.id,
          status: 'COMPLETED',
          responses: responsePayload, // Keep this if you want responses sent
        },
      });
      alert('✅ Assignment submitted successfully! You earned XP!'); // Enhanced alert message
      refetch();
      setAnswers(prev => {
        const newAnswers = { ...prev };
        assignment.questions.forEach((_, index) => {
          delete newAnswers[`${assignment.id}-${index}`];
        });
        return newAnswers;
      });
      setInProgress(prev => ({ ...prev, [assignment.id]: false }));

      // Simulate XP gain and badge award
      const xpGain = assignment.difficulty === 'EASY' ? 10 : assignment.difficulty === 'MEDIUM' ? 20 : 30;
      await updateChildXP({ variables: { childId: child.id, xp: child.xp + xpGain } });

      // Example: Award a badge for completing their first assignment
      const completedAssignmentsCount = assignments.filter(a => a.status === 'COMPLETED').length;
      // This logic checks if 'completedAssignmentsCount' was 0 *before* this submission
      // which is tricky with `refetch` being asynchronous.
      // A more robust check might involve checking the current child's badges or
      // passing the *previous* state of completed assignments.
      // For simplicity and to match the original intent, we'll keep it as is for now.
      if (completedAssignmentsCount === 0) {
        await addChildBadge({ variables: { childId: child.id, badge: 'First Task Challenger' } });
        alert('🎉 You earned a new badge: First Task Challenger!');
      }

    } catch (err) {
      console.error("❌ ApolloError during assignment submission:", err);
      alert('❌ Failed to submit assignment. Please try again.');
    }
  };

  // --- EFFECTS FOR ANIMATIONS & LOGIC ---

  // XP change effect for subtle highlight
  useEffect(() => {
    if (childData?.getChildById?.xp !== undefined) {
      const currentXp = childData.getChildById.xp;
      if (currentXp > previousXp) {
        // Trigger a visual effect here, e.g., a temporary glow on the XP bar
        // For now, just update the previousXp
      }
      setPreviousXp(currentXp);
    }
  }, [childData?.getChildById?.xp, previousXp]);

  // Helper function for badge props (simplified, no need for dynamic icons if you just want text)
  const getBadgeClass = (badgeName: string) => { // Explicitly type 'badgeName'
    switch (badgeName) {
      case '🌟 Star Student': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '📖 Avid Reader': return 'bg-green-100 text-green-800 border-green-200';
      case '🏅 Assignment Ace': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'First Task Challenger': return 'bg-teal-100 text-teal-800 border-teal-200'; // Renamed for more flair
      case 'Task Master': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Rising Star': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Hard Worker': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // --- Loading and Error States ---
  if (childLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-10 bg-white rounded-2xl shadow-2xl animate-fade-in-up">
          <svg className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-2xl font-semibold text-gray-700">Loading your adventure... Please wait! 🚀</p>
        </div>
      </div>
    );
  }

  if (childError || assignmentsError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-10 text-center bg-red-100 rounded-2xl shadow-2xl border-2 border-red-400 animate-fade-in-up">
          <p className="text-2xl font-bold text-red-800 mb-6">
            ⚠️ Oh no! Something went wrong!
          </p>
          <p className="text-lg text-red-700 mb-6">{childError?.message || assignmentsError?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-8 py-4 bg-red-600 text-white rounded-lg font-bold text-xl hover:bg-red-700 transition-colors duration-300 shadow-md transform hover:-translate-y-1"
          >
            Try Reloading the Page
          </button>
        </div>
      </div>
    );
  }

  // --- Child Profile Calculations ---
  // Ensure child is not null before destructuring or accessing properties
  const child = childData?.getChildById;
  if (!child) {
    // This case should ideally be caught by the childError check,
    // but as a fallback, we can render a simple message or redirect.
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <p className="text-red-700">Child profile not found.</p>
      </div>
    );
  }

  const xp = child.xp || 0;
  const levelThreshold = 50; // XP needed for each level
  const level = Math.floor(xp / levelThreshold);
  const xpForCurrentLevel = xp % levelThreshold;
  const progress = (xpForCurrentLevel / levelThreshold) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 lg:p-10 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Child Profile Section - Enhanced Design */}
        <section className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center border-4 border-blue-300 transform hover:scale-[1.005] transition-transform duration-300 ease-out overflow-hidden">
          {/* Background Gradient & Pattern */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 opacity-70 rounded-3xl z-0">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="dot-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="currentColor" className="text-blue-200 opacity-30" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dot-pattern)" />
            </svg>
          </div>

          {/* 🎯 Avatar Placement */}
          <div className="absolute top-0 right-8 transform -translate-y-1/2 z-10">
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(child.name || 'explorer')}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf`}
              alt="Child Avatar"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-6 border-white shadow-xl object-cover animate-bounce-subtle"
            />
          </div>

          <div className="relative z-10 text-left"> {/* Align content to left */}
            {/* 👋 Greeting */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-800 mb-3 drop-shadow-md">
              Hey, <span className="text-blue-600 font-bold">{child.name || 'Explorer'}!</span> 👋
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Age: <span className="font-semibold text-blue-700">{child.age || 'N/A'}</span>
            </p>

            {/* 🚀 Progress Bar */}
            <div className="mb-8 p-4 bg-blue-50 rounded-xl shadow-inner border border-blue-200">
              <h2 className="text-xl font-bold text-indigo-700 mb-3 flex items-center">
                <span className="mr-2 text-2xl">🚀</span> Your Progress
              </h2>
              <div className="flex items-center justify-between gap-4 text-sm sm:text-base">
                <span className="text-green-600 font-bold">XP: {xp}</span>
                <span className="text-purple-600 font-bold">Level {level}</span>
                <span className="text-gray-500">{progress.toFixed(0)}% to next level</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mt-3 overflow-hidden shadow-md">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-lime-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* 🏅 Badges */}
            {child.badges?.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl shadow-inner border border-yellow-200">
                <h2 className="text-xl font-bold text-yellow-800 mb-3 flex items-center">
                  <span className="mr-2 text-2xl">🏅</span> Your Badges
                </h2>
                <div className="flex flex-wrap gap-3">
                  {child.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className={`
                        ${getBadgeClass(badge)}
                        px-4 py-2 rounded-full text-sm font-semibold border
                        shadow-sm hover:scale-105 transition-transform duration-200 cursor-pointer
                      `}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Assignments & AI Image/Science Puzzle Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Assignments */}
          <section className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-blue-200 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-8 flex items-center">
              <span className="mr-4 text-4xl">📋</span> Your Assignments
              {assignments.length > 0 && (
                <span className="ml-auto text-lg font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-full shadow-inner">
                  ({assignments.filter(a => a.status !== 'COMPLETED').length} pending)
                </span>
              )}
            </h2>
            <div className="space-y-6">
              {assignments.length === 0 ? (
                <p className="text-gray-500 italic text-xl text-center p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-lg">
                  No assignments assigned yet. Time for a new challenge! 🎉
                </p>
              ) : (
                assignments.map((assignment) => {
                  const isCompleted = assignment.status === 'COMPLETED';
                  const isInProgressStatus = inProgress[assignment.id] && !isCompleted;

                  const statusBadgeColor = isCompleted
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : isInProgressStatus
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                      : 'bg-blue-100 text-blue-700 border-blue-300';

                  const statusBadgeLabel = isCompleted
                    ? '✅ Completed'
                    : isInProgressStatus
                      ? '✍️ In Progress'
                      : '🆕 New';

                  const difficultyColors = {
                    EASY: 'text-green-600 font-extrabold',
                    MEDIUM: 'text-yellow-600 font-extrabold',
                    HARD: 'text-red-600 font-extrabold',
                  };

                  return (
                    <div key={assignment.id} className="bg-white rounded-2xl shadow-xl p-6 border-b-4 border-blue-100 transition-all duration-300 hover:shadow-2xl hover:border-purple-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div>
                          <h3 className="font-extrabold text-2xl text-blue-800 mb-1">{assignment.title}</h3>
                          <p className={`text-base ${difficultyColors[assignment.difficulty] || 'text-gray-600'}`}>
                            Difficulty: {assignment.difficulty || 'N/A'}
                          </p>
                        </div>
                        <span
                          className={`mt-2 sm:mt-0 px-4 py-1.5 rounded-full text-sm font-semibold border ${statusBadgeColor}`}
                        >
                          {statusBadgeLabel}
                        </span>
                      </div>
                      <p className="mb-5 text-gray-700 text-base leading-relaxed">{assignment.description}</p>

                      {!isCompleted && assignment.questions?.length > 0 && (
                        <div className="space-y-5 border-t pt-5 mt-5 border-gray-100">
                          <h4 className="text-xl font-bold text-gray-700 flex items-center">
                            <span className="mr-2 text-blue-500">❓</span> Your Answers:
                          </h4>
                          {assignment.questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-5 bg-gray-50 rounded-xl shadow-inner border border-gray-100">
                              <p className="font-bold text-lg mb-3 text-gray-800">
                                <span className="text-indigo-600 mr-2">{qIndex + 1}.</span> {q.prompt}
                              </p>

                              {q.type === 'EXPLAIN' || q.type === 'SHORT_ANSWER' ? (
                                <textarea
                                  className="w-full border border-gray-300 rounded-lg p-3 text-base text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
                                  rows={4}
                                  placeholder="Type your answer here..."
                                  value={answers[`${assignment.id}-${qIndex}`] || ''}
                                  onChange={(e) => handleInputChange(`${assignment.id}-${qIndex}`, e.target.value)}
                                />
                              ) : null}

                              {q.type === 'MULTIPLE_CHOICE' && q.options && ( // Ensure options exist
                                <div className="space-y-2">
                                  {q.options.map((opt, optIndex) => (
                                    <label key={optIndex} className="flex items-center p-2 rounded-md cursor-pointer hover:bg-blue-100 transition-colors duration-200">
                                      <input
                                        type="radio"
                                        name={`mc-${assignment.id}-${qIndex}`}
                                        value={opt}
                                        checked={answers[`${assignment.id}-${qIndex}`] === opt}
                                        onChange={() => handleInputChange(`${assignment.id}-${qIndex}`, opt)}
                                        className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      />
                                      <span className="text-gray-800 text-base">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {q.type === 'TRUE_FALSE' && (
                                <div className="flex space-x-6">
                                  {["True", "False"].map((boolOpt) => (
                                    <label key={boolOpt} className="flex items-center p-2 rounded-md cursor-pointer hover:bg-blue-100 transition-colors duration-200">
                                      <input
                                        type="radio"
                                        name={`tf-${assignment.id}-${qIndex}`}
                                        value={boolOpt}
                                        checked={answers[`${assignment.id}-${qIndex}`] === boolOpt}
                                        onChange={() => handleInputChange(`${assignment.id}-${qIndex}`, boolOpt)}
                                        className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      />
                                      <span className="text-gray-800 text-base">{boolOpt}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-indigo-700 transition-colors duration-300 shadow-lg transform hover:scale-[1.01] flex items-center justify-center"
                            onClick={() => handleSubmitAnswer(assignment)}
                          >
                            📤 Submit Assignment <span className="ml-2">🎉</span>
                          </button>
                        </div>
                      )}

                      {isCompleted && (
                        <p className="text-base text-green-700 mt-4 italic font-semibold text-center p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm">
                          ✅ Assignment Completed! Fantastic work!
                        </p>
                      )}

                      {assignment.feedback && (
                        <div className="mt-4 p-5 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl text-base text-gray-800 shadow-md">
                          <span className="font-bold text-yellow-800 flex items-center mb-2">
                            <span className="text-2xl mr-2">💬</span> Parent Feedback:
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

          {/* Right Column: AI Image and Science Puzzle */}
          <div className="space-y-8">
            <section className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-indigo-200 animate-fade-in-up delay-200">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 mb-8 flex items-center">
                <span className="mr-4 text-4xl">🎨</span> Learn Through AI Images
              </h2>

              {imageLoading && (
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl shadow-inner">
                  <svg className="animate-spin h-10 w-10 text-indigo-400 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-center text-gray-500 italic text-lg">Generating today’s surprise image... Get ready! 🖼️</p>
                </div>
              )}

              {imageData?.getFunImage && (
                <div className="mt-4 text-center">
                 <img
  src={imageData.getFunImage.imageUrl} // The main image source
  alt="AI Generated Learning Image"
  className="mx-auto rounded-xl shadow-lg w-full max-w-sm sm:max-w-md object-cover border-2 border-indigo-300 transform hover:scale-[1.02] transition-transform duration-300"
  // Removed onError prop completely
/>

                  <p className="text-lg text-gray-700 mt-6 leading-relaxed p-4 bg-indigo-50 rounded-xl shadow-inner border border-indigo-100">
                    <span className="font-semibold text-indigo-800">Explanation:</span> {imageData.getFunImage.explanation}
                  </p>
                </div>
              )}
              {imageError && (
                   <p className="text-red-600 text-center p-4 bg-red-50 rounded-lg border border-red-200">Error loading image: {imageError.message}. Please try again later.</p>
               )}
            </section>

            {/* Science Puzzle Section - (Assuming this component is self-contained) */}
            <section className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200 animate-fade-in-up delay-400">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-green-700 mb-8 flex items-center">
                <span className="mr-4 text-4xl">🔬</span> Science Puzzle Challenge
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Dive into an exciting science puzzle to test your knowledge and earn extra XP!
              </p>
              {/* This is where your actual SciencePuzzleSection component would render */}
              <SciencePuzzleSection />
              <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-inner text-center text-gray-600 italic">
                [Science Puzzle Component Renders Here]
                <p className="mt-4 text-sm">
                  (Integrate your `SciencePuzzleSection` component here for an interactive experience.)
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}