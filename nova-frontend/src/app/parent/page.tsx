'use client';

import { useMutation, useQuery } from '@apollo/client';
import { useState, useEffect, FormEvent, SVGProps, FC } from 'react';
import { GET_CHILDREN, GET_ASSIGNMENTS_FOR_CHILD } from '@/graphql/queries';
import { CREATE_ASSIGNMENT, UPDATE_ASSIGNMENT_FEEDBACK, EVALUATE_ASSIGNMENT_RESPONSE } from '@/graphql/mutations';

import type { Child, Assignment, Question, Difficulty, AssignmentStatus, AnswerEvaluation, AssignmentResponse } from '@/types';

type AnswerMap = Record<`${string}-${number}`, string>;

// --- SVG Icon Components ---
const Icons = {
    Family: (props: SVGProps<SVGSVGElement>) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM3.28 20.707a9.094 9.094 0 003.741.479 3 3 0 004.682-2.72m-7.5-2.962a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
    ),
    Plus: (props: SVGProps<SVGSVGElement>) => (
        <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
    ),
    User: (props: SVGProps<SVGSVGElement>) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    PencilSquare: (props: SVGProps<SVGSVGElement>) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
    ),
};

// --- Main Page Component ---
export default function ParentDashboardPage() {
    const [view, setView] = useState<'dashboard' | 'create' | 'evaluate'>('dashboard');
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [assignmentToEvaluate, setAssignmentToEvaluate] = useState<Assignment | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- Data Fetching ---
    const { data: childrenData, loading: childrenLoading, error: childrenError } = useQuery<{ getMyChildren: Child[] }>(GET_CHILDREN);
    const { data: assignmentsData, refetch: refetchAssignments, loading: assignmentsLoading } = useQuery<{ getAssignmentsForChild: Assignment[] }>(GET_ASSIGNMENTS_FOR_CHILD, {
        variables: { childId: selectedChild?.id || '' },
        skip: !selectedChild,
        fetchPolicy: 'network-only',
    });

    // --- State for Forms ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
    const [questions, setQuestions] = useState<Question[]>([{ type: 'EXPLAIN', prompt: '', options: [], answer: '' }]);
    const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation[]>([]);
    const [overallFeedback, setOverallFeedback] = useState('');
    const [answers, setAnswers] = useState<AnswerMap>({});
    
    // --- Mutations ---
    const [createAssignment, { loading: createLoading }] = useMutation(CREATE_ASSIGNMENT);
    const [evaluateAssignment, { loading: evaluateLoading }] = useMutation(EVALUATE_ASSIGNMENT_RESPONSE);
    const [updateFeedback, { loading: feedbackLoading }] = useMutation(UPDATE_ASSIGNMENT_FEEDBACK);

    // --- Effects ---
    useEffect(() => {
        if (!selectedChild && childrenData?.getMyChildren?.length) {
            setSelectedChild(childrenData.getMyChildren[0]);
        }
    }, [childrenData, selectedChild]);

    useEffect(() => {
        if (view === 'evaluate' && assignmentToEvaluate) {
            const initialEvals = assignmentToEvaluate.questions.map((_, index) => ({
                questionIndex: index,
                isCorrect: assignmentToEvaluate.evaluation?.find(e => e.questionIndex === index)?.isCorrect ?? false,
                feedback: assignmentToEvaluate.evaluation?.find(e => e.questionIndex === index)?.feedback ?? '',
            }));
            setCurrentEvaluation(initialEvals);
            setOverallFeedback(assignmentToEvaluate.feedback || '');
        }
    }, [view, assignmentToEvaluate]);

    // --- Handlers ---
    const handleSelectChild = (child: Child) => {
        setSelectedChild(child);
        setIsMobileMenuOpen(false);
    };

    const resetCreateForm = () => {
        setTitle('');
        setDescription('');
        setDifficulty('EASY');
        setQuestions([{ type: 'EXPLAIN', prompt: '', options: [], answer: '' }]);
    };

    const handleCreateNew = () => {
        resetCreateForm();
        setView('create');
    };
    
    const handleEvaluateClick = (assignment: Assignment) => {
        setAssignmentToEvaluate(assignment);
        setView('evaluate');
    };

    const handleCreateSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedChild) return;
        try {
            await createAssignment({
                variables: { childId: selectedChild.id, title, description, questions, difficulty }
            });
            refetchAssignments();
            setView('dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to create assignment.');
        }
    };
    
    const handleEvaluateSubmit = async () => {
        if (!selectedChild || !assignmentToEvaluate) return;
        try {
            await evaluateAssignment({ variables: { childId: selectedChild.id, assignmentId: assignmentToEvaluate.id, evaluation: currentEvaluation }});
            if (overallFeedback.trim()) {
                await updateFeedback({ variables: { assignmentId: assignmentToEvaluate.id, feedback: overallFeedback }});
            }
            refetchAssignments();
            setView('dashboard');
        } catch (err) {
            console.error(err);
            alert('Failed to submit evaluation.');
        }
    };

    const handleAddQuestion = () => setQuestions([...questions, { type: 'EXPLAIN', prompt: '', options: [], answer: '' }]);
    const handleRemoveQuestion = (qIndex: number) => setQuestions(questions.filter((_, index) => index !== qIndex));

    const handleQuestionChange = (qIndex: number, field: keyof Question, value: any) => {
        const newQuestions = questions.map((q, index) => {
            if (index === qIndex) {
                const updatedQuestion = { ...q, [field]: value };
                if (field === 'type') {
                    updatedQuestion.options = [];
                    updatedQuestion.answer = '';
                }
                return updatedQuestion;
            }
            return q;
        });
        setQuestions(newQuestions);
    };
    
    const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].options) {
            newQuestions[qIndex].options![optIndex] = value;
            setQuestions(newQuestions);
        }
    };
    
    const handleAddOption = (qIndex: number) => {
        const newQuestions = [...questions];
        if (!newQuestions[qIndex].options) newQuestions[qIndex].options = [];
        newQuestions[qIndex].options!.push('');
        setQuestions(newQuestions);
    };
    
    const handleRemoveOption = (qIndex: number, optIndex: number) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].options) {
            newQuestions[qIndex].options = newQuestions[qIndex].options!.filter((_, index) => index !== optIndex);
            setQuestions(newQuestions);
        }
    };

    if (childrenLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><p>Loading your family...</p></div>;
    if (childrenError) return <div className="flex h-screen items-center justify-center bg-slate-50 text-red-500"><p>Could not load children data.</p></div>;

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-[280px_1fr]">
            {/* --- Sidebar --- */}
            <aside className="hidden lg:flex flex-col bg-slate-50 border-r border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-lg">
                        <Icons.Family className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Family Hub</h2>
                </div>
                <nav className="flex-grow">
                    <h3 className="px-3 text-xs font-semibold uppercase text-gray-500 mb-2">Children</h3>
                    <ul className="space-y-1">
                        {childrenData?.getMyChildren?.map((child: Child) => (
                            <li key={child.id}>
                                <button
                                    onClick={() => handleSelectChild(child)}
                                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${selectedChild?.id === child.id ? 'bg-blue-600 text-white' : 'hover:bg-blue-100 text-gray-700'}`}
                                >
                                    <Icons.User className="h-5 w-5" />
                                    {child.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-1 bg-white p-6 sm:p-8 lg:p-10">
                {/* --- Mobile Header --- */}
                <header className="lg:hidden mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Family Hub</h2>
                        <button 
                            onClick={() => handleCreateNew()} 
                            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 text-sm"
                        >
                            <Icons.Plus className="h-4 w-4" /> New
                        </button>
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="w-full flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-left font-semibold text-gray-700"
                        >
                            <span>{selectedChild ? selectedChild.name : 'Select a Child'}</span>
                            <svg className={`h-5 w-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {isMobileMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl z-10 border border-slate-200">
                                {childrenData?.getMyChildren?.map((child: Child) => (
                                    <button
                                        key={child.id}
                                        onClick={() => handleSelectChild(child)}
                                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50"
                                    >
                                        <Icons.User className="h-5 w-5 text-gray-500" />
                                        {child.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </header>

                {view === 'dashboard' && <DashboardView selectedChild={selectedChild} assignmentsData={assignmentsData} assignmentsLoading={assignmentsLoading} onCreateNew={handleCreateNew} onEvaluate={handleEvaluateClick} />}
                {view === 'create' && <CreateAssignmentView onBack={() => setView('dashboard')} onSubmit={handleCreateSubmit} loading={createLoading} title={title} setTitle={setTitle} description={description} setDescription={setDescription} difficulty={difficulty} setDifficulty={setDifficulty} questions={questions} handleQuestionChange={handleQuestionChange} handleRemoveQuestion={handleRemoveQuestion} handleAddQuestion={handleAddQuestion} handleOptionChange={handleOptionChange} handleRemoveOption={handleRemoveOption} handleAddOption={handleAddOption} />}
                {view === 'evaluate' && assignmentToEvaluate && <EvaluationView assignment={assignmentToEvaluate} onBack={() => setView('dashboard')} onSubmit={handleEvaluateSubmit} loading={evaluateLoading || feedbackLoading} currentEvaluation={currentEvaluation} setCurrentEvaluation={setCurrentEvaluation} overallFeedback={overallFeedback} setOverallFeedback={setOverallFeedback} />}
            </main>
        </div>
    );
}

// --- View Component Prop Types ---

interface DashboardViewProps {
  selectedChild: Child | null;
  assignmentsData?: { getAssignmentsForChild: Assignment[] };
  assignmentsLoading: boolean;
  onCreateNew: () => void;
  onEvaluate: (assignment: Assignment) => void;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onEvaluate: () => void;
}

interface CreateAssignmentViewProps {
  onBack: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  loading: boolean;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  difficulty: Difficulty;
  setDifficulty: (value: Difficulty) => void;
  questions: Question[];
  handleQuestionChange: (qIndex: number, field: keyof Question, value: any) => void;
  handleRemoveQuestion: (qIndex: number) => void;
  handleAddQuestion: () => void;
  handleOptionChange: (qIndex: number, optIndex: number, value: string) => void;
  handleRemoveOption: (qIndex: number, optIndex: number) => void;
  handleAddOption: (qIndex: number) => void;
}

interface EvaluationViewProps {
    assignment: Assignment;
    onBack: () => void;
    onSubmit: () => Promise<void>;
    loading: boolean;
    currentEvaluation: AnswerEvaluation[];
    setCurrentEvaluation: React.Dispatch<React.SetStateAction<AnswerEvaluation[]>>;
    overallFeedback: string;
    setOverallFeedback: (value: string) => void;
}

// --- Progress Gauge Component ---

const ProgressGauge: FC<{ progress: number; level: string }> = ({ progress, level }) => {
    const score = Math.max(0, Math.min(100, progress)); // Clamp between 0-100
    const rotation = (score / 100) * 180 - 90; // Map 0-100 to -90 to +90 degrees

    const getLevelColor = () => {
        if (score < 40) return 'text-red-500';
        if (score < 70) return 'text-yellow-500';
        return 'text-green-500';
    };

    return (
        <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="relative aspect-video">
                {/* Gauge Background Arc */}
                <svg viewBox="0 0 100 50" className="w-full">
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#e5e7eb" // gray-200
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                     <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * Math.PI * 40}, ${Math.PI * 40}`}
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Needle */}
                <div
                    className="absolute bottom-2.5 left-1/2 w-1 h-1/2 bg-gray-700 origin-bottom transition-transform duration-1000 ease-in-out"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                >
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-gray-700 rounded-full border-4 border-white"></div>
                </div>
            </div>

            {/* Text Display */}
            <div className="text-center -mt-8">
                <p className="text-sm text-gray-500 font-medium">Overall Progress</p>
                <p className={`text-5xl font-bold ${getLevelColor()}`}>{score.toFixed(0)}<span className="text-3xl">%</span></p>
                <p className="text-lg font-semibold text-gray-700 mt-1">{level}</p>
            </div>
        </div>
    );
};

// --- Typed View Components ---

const DashboardView: FC<DashboardViewProps> = ({ selectedChild, assignmentsData, assignmentsLoading, onCreateNew, onEvaluate }) => {
    // Calculate overall progress
    const evaluatedAssignments = assignmentsData?.getAssignmentsForChild?.filter(a => a.status === 'EVALUATED' && typeof a.score === 'number') || [];
    const averageScore = evaluatedAssignments.length > 0
        ? evaluatedAssignments.reduce((acc, a) => acc + (a.score || 0), 0) / evaluatedAssignments.length
        : 0;

    const getProgressLevel = (score: number): string => {
        if (score < 40) return "Needs Improvement";
        if (score < 70) return "Good Progress";
        if (score < 90) return "Excellent Work";
        return "Mastered!";
    };
    
    const progressLevel = getProgressLevel(averageScore);
    
    if (!selectedChild) {
        return (
            <div className="flex h-full items-center justify-center text-center bg-slate-50 rounded-xl">
                <div>
                    <Icons.Family className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">Select a child</h3>
                    <p className="text-gray-500 mt-1">Choose a child from the sidebar to view their assignments.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Assignments for <span className="text-blue-600">{selectedChild.name}</span>
                </h1>
                <button onClick={onCreateNew} className="hidden lg:flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
                    <Icons.Plus className="h-5 w-5" /> New Assignment
                </button>
            </div>

            {/* --- GAUGE SECTION --- */}
            {evaluatedAssignments.length > 0 && (
                <div className="mb-10">
                    <ProgressGauge progress={averageScore} level={progressLevel} />
                </div>
            )}

            {assignmentsLoading && <div className="text-center py-10"><p>Loading assignments...</p></div>}
            
            {!assignmentsLoading && assignmentsData?.getAssignmentsForChild?.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-xl">
                    <Icons.PencilSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold">No assignments yet!</h3>
                    <p className="text-gray-500 mt-2">Click 'New Assignment' to get started.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {assignmentsData?.getAssignmentsForChild?.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(assignment => (
                    <AssignmentCard key={assignment.id} assignment={assignment} onEvaluate={() => onEvaluate(assignment)} />
                ))}
            </div>
        </div>
    );
};

const AssignmentCard: FC<AssignmentCardProps> = ({ assignment, onEvaluate }) => {
    const statusStyles: Record<AssignmentStatus, { text: string; bg: string; textColor: string }> = {
        NEW: { text: 'New', bg: 'bg-blue-100', textColor: 'text-blue-700' },
        IN_PROGRESS: { text: 'In Progress', bg: 'bg-yellow-100', textColor: 'text-yellow-700' },
        COMPLETED: { text: 'Ready to Evaluate', bg: 'bg-purple-100', textColor: 'text-purple-700' },
        EVALUATED: { text: `Graded: ${assignment.score?.toFixed(0)}%`, bg: 'bg-green-100', textColor: 'text-green-700' },
    };
    const currentStatus = statusStyles[assignment.status] || { text: '', bg: '', textColor: '' };
    
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 transition-shadow hover:shadow-lg flex flex-col">
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-800 pr-4">{assignment.title}</h3>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${currentStatus.bg} ${currentStatus.textColor}`}>
                        {currentStatus.text}
                    </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assignment.description}</p>
            </div>
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                    Difficulty: <span className="font-semibold capitalize">{assignment.difficulty.toLowerCase()}</span>
                </p>
                {(assignment.status === 'COMPLETED' || assignment.status === 'EVALUATED') && (
                    <button onClick={onEvaluate} className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-slate-200">
                        {assignment.status === 'EVALUATED' ? 'View Results' : 'Evaluate'}
                    </button>
                )}
            </div>
        </div>
    );
};

const CreateAssignmentView: FC<CreateAssignmentViewProps> = ({ onBack, onSubmit, loading, title, setTitle, description, setDescription, difficulty, setDifficulty, questions, handleQuestionChange, handleRemoveQuestion, handleAddQuestion, handleOptionChange, handleRemoveOption, handleAddOption }) => (
    <div className="mx-auto max-w-4xl">
        <button onClick={onBack} className="mb-6 font-semibold text-blue-600 hover:text-blue-800">&larr; Back to Dashboard</button>
        <form onSubmit={onSubmit} className="space-y-8 rounded-2xl bg-slate-50 p-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Create New Assignment</h2>
                <p className="mt-2 text-gray-600">Build a custom assignment with multiple question types.</p>
            </div>
            <div className="space-y-4 border-t border-slate-200 pt-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Solar System Facts" required className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A fun quiz about planets and stars." required className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                </div>
            </div>
            <div className="space-y-4 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-4">
                            <input type="text" value={q.prompt} onChange={e => handleQuestionChange(qIndex, 'prompt', e.target.value)} placeholder={`Question ${qIndex + 1} Prompt`} required className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
                            <select value={q.type} onChange={e => handleQuestionChange(qIndex, 'type', e.target.value)} className="rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="EXPLAIN">Explain</option>
                                <option value="SHORT_ANSWER">Short Answer</option>
                                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                <option value="TRUE_FALSE">True/False</option>
                            </select>
                            <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="text-xl font-bold text-red-500 hover:text-red-700">&times;</button>
                        </div>
                        {q.type === 'MULTIPLE_CHOICE' && (
                            <div className="space-y-2 border-l-4 border-blue-200 pl-4">
                                <p className="text-sm font-semibold text-gray-600">Options (Select the correct answer)</p>
                                {q.options?.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                        <input type="radio" name={`correct-answer-${qIndex}`} checked={q.answer === opt} onChange={() => handleQuestionChange(qIndex, 'answer', opt)} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                        <input type="text" value={opt} onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`} className="flex-grow rounded-md border-gray-300 p-1 text-sm shadow-sm"/>
                                        <button type="button" onClick={() => handleRemoveOption(qIndex, optIndex)} className="text-sm text-red-500 hover:text-red-700">&times;</button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddOption(qIndex)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">+ Add Option</button>
                            </div>
                        )}
                        {q.type === 'TRUE_FALSE' && (
                            <div className="space-y-2 border-l-4 border-green-200 pl-4">
                                <p className="text-sm font-semibold text-gray-600">Correct Answer</p>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`correct-answer-${qIndex}`} checked={q.answer === 'True'} onChange={() => handleQuestionChange(qIndex, 'answer', 'True')} className="h-4 w-4 text-blue-600 focus:ring-blue-500"/>True</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`correct-answer-${qIndex}`} checked={q.answer === 'False'} onChange={() => handleQuestionChange(qIndex, 'answer', 'False')} className="h-4 w-4 text-blue-600 focus:ring-blue-500"/>False</label>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <button type="button" onClick={handleAddQuestion} className="w-full rounded-lg border-2 border-dashed border-slate-300 p-2 text-slate-500 hover:bg-slate-100">+ Add Question</button>
            </div>
            <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
                <button type="button" onClick={onBack} className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-gray-800 hover:bg-slate-300">Cancel</button>
                <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-400">
                    {loading ? 'Saving...' : 'Save Assignment'}
                </button>
            </div>
        </form>
    </div>
);

const EvaluationView: FC<EvaluationViewProps> = ({ assignment, onBack, onSubmit, loading, currentEvaluation, setCurrentEvaluation, overallFeedback, setOverallFeedback }) => {
    const isReadOnly = assignment.status === 'EVALUATED';
    return (
        <div className="mx-auto max-w-4xl">
            <button onClick={onBack} className="mb-6 font-semibold text-blue-600 hover:text-blue-800">&larr; Back to Dashboard</button>
            <div className="space-y-6 rounded-2xl bg-slate-50 p-8">
                <h2 className="text-3xl font-bold text-gray-900">{isReadOnly ? 'Results for:' : 'Evaluating:'} <span className="text-blue-600">{assignment.title}</span></h2>
                
                <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2 border-t border-b border-slate-200 py-6">
                    {assignment.questions.map((q, index) => {
                        const response = assignment.responses.find(r => r.questionIndex === index);
                        const evaluation = currentEvaluation.find(e => e.questionIndex === index);
                        return (
                            <div key={index} className={`rounded-xl border p-4 bg-white`}>
                                <p className="font-bold text-lg text-gray-800">{index + 1}. {q.prompt}</p>
                                <div className="mt-3 space-y-2">
                                    <p className="rounded-md bg-blue-50 p-3 text-blue-900">
                                        <b className="font-semibold">Child's Answer:</b> {response?.answer || <i className="text-gray-500">No answer provided.</i>}
                                    </p>
                                    {(q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && (
                                        <p className="rounded-md bg-slate-100 p-2 text-sm text-gray-800">
                                            <b>Correct Answer:</b> {q.answer}
                                        </p>
                                    )}
                                </div>
                                {!isReadOnly && (
                                    <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
                                        <p className="font-semibold">Mark as:</p>
                                        <label className="flex cursor-pointer items-center gap-2 text-md">
                                            <input type="radio" name={`eval-${index}`} checked={evaluation?.isCorrect === true} onChange={() => setCurrentEvaluation(prev => prev.map(ev => ev.questionIndex === index ? { ...ev, isCorrect: true } : ev))} className="h-5 w-5 text-green-600 focus:ring-green-500" />
                                            <span className="font-medium text-green-600">Correct</span>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2 text-md">
                                            <input type="radio" name={`eval-${index}`} checked={evaluation?.isCorrect === false} onChange={() => setCurrentEvaluation(prev => prev.map(ev => ev.questionIndex === index ? { ...ev, isCorrect: false } : ev))} className="h-5 w-5 text-red-600 focus:ring-red-500" />
                                            <span className="font-medium text-red-600">Incorrect</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div>
                    <label htmlFor="overallFeedback" className="block text-lg font-semibold text-gray-800 mb-2">Overall Feedback</label>
                    <textarea
                        id="overallFeedback"
                        value={overallFeedback}
                        onChange={(e) => setOverallFeedback(e.target.value)}
                        placeholder="Great job on this assignment! Keep up the hard work."
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
                        readOnly={isReadOnly}
                    />
                </div>

                <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
                    <button type="button" onClick={onBack} className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-gray-800 hover:bg-slate-300">{isReadOnly ? 'Close' : 'Cancel'}</button>
                    {!isReadOnly && <button onClick={onSubmit} disabled={loading} className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:bg-green-400">{loading ? 'Saving...' : 'Submit Evaluation'}</button>}
                </div>
            </div>
        </div>
    );
};