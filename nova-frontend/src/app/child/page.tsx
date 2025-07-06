'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useAuth } from '@/app/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { SVGProps } from 'react';

// --- GraphQL Imports ---
import { GET_CHILD_BY_ID, GET_MY_ASSIGNMENTS } from '@/graphql/queries';
import { UPDATE_ASSIGNMENT_STATUS } from '@/graphql/mutations';

type AnswerMap = Record<`${string}-${number}`, string>;
// --- SVG Icons ---
const Icons = {
  BookOpen: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  CheckCircle: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Mail: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Trophy: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-2.34l1.24-.98a2 2 0 0 1 2.52 0l1.24.98z" />
      <path d="M14 14.66V17c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-2.34l-1.24-.98a2 2 0 0 0-2.52 0l-1.24.98z" />
      <path d="M12 2v2" />
      <path d="M12 12v2" />
    </svg>
  ),
  Spinner: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

// --- Type Definitions ---
interface Child { id: string; name: string; age: number; xp: number; badges: string[]; }
interface Question { type: 'EXPLAIN' | 'SHORT_ANSWER' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE'; prompt: string; options?: string[]; }
interface Assignment { id: string; title: string; description: string; status: 'PENDING' | 'COMPLETED' | 'EVALUATED'; questions: Question[]; feedback?: string; totalCorrect: number; score: number; createdAt: string; completedAt?: string | null; }
interface GetChildByIdData { getChildById: Child; }
interface GetMyAssignmentsData { getMyAssignments: Assignment[]; }

// --- Memory Game Component with Timer ---
const MemoryMatchGame = () => {
  const emojis = ['🚀', '⭐', '🎉', '📚', '💡', '✅', '🎨', '🧩'];

  type Card = {
  id: number;
  content: string;
};

const [cards, setCards] = useState<Card[]>([]);
const [flipped, setFlipped] = useState<number[]>([]);
const [solved, setSolved] = useState<string[]>([]);


useEffect(() => {
  const gameCards = [...emojis, ...emojis]
    .sort(() => Math.random() - 0.5)
    .map((content, i) => ({ id: i, content }));
  setCards(gameCards);
}, []);

useEffect(() => {
  if (flipped.length === 2) {
    const [first, second] = flipped;
    if (cards[first].content === cards[second].content) {
      setSolved(prev => [...prev, cards[first].content]);
    }
    setTimeout(() => setFlipped([]), 1000);
  }
}, [flipped, cards]);

const handleFlip = (index: number) => {
  if (
    flipped.length < 2 &&
    !flipped.includes(index) &&
    !solved.includes(cards[index].content)
  ) {
    setFlipped(prev => [...prev, index]);
  }
};


  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 p-4 bg-purple-100 rounded-lg">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          onClick={() => handleFlip(index)}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg cursor-pointer flex items-center justify-center text-3xl sm:text-4xl"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped.includes(index) || solved.includes(card.content) ? 180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute w-full h-full bg-purple-400 rounded-lg flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>?</div>
          <div className="absolute w-full h-full bg-white rounded-lg flex items-center justify-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{card.content}</div>
        </motion.div>
      ))}
    </div>
  );
};



