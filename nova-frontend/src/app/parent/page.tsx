'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// --- GraphQL Queries and Mutations (UNCHANGED, assuming these are properly defined elsewhere) ---
import { GET_PARENT_NOTIFICATIONS } from '@/graphql/queries';
import { GET_CHILDREN } from '@/graphql/queries';
import { GET_ASSIGNMENTS_FOR_CHILD } from '@/graphql/queries';
import { CREATE_ASSIGNMENT, UPDATE_ASSIGNMENT_FEEDBACK } from '@/graphql/mutations';

// --- TypeScript Interfaces ---

// Define possible question types
type QuestionType = 'EXPLAIN' | 'SHORT_ANSWER' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type AssignmentStatus = 'COMPLETED' | 'IN_PROGRESS' | 'NEW';

interface Child {
  id: string;
  _id?: string; // Add _id for flexibility if your backend uses it
  name: string;
  age: number;
  // Add other child properties if they exist in your GraphQL schema
}

interface Notification {
  message: string;
  date: string | Date; // Date can be string from API, convert to Date object
  // Add other notification properties if they exist
}

interface Question {
  type: QuestionType;
  prompt: string;
  options?: string[]; // Optional for non-multiple choice questions
  answer?: string; // Optional, for auto-grading/reference
}

interface Response {
  questionIndex: number;
  answer: string;
  // Add other response properties if they exist
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  status: AssignmentStatus;
  questions: Question[];
  responses: Response[]; // Array of child's responses to questions
  feedback?: string; // Optional feedback from parent
  // Add other assignment properties if they exist
}

interface GetChildrenData {
  getMyChildren?: Child[]; // Make it optional as it might be undefined if data hasn't arrived
}

interface GetParentNotificationsData {
  getParentNotifications?: Notification[]; // Make it optional
}

interface GetAssignmentsForChildData {
  getAssignmentsForChild?: Assignment[]; // Make it optional
}

// Define the shape of variables for createAssignment mutation
interface CreateAssignmentVariables {
  childId: string;
  title: string;
  description: string;
  questions: Question[];
  difficulty: Difficulty;
}

// Define the shape of variables for updateAssignmentFeedback mutation
interface UpdateAssignmentFeedbackVariables {
  assignmentId: string;
  feedback: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  // Explicitly type useState hooks
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [questions, setQuestions] = useState<Question[]>([]);
  // feedbackMap can store feedback for multiple assignments by their ID
  const [feedbackMap, setFeedbackMap] = useState<{ [key: string]: string }>({});
  const [showAllNotifications, setShowAllNotifications] = useState<boolean>(false);

  // --- Data Fetching ---
  // Apply interfaces to useQuery hooks
  const { data: childrenData, loading: childrenLoading, error: childrenError } = useQuery<GetChildrenData>(GET_CHILDREN);

  const { data: inboxData, refetch: refetchNotifications } = useQuery<GetParentNotificationsData>(
    GET_PARENT_NOTIFICATIONS,
    {
      variables: { limit: showAllNotifications ? null : 5 }
    }
  );

  const { data: assignmentsData, refetch: refetchAssignments, loading: assignmentsLoading } = useQuery<GetAssignmentsForChildData>(GET_ASSIGNMENTS_FOR_CHILD, {
    variables: {
      childId: selectedChild?.id || selectedChild?._id || '' // Safely access id or _id
    },
    skip: !selectedChild,
  });

  // --- Mutations ---
  // Apply interfaces to useMutation hooks
  const [createAssignment] = useMutation<any, CreateAssignmentVariables>(CREATE_ASSIGNMENT);
  const [updateFeedback] = useMutation<any, UpdateAssignmentFeedbackVariables>(UPDATE_ASSIGNMENT_FEEDBACK);


  // --- Effects ---
  useEffect(() => {
    if (selectedChild) {
      refetchAssignments();
    }
  }, [selectedChild, refetchAssignments]);