export default function ChildDashboard() {
  const { user } = useAuth();
  const childId = user?._id;


  const [evaluatedQuest, setEvaluatedQuest] = useState<Assignment | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const { data: childData, loading: childLoading, error: childError } = useQuery<GetChildByIdData>(GET_CHILD_BY_ID, { variables: { id: childId }, skip: !childId });
  const { data: assignmentsData, loading: assignmentsLoading, error: assignmentsError, refetch } = useQuery<GetMyAssignmentsData>(GET_MY_ASSIGNMENTS);
  const [updateStatus] = useMutation(UPDATE_ASSIGNMENT_STATUS);

  const sortedQuests = [...(assignmentsData?.getMyAssignments ?? [])].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime();
  });

  const handleInputChange = (questQuestionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questQuestionId]: value }));
  };

  const handleSubmit = async (quest: Assignment) => {
    const responsePayload: { questionIndex: number; answer: string }[] =
  quest.questions.map((q, i) => ({
    questionIndex: i,
    answer: answers[`${quest.id}-${i}`] || '',
  }));

    if (responsePayload.some(res => !res.answer.trim())) {
      alert('Please answer all questions!');
      return;
    }
    
    setSubmittingId(quest.id);

    try {
      await updateStatus({ variables: { assignmentId: quest.id, status: 'COMPLETED', responses: responsePayload }});
      await refetch();
    } catch (err) {
      alert('Oops! Something went wrong.');
    } finally {
      setSubmittingId(null);
    }
  };

  const child = childData?.getChildById;
  const xp = child?.xp || 0;
  const levelThreshold = 100;
  const level = Math.floor(xp / levelThreshold);
  const xpForCurrentLevel = xp % levelThreshold;
  const progress = (xpForCurrentLevel / levelThreshold) * 100;
  const isZeroScore = evaluatedQuest?.score === 0;

  if (childLoading || assignmentsLoading) return <div className="flex items-center justify-center h-screen"><p className="text-xl font-bold">Loading Your Adventure...</p></div>;
  if (childError || assignmentsError) return <div className="flex items-center justify-center h-screen"><p className="text-xl font-bold text-red-500">Could not load your adventure. Please try again!</p></div>;
  if (!child) return null;

  return (
    <div className="min-h-screen bg-sky-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <section className="bg-white rounded-3xl shadow-lg p-6 flex flex-col sm:flex-row items-center gap-6">
          <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(child.name)}`} alt="Avatar" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-yellow-300" />
          <div className="flex-1 w-full text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">Hi, {child.name}!</h1>
            <p className="text-slate-500">Level {level} Explorer</p>
            <div className="mt-4">
              <div className="flex justify-between text-sm font-bold text-slate-600 mb-1">
                <span>XP: {xp}</span>
                <span>{levelThreshold - xpForCurrentLevel} XP to Level {level + 1}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-5 overflow-hidden border-2 border-white shadow-inner">
                <motion.div className="h-full bg-gradient-to-r from-green-400 to-cyan-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
            {child.badges?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">{child.badges.map((b, i) => <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">{b}</span>)}</div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <main className="lg:col-span-2 space-y-6">
                <h2 className="text-3xl font-bold text-slate-800">Your Quests 🗺️</h2>
                {sortedQuests.map(quest => {
                    const isPending = quest.status === 'PENDING';
                    const isCompleted = quest.status === 'COMPLETED';
                    const isEvaluated = quest.status === 'EVALUATED';
                    const isSubmitting = submittingId === quest.id;

                    return (
                        <div key={quest.id} className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300">
                            <div className="p-5 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{quest.title}</h3>
                                    {/* CORRECTED: Description only shows for PENDING quests */}
                                    {isPending && <p className="text-slate-500 text-sm">{quest.description}</p>}
                                </div>
                                {isPending && !isSubmitting && <div className="flex items-center gap-2 text-blue-600 font-bold"><span>NEW!</span></div>}
                                {isSubmitting && <Icons.Spinner className="animate-spin w-6 h-6 text-slate-400" />}
                                {isCompleted && <div className="flex items-center gap-2 text-slate-500"><Icons.Mail className="w-5 h-5"/><span>Waiting for Review</span></div>}
                                {isEvaluated && <button onClick={() => setEvaluatedQuest(quest)} className="flex items-center gap-2 text-green-600 font-bold"><Icons.CheckCircle className="w-6 h-6"/><span>View Results</span></button>}
                            </div>
                            
                            {/* Questions section (only shows for pending quests) */}
                            {isPending && !isSubmitting && (
                                <div className="px-5 pb-5 border-t-2 border-slate-100 pt-4 space-y-4">
                                    {quest.questions.map((q, qIndex) => (
                                      <div key={qIndex} className="p-4 bg-slate-50 rounded-lg">
                                        <p className="font-semibold mb-2 text-lg text-slate-800">{qIndex + 1}. {q.prompt}</p>
                                        {(q.type === 'EXPLAIN' || q.type === 'SHORT_ANSWER') && <textarea className="w-full border-slate-300 rounded-md p-2" rows={4} placeholder="Your answer..." value={answers[`${quest.id}-${qIndex}`] || ''} onChange={(e) => handleInputChange(`${quest.id}-${qIndex}`, e.target.value)} />}
                                        {q.type === 'MULTIPLE_CHOICE' && q.options && <div className="space-y-2 mt-2">{q.options.map((opt, i) => <label key={i} className="flex items-center p-3 rounded-lg cursor-pointer bg-white border has-[:checked]:bg-blue-100"><input type="radio" name={`mc-${quest.id}-${qIndex}`} value={opt} checked={answers[`${quest.id}-${qIndex}`] === opt} onChange={() => handleInputChange(`${quest.id}-${qIndex}`, opt)} className="h-5 w-5 mr-3" /><span>{opt}</span></label>)}</div>}
                                        {q.type === 'TRUE_FALSE' && <div className="flex gap-4 mt-2">{["True", "False"].map(opt => <label key={opt} className="flex-1 p-3 rounded-lg cursor-pointer bg-white border has-[:checked]:bg-blue-100"><input type="radio" name={`tf-${quest.id}-${qIndex}`} value={opt} checked={answers[`${quest.id}-${qIndex}`] === opt} onChange={() => handleInputChange(`${quest.id}-${qIndex}`, opt)} className="h-5 w-5 mr-3" /><span>{opt}</span></label>)}</div>}
                                      </div>
                                    ))}
                                    <button onClick={() => handleSubmit(quest)} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600">Submit Quest</button>
                                </div>
                            )}

                            {/* REMOVED: Inline results section is no longer needed */}
                        </div>
                    );
                })}
            </main>

            {/* Fun Zone */}
            <aside className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-800">Fun Zone 🎈</h2>
              <div className="bg-white rounded-2xl shadow-md p-5">
                <h3 className="font-bold text-lg mb-4 text-purple-700">Memory Match</h3>
                <MemoryMatchGame />
              </div>
            </aside>
        </div>
      </div>
      
      {/* Results Modal */}
      <AnimatePresence>
        {evaluatedQuest && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
             <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-white rounded-3xl p-8 max-w-lg w-full text-center relative">
               {!isZeroScore && <Confetti numberOfPieces={150} recycle={false} />}
               {isZeroScore ? <Icons.BookOpen className="w-16 h-16 text-blue-500 mx-auto" /> : <Icons.Trophy className="w-16 h-16 text-yellow-500 mx-auto" />}
               <h2 className="text-3xl font-bold mt-4">{isZeroScore ? 'Keep Practicing!' : 'Quest Complete!'}</h2>
               <p className="text-slate-600 mb-4">{evaluatedQuest.title}</p>
               <div className="bg-sky-100 p-4 rounded-xl">
                 <p className="text-lg font-bold">Your Score:</p>
                 <p className="text-6xl font-extrabold text-sky-600">{evaluatedQuest.score.toFixed(0)}%</p>
                 <p className="text-sm font-semibold text-green-600">{evaluatedQuest.totalCorrect} / {evaluatedQuest.questions.length} Correct</p>
               </div>
               {evaluatedQuest.feedback && <p className="mt-4 p-3 bg-purple-50 rounded-lg italic"><b>Note from Parent:</b> {evaluatedQuest.feedback}</p>}
               <button onClick={() => setEvaluatedQuest(null)} className={`mt-6 text-white font-bold py-2 px-6 rounded-lg transition-colors ${isZeroScore ? 'bg-slate-500 hover:bg-slate-600' : 'bg-purple-600 hover:bg-purple-700'}`}>{isZeroScore ? 'Okay, Got It' : 'Awesome!'}</button>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}