  // --- Handlers ---
  const handleSelectChild = (child: Child) => { // Type the 'child' parameter
    setSelectedChild(child);
    setTitle('');
    setDescription('');
    setDifficulty('EASY');
    setQuestions([]);
    setFeedbackMap({}); // Clear feedback map for new child
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { type: 'EXPLAIN', prompt: '', options: [''], answer: '' }]);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => { // Type parameters
    const updated = [...questions];
    // Ensure that 'field' is a valid key of Question and type compatibility
    if (field === 'type') {
      updated[index].type = value as QuestionType;
    } else if (field === 'prompt') {
      updated[index].prompt = value;
    } else if (field === 'answer') {
      updated[index].answer = value;
    } else if (field === 'options') {
      // This path should ideally not be hit if options are handled by handleOptionChange
      // but if it were, you'd need careful type handling for array assignments.
      // For now, assuming options are modified via handleOptionChange
    }
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => { // Type parameters
    const updated = [...questions];
    if (updated[qIndex].options) { // Ensure options array exists
      updated[qIndex].options![oIndex] = value; // Use non-null assertion since we checked
    }
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => { // Type parameter
    const updated = [...questions];
    if (!updated[qIndex].options) {
      updated[qIndex].options = []; // Initialize if it doesn't exist
    }
    updated[qIndex].options!.push('');
    setQuestions(updated);
  };

  const handleDeleteQuestion = (indexToDelete: number) => { // Type parameter
    setQuestions(questions.filter((_, i) => i !== indexToDelete));
  };

  const handleDeleteOption = (qIndex: number, oIndexToDelete: number) => { // Type parameters
    const updated = [...questions];
    if (updated[qIndex].options) { // Ensure options array exists
      updated[qIndex].options = updated[qIndex].options!.filter((_, i) => i !== oIndexToDelete);
      // Ensure at least one empty option remains for MC/TF if all are deleted
      if (updated[qIndex].options!.length === 0 && (updated[qIndex].type === 'MULTIPLE_CHOICE' || updated[qIndex].type === 'TRUE_FALSE')) {
        updated[qIndex].options!.push('');
      }
    }
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => { // Type the event
    e.preventDefault();
    if (!selectedChild) {
      alert('Please select a child first!');
      return;
    }
    if (!title.trim() || !description.trim()) {
      alert('Please provide a title and description for the assignment.');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question to the assignment.');
      return;
    }
    // Basic validation for questions (can be expanded)
    for (const q of questions) {
      if (!q.prompt.trim()) {
        alert('All questions must have a prompt.');
        return;
      }
      if ((q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && q.options && q.options.some(opt => !opt.trim())) {
        alert('All options for multiple choice/true-false questions must be filled.');
        return;
      }
      if ((q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && (!q.options || q.options.length < 2)) {
        alert('Multiple choice and True/False questions need at least two options.');
        return;
      }
    }

    try {
      // Ensure selectedChild.id is used and exists
      await createAssignment({
        variables: { childId: selectedChild.id, title, description, questions, difficulty },
      });
      alert('🌟 Assignment created successfully!');
      setTitle('');
      setDescription('');
      setDifficulty('EASY');
      setQuestions([]);
      refetchAssignments();
    } catch (err: any) { // Type the error
      console.error('Error creating assignment:', err);
      alert(`Failed to create assignment: ${err.message}`);
    }
  };

  const handleFeedbackChange = (id: string, value: string) => { // Type parameters
    setFeedbackMap((prev) => ({ ...prev, [id]: value }));
  };

  const submitFeedback = async (assignmentId: string) => { // Type parameter
    const feedbackText = feedbackMap[assignmentId];
    if (!feedbackText || feedbackText.trim() === '') {
      alert('Feedback cannot be empty!');
      return;
    }
    try {
      await updateFeedback({
        variables: { assignmentId, feedback: feedbackText },
      });
      alert('📝 Feedback submitted!');
      refetchAssignments();
      setFeedbackMap(prev => {
        const newMap = { ...prev };
        delete newMap[assignmentId];
        return newMap;
      });
    } catch (err: any) { // Type the error
      console.error('Error submitting feedback:', err);
      alert(`Failed to submit feedback: ${err.message}`);
    }
  };

  // --- UI Calculations ---
  const assignmentProgress = (() => {
    // Safely check for data and array length
    if (!assignmentsData?.getAssignmentsForChild?.length) return 0;
    const total = assignmentsData.getAssignmentsForChild.length;
    const completed = assignmentsData.getAssignmentsForChild.filter((a) => a.status === 'COMPLETED').length;
    return Math.round((completed / total) * 100);
  })();

  // --- Loading and Error States ---
  if (childrenLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl animate-fade-in">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-semibold text-gray-700">Loading your little learners... 🚀</p>
        </div>
      </div>
    );
  }

  if (childrenError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-8 text-center bg-red-100 rounded-xl shadow-lg border border-red-300 animate-fade-in">
          <p className="text-xl font-bold text-red-700 mb-4">
            ⚠️ Error loading children:
          </p>
          <p className="text-lg text-red-600">{childrenError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300 shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 to-purple-50 font-sans text-gray-800">
      {/* Sidebar - Child Selection & Inbox */}
      <aside className="lg:w-1/4 w-full bg-white shadow-2xl p-6 border-r border-gray-100 flex flex-col z-10">
        <h2 className="text-4xl font-extrabold text-blue-700 mb-8 text-center leading-tight">
          <span className="block text-blue-500 text-5xl mb-2">🏡</span>
          Family Hub
        </h2>

        {/* Children List */}
        <section className="mb-8 flex-grow">
          <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
            <span className="mr-3 text-blue-500 text-3xl">👨‍👧‍👦</span> Your Little Learners
          </h3>
          {/* Changed this line: Added optional chaining for childrenData.getMyChildren */}
          {childrenData?.getMyChildren?.length === 0 ? (
            <div className="text-gray-500 italic p-4 bg-blue-50 rounded-xl text-center border border-blue-200 shadow-sm">
              <p className="mb-2">No children added yet.</p>
              <button
                onClick={() => router.push('/parent/add-child')}
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 shadow-md transform hover:-translate-y-0.5 text-sm"
              >
                <span className="mr-1">➕</span> Add Child
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {/* Ensure childrenData and getMyChildren are not null/undefined */}
              {childrenData?.getMyChildren?.map((child: Child) => ( // Type 'child' here
                <li
                  key={child.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center ${selectedChild?.id === child.id ? 'bg-blue-600 text-white shadow-xl border border-blue-700' : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-150'}`}
                  onClick={() => handleSelectChild(child)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 ${selectedChild?.id === child.id ? 'bg-blue-300' : 'bg-blue-400'}`}>
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-extrabold text-xl">{child.name}</div>
                    <div className={`${selectedChild?.id === child.id ? 'text-blue-200' : 'text-blue-600'} text-sm`}>
                      Age {child.age}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => router.push('/parent/add-child')}
            className="mt-6 w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300 shadow-lg transform hover:-translate-y-1 flex items-center justify-center"
          >
            <span className="text-xl mr-2">✨</span> Add New Child
          </button>
        </section>

        {/* Inbox */}
        <section className="bg-white p-6 shadow-xl rounded-xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
            <span className="mr-3 text-purple-500 text-3xl">💌</span> Notifications
          </h3>
          {/* Changed this line: Added optional chaining for inboxData.getParentNotifications */}
          {!inboxData?.getParentNotifications?.length ? (
            <p className="text-gray-500 italic p-3 bg-purple-50 rounded-lg text-center border border-purple-200 shadow-sm">
              No new updates from your kids yet.
            </p>
          ) : (
            <>
              <ul className="space-y-3 text-sm text-gray-700 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {/* Ensure inboxData and getParentNotifications are not null/undefined */}
                {inboxData?.getParentNotifications?.map((log: Notification, idx: number) => { // Type 'log' here
                  const date = log.date instanceof Date ? log.date : new Date(log.date);
                  return (
                    <li key={idx} className="pb-3 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-900 flex items-start">
                        <span className="text-xl mr-2 text-blue-400 flex-shrink-0">🔔</span> <span className="flex-grow">{log.message}</span>
                      </span>
                      <span className="block text-xs text-gray-500 mt-1 pl-7">
                        {isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString()}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="text-center mt-4">
                <button
                  onClick={() => setShowAllNotifications(!showAllNotifications)}
                  className="text-blue-600 text-sm font-semibold hover:underline transition-colors duration-200"
                >
                  {showAllNotifications ? '▲ Show Less' : '▼ View More'}
                </button>
              </div>
            </>
          )}
        </section>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-xl border border-blue-100 sticky top-0 z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 sm:mb-0">
            Parent Dashboard
          </h1>
          {selectedChild && (
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-indigo-700">
                {selectedChild.name}'s Progress:
              </span>
              <div className="w-40 bg-gray-200 rounded-full h-5 relative overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${assignmentProgress}%` }}
                >
                  <span className="text-xs font-bold text-white text-shadow-sm">
                    {assignmentProgress}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </header>

        {!selectedChild && (
          <div className="bg-blue-100 p-10 rounded-2xl shadow-2xl text-center border-2 border-blue-300 animate-fade-in-up">
            <p className="text-3xl font-extrabold text-blue-800 mb-4">
              👋 Welcome to Your NovaGuardian Dashboard!
            </p>
            <p className="text-lg text-blue-700 mb-6">
              Let's get started. Select a child from the left sidebar to dive into their assignments, or create new learning adventures.
            </p>
            <button
              onClick={() => {
                // Changed this line: Added optional chaining for childrenData.getMyChildren
                if (childrenData?.getMyChildren?.length > 0) {
                  handleSelectChild(childrenData.getMyChildren[0]);
                } else {
                  router.push('/parent/add-child');
                }
              }}
              className="mt-6 px-10 py-5 bg-purple-600 text-white text-xl font-bold rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto"
            >
              {childrenData?.getMyChildren?.length > 0 ? 'View First Child\'s Profile' : 'Add Your First Child!'}
              <span className="ml-3 text-2xl">➡️</span>
            </button>
          </div>
        )}

        {selectedChild && (
          <>
            {/* Create Assignment Section */}
            <section className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 animate-fade-in">
              <h2 className="text-3xl font-bold text-indigo-700 mb-8 flex items-center">
                <span className="mr-3 text-purple-500 text-4xl">✍️</span> Create New Assignment for <span className="text-blue-600 ml-2">{selectedChild.name}</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="assignmentTitle" className="block text-lg font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    id="assignmentTitle"
                    type="text"
                    placeholder="e.g., Math Homework: Addition & Subtraction"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="assignmentDescription" className="block text-lg font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    id="assignmentDescription"
                    placeholder="Explain what the assignment covers and its purpose."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-lg font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)} // Cast value to Difficulty
                    className="w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 bg-white shadow-sm appearance-none"
                  >
                    <option value="EASY">Easy (🟢)</option>
                    <option value="MEDIUM">Medium (🟡)</option>
                    <option value="HARD">Hard (🔴)</option>
                  </select>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-700 mt-8">Questions:</h3>
                  {questions.map((q, index) => (
                    <div key={index} className="p-7 border border-blue-200 rounded-2xl bg-blue-50 space-y-4 shadow-md relative group">
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(index)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors duration-200 text-3xl opacity-70 hover:opacity-100"
                        title="Delete Question"
                      >
                        &times;
                      </button>
                      <div>
                        <label className="block text-md font-semibold text-gray-700 mb-1">Question Type</label>
                        <select
                          value={q.type}
                          onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                          className="border border-gray-300 rounded-lg p-2 bg-white focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 appearance-none"
                        >
                          <option value="EXPLAIN">Explain</option>
                          <option value="SHORT_ANSWER">Short Answer</option>
                          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                          <option value="TRUE_FALSE">True/False</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-md font-semibold text-gray-700 mb-1">Prompt</label>
                        <input
                          type="text"
                          placeholder="e.g., What is the capital of France?"
                          value={q.prompt}
                          onChange={(e) => handleQuestionChange(index, 'prompt', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                          required
                        />
                      </div>

                      {(q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && (
                        <div className="space-y-3 p-4 bg-white rounded-xl border border-gray-200 shadow-inner">
                          <h4 className="text-lg font-bold text-gray-700 mb-2">Options:</h4>
                          {q.options?.map((opt, oIdx) => ( // Safely access q.options
                            <div key={oIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder={`Option ${oIdx + 1}`}
                                value={opt}
                                onChange={(e) => handleOptionChange(index, oIdx, e.target.value)}
                                className="flex-grow border border-gray-300 rounded-lg p-2 text-base focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 shadow-sm"
                                required
                              />
                              {q.options!.length > 1 && ( // Use non-null assertion since we know it exists here
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOption(index, oIdx)}
                                  className="text-red-500 hover:text-red-700 text-xl transition-colors duration-200 opacity-80 hover:opacity-100"
                                  title="Delete Option"
                                >
                                  &times;
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddOption(index)}
                            className="text-blue-600 font-medium text-sm hover:underline transition-colors duration-200 mt-2 flex items-center justify-center px-3 py-1 bg-blue-100 rounded-full hover:bg-blue-200"
                          >
                            <span className="text-lg mr-1">➕</span> Add Option
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-md font-semibold text-gray-700 mb-1">Correct Answer (Optional, for auto-grading/reference)</label>
                        <input
                          type="text"
                          placeholder="e.g., Paris"
                          value={q.answer || ''} // Provide default empty string if answer is undefined
                          onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl p-3 text-base focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 shadow-sm"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-300 shadow-md flex items-center justify-center transform hover:-translate-y-1"
                  >
                    <span className="text-xl mr-2">➕</span> Add New Question
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-purple-600 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-[1.01]"
                >
                  <span className="mr-2 text-2xl">🚀</span> Create Assignment
                </button>
              </form>
            </section>

            {/* Assignments for Selected Child Section */}
            <section className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 animate-fade-in">
              <h2 className="text-3xl font-bold text-indigo-700 mb-8 flex items-center">
                <span className="mr-3 text-green-500 text-4xl">✅</span> Assignments for <span className="text-blue-600 ml-2">{selectedChild.name}</span>
              </h2>
              {assignmentsLoading ? (
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl shadow-inner">
                  <svg className="animate-spin h-8 w-8 text-gray-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-center text-gray-500 italic text-lg">Loading assignments...</p>
                </div>
              ) : assignmentsData?.getAssignmentsForChild?.length === 0 ? (
                <p className="text-gray-500 italic text-lg text-center p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                  No assignments created for {selectedChild.name} yet. Time to create some!
                </p>
              ) : (
                <div className="space-y-6">
                  {assignmentsData?.getAssignmentsForChild?.map((assignment: Assignment) => { // Type 'assignment' here
                    const statusColor = {
                      'COMPLETED': 'bg-green-100 text-green-800 border-green-300',
                      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                      'NEW': 'bg-blue-100 text-blue-800 border-blue-300',
                    }[assignment.status] || 'bg-gray-100 text-gray-800 border-gray-300';

                    const difficultyColors = {
                      EASY: 'text-green-600 font-extrabold',
                      MEDIUM: 'text-yellow-600 font-extrabold',
                      HARD: 'text-red-600 font-extrabold',
                    };

                    return (
                      <div key={assignment.id} className="p-7 border rounded-2xl shadow-md bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                          <div>
                            <h3 className="font-extrabold text-2xl text-blue-800 mb-1">{assignment.title}</h3>
                            <p className={`text-sm ${difficultyColors[assignment.difficulty] || 'text-gray-600'}`}>
                              Difficulty: {assignment.difficulty || 'N/A'}
                            </p>
                          </div>
                          <span
                            className={`mt-2 sm:mt-0 px-4 py-1.5 rounded-full text-sm font-semibold border ${statusColor}`}
                          >
                            {assignment.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-5 text-base leading-relaxed">{assignment.description}</p>

                        <div className="space-y-4 border-t pt-5 mt-5 border-gray-100">
                          <h4 className="text-lg font-bold text-gray-700">Questions & Responses:</h4>
                          {assignment.questions.map((q: Question, qIndex: number) => { // Type 'q' here
                            // Safely find response based on questionIndex
                            const response = assignment.responses?.find((r: Response) => r.questionIndex === qIndex); // Type 'r' here
                            const answerText = response ? response.answer : 'No response submitted yet.';
                            const isCorrectAnswer = q.answer && answerText.toLowerCase() === q.answer.toLowerCase() && answerText.trim() !== '';

                            return (
                              <div key={qIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                                <p className="text-md font-semibold text-gray-800 mb-2">
                                  <span className="text-blue-500 mr-1">Q{qIndex + 1}:</span> {q.prompt}
                                </p>
                                {q.options && q.options.length > 0 && (
                                  <ul className="list-disc list-inside text-sm text-gray-600 mb-2 ml-4">
                                    {q.options.map((opt, i) => (
                                      <li key={i}>{opt}</li>
                                    ))}
                                  </ul>
                                )}
                                <p className={`text-sm font-medium ${response ? (isCorrectAnswer ? 'text-green-700' : 'text-red-700') : 'text-gray-600'}`}>
                                  Your Child's Answer: <span className="font-normal">{answerText}</span>
                                  {q.answer && q.answer.trim() !== '' && (
                                    <span className="block text-gray-500 italic mt-1">Expected: {q.answer}</span>
                                  )}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {assignment.status === 'COMPLETED' && (
                          <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-200 shadow-inner">
                            <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
                              <span className="text-xl mr-2">🌟</span> Give Feedback:
                            </h4>
                            <textarea
                              rows={3}
                              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 shadow-sm"
                              placeholder="Write your feedback for your child's performance (e.g., 'Great effort!', 'Try reviewing fractions.')..."
                              value={feedbackMap[assignment.id] ?? assignment.feedback ?? ''} // Use nullish coalescing
                              onChange={(e) => handleFeedbackChange(assignment.id, e.target.value)}
                            />
                            <button
                              onClick={() => submitFeedback(assignment.id)}
                              className="mt-4 px-6 py-2.5 text-md bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md transform hover:-translate-y-0.5 flex items-center"
                            >
                              <span className="mr-2">💬</span> Submit Feedback
                            </button>
                            {assignment.feedback && (
                              <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                                <p className="text-sm text-gray-700 italic font-medium">
                                  Your Last Feedback:
                                </p>
                                <p className="text-base text-gray-800 mt-1">{assignment.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}