'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useAuth } from '@/app/contexts/AuthContext';
import { useState, useEffect, SVGProps, ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

// --- GraphQL Imports ---
import { GET_CHILD_BY_ID, GET_MY_ASSIGNMENTS } from '@/graphql/queries';
import { UPDATE_ASSIGNMENT_STATUS } from '@/graphql/mutations';

type AnswerMap = Record<`${string}-${number}`, string>;

// --- SVG Icons ---
const Icons = {
    BookOpen: (props: SVGProps<SVGSVGElement>) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /> <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /> </svg> ),
    CheckCircle: (props: SVGProps<SVGSVGElement>) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /> <polyline points="22 4 12 14.01 9 11.01" /> </svg> ),
    Mail: (props: SVGProps<SVGSVGElement>) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /> <polyline points="22,6 12,13 2,6" /> </svg> ),
    Trophy: (props: SVGProps<SVGSVGElement>) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /> <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /> <path d="M4 22h16" /> <path d="M10 14.66V17c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-2.34l1.24-.98a2 2 0 0 1 2.52 0l1.24.98z" /> <path d="M14 14.66V17c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-2.34l-1.24-.98a2 2 0 0 0-2.52 0l-1.24.98z" /> <path d="M12 2v2" /> <path d="M12 12v2" /> </svg> ),
    Spinner: (props: SVGProps<SVGSVGElement>) => ( <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> </svg> ),
    Rocket: (props: SVGProps<SVGSVGElement>) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M6 2L3 6v12a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3.5 6h17M8 2v4M16 2v4" /> <path d="M12 18L8 22l-1.5-1.5" /> <path d="M12 18l4 4 1.5-1.5" /> </svg> ),
    Target: (props: SVGProps<SVGSVGElement>) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="10" /> <circle cx="12" cy="12" r="6" /> <circle cx="12" cy="12" r="2" /> </svg> ),
    Brain: (props: SVGProps<SVGSVGElement>) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M9.5 2A2.5 2.5 0 0112 4.5v0A2.5 2.5 0 019.5 7h0A2.5 2.5 0 017 4.5v0A2.5 2.5 0 019.5 2z" /> <path d="M14.5 2A2.5 2.5 0 0012 4.5v0A2.5 2.5 0 0014.5 7h0A2.5 2.5 0 0017 4.5v0A2.5 2.5 0 0014.5 2z" /> <path d="M12 16.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /> <path d="M12 16.5a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z" /> <path d="M2.5 12a10 10 0 0119 0" /> </svg> ),
    Award: (props: SVGProps<SVGSVGElement>) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="8" r="7" /> <polyline points="8.21 13.89 7 22 12 17 17 22 15.79 13.88" /> </svg> ),
};


// --- Type Definitions ---
interface Child { id: string; name: string; age: number; xp: number; badges: string[]; }
interface Question { type: 'EXPLAIN' | 'SHORT_ANSWER' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE'; prompt: string; options?: string[]; }
interface Assignment { id: string; title: string; description: string; status: 'PENDING' | 'COMPLETED' | 'EVALUATED'; questions: Question[]; feedback?: string; totalCorrect: number; score: number; createdAt: string; completedAt?: string | null; }
interface GetChildByIdData { getChildById: Child; }
interface GetMyAssignmentsData { getMyAssignments: Assignment[]; }

// --- CORRECTED Memory Match Game with Accurate Timer & Best Time ---
const MemoryMatchGame = () => {
    const emojis = ['🚀', '⭐', '🎉', '📚', '💡', '✅', '🎨', '🧩'];
    type Card = { id: number; content: string; };

    const [cards, setCards] = useState<Card[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [solved, setSolved] = useState<string[]>([]);

    // Timer State
    const [time, setTime] = useState(0);
    const [bestTime, setBestTime] = useState<number | null>(null);
    const [timerActive, setTimerActive] = useState(false);
    const [finalTime, setFinalTime] = useState(0);

    // Load best time from localStorage on initial render
    useEffect(() => {
        const savedBestTime = localStorage.getItem('memoryGameBestTime');
        if (savedBestTime) {
            setBestTime(parseInt(savedBestTime, 10));
        }
    }, []);

    // Function to initialize or reset the game
    const setupGame = () => {
        const gameCards = [...emojis, ...emojis]
            .sort(() => Math.random() - 0.5)
            .map((content, i) => ({ id: i, content }));
        setCards(gameCards);
        setFlipped([]);
        setSolved([]);
        setTime(0);
        setFinalTime(0);
        setTimerActive(false);
    };

    // Setup game on first load
    useEffect(() => {
        setupGame();
    }, []);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (timerActive) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timerActive]);

    // Game logic for matching cards
    useEffect(() => {
        if (flipped.length !== 2) return;

        const [firstIndex, secondIndex] = flipped;
        if (cards[firstIndex].content === cards[secondIndex].content) {
            // Use a callback with setSolved to ensure we have the latest state
            setSolved(prevSolved => {
                const newSolved = [...prevSolved, cards[firstIndex].content];

                // Check for win condition
                if (newSolved.length === emojis.length) {
                    setTimerActive(false); // Stop the timer
                    setFinalTime(time); // Record the final time for this round
                    // Check and set new best time
                    if (bestTime === null || time < bestTime) {
                        setBestTime(time);
                        localStorage.setItem('memoryGameBestTime', time.toString());
                    }
                }
                return newSolved;
            });
        }

        const timeoutId = setTimeout(() => setFlipped([]), 800);
        return () => clearTimeout(timeoutId);

    }, [flipped, cards]); // *** BUG FIX: Removed 'time' and 'bestTime' from dependencies

    const handleFlip = (index: number) => {
        if (solved.length === emojis.length || flipped.includes(index) || flipped.length === 2) {
            return; // Game is over or action is not allowed
        }

        // Start timer on first flip
        if (!timerActive) {
            setTimerActive(true);
        }
        
        setFlipped(prev => [...prev, index]);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const isGameWon = solved.length === emojis.length;
    const isNewBest = finalTime > 0 && finalTime === bestTime;

    return (
        <div className="bg-purple-50 rounded-2xl p-4">
            {/* Timer and Best Time Display */}
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="text-center">
                    <div className="font-bold text-lg text-slate-700">{formatTime(time)}</div>
                    <div className="text-xs text-slate-500">Current Time</div>
                </div>
                {bestTime !== null && (
                    <div className="text-center">
                        <div className="font-bold text-lg text-amber-500 flex items-center gap-1">
                            <Icons.Trophy className="w-4 h-4" /> {formatTime(bestTime)}
                        </div>
                        <div className="text-xs text-amber-600">Best Time</div>
                    </div>
                )}
            </div>

            {/* Game Grid */}
            <div className="relative">
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
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

                {/* Win Overlay */}
                <AnimatePresence>
                    {isGameWon && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center text-white text-center p-4"
                        >
                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                                {isNewBest ? (
                                    <>
                                        <Icons.Trophy className="w-12 h-12 text-yellow-300 mx-auto" />
                                        <h3 className="text-2xl font-bold mt-2 text-yellow-300">New Best Time!</h3>
                                    </>
                                ) : (
                                    <>
                                        <Icons.CheckCircle className="w-12 h-12 text-green-300 mx-auto" />
                                        <h3 className="text-2xl font-bold mt-2">You Won!</h3>
                                    </>
                                )}
                                <p className="font-semibold text-xl my-2">{formatTime(finalTime)}</p>
                                <button
                                    onClick={setupGame}
                                    className="mt-2 bg-white text-purple-700 font-bold py-2 px-5 rounded-lg hover:bg-purple-100 transition-colors"
                                >
                                    Play Again
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Badge Icon Mapping ---
const badgeIcons: { [key: string]: (props: SVGProps<SVGSVGElement>) => ReactElement } = {
    'First Quest': Icons.Rocket,
    'Perfect Score': Icons.Target,
    'Quick Learner': Icons.Brain,
    'default': Icons.Award, // Fallback icon
};


// --- Profile Header Component ---
const ProfileHeader = ({ child, level, xp, xpForCurrentLevel, progress }: {
  child: Child;
  level: number;
  xp: number;
  xpForCurrentLevel: number;
  progress: number;
}) => {
  const CIRCLE_RADIUS = 40;
  const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  return (
    <section className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <motion.img
          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(child.name)}`}
          alt="Avatar"
          className="w-28 h-28 rounded-full border-4 border-purple-400"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
        <div className="flex-1 w-full space-y-4">
          <h1 className="text-center md:text-left text-3xl sm:text-4xl font-bold text-slate-800">
            Welcome back, {child.name}!
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-2xl flex items-center justify-around gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-indigo-200 rounded-full mb-2">
                  <Icons.Trophy className="w-9 h-9 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-indigo-800">{level}</p>
                <p className="text-sm font-semibold text-indigo-500">Level</p>
              </div>
              <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={CIRCLE_RADIUS} fill="transparent" stroke="#e0e7ff" strokeWidth="10" />
                  <motion.circle cx="50" cy="50" r={CIRCLE_RADIUS} fill="transparent" stroke="#facc15" strokeWidth="10" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} initial={{ strokeDashoffset: CIRCUMFERENCE }} animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress / 100) }} transition={{ duration: 1.5, ease: "easeInOut" }} transform="rotate(-90 50 50)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-yellow-600">{xpForCurrentLevel}</span>
                  <span className="text-xs font-bold text-yellow-500">XP</span>
                </div>
              </div>
            </div>
            {child.badges?.length > 0 ? (
              <div className="bg-yellow-50 p-4 rounded-2xl">
                <h3 className="font-bold text-yellow-800 mb-2">Your Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {child.badges.map((badge, i) => {
                    const BadgeIcon = badgeIcons[badge] || badgeIcons.default;
                    return ( <span key={i} className="flex items-center gap-2 px-3 py-1 bg-yellow-200 text-yellow-900 text-sm font-semibold rounded-full"> <BadgeIcon className="w-4 h-4" /> {badge} </span> );
                  })}
                </div>
              </div>
            ) : ( <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center"> <Icons.BookOpen className="w-8 h-8 text-slate-400 mb-2"/> <p className="text-sm font-semibold text-slate-500">Complete quests to earn badges!</p> </div> )}
          </div>
        </div>
      </div>
    </section>
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

    const handleInputChange = (questQuestionId: string, value: string) => { setAnswers(prev => ({ ...prev, [questQuestionId]: value })); };
    const handleSubmit = async (quest: Assignment) => {
        const responsePayload: { questionIndex: number; answer: string }[] = quest.questions.map((q, i) => ({ questionIndex: i, answer: answers[`${quest.id}-${i}`] || '', }));
        if (responsePayload.some(res => !res.answer.trim())) { alert('Please answer all questions!'); return; }
        setSubmittingId(quest.id);
        try {
            await updateStatus({ variables: { assignmentId: quest.id, status: 'COMPLETED', responses: responsePayload } });
            await refetch();
        } catch (err) { alert('Oops! Something went wrong.'); } finally { setSubmittingId(null); }
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
                <ProfileHeader child={child} level={level} xp={xp} xpForCurrentLevel={xpForCurrentLevel} progress={progress} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <main className="lg:col-span-2 space-y-6">
                        <h2 className="text-3xl font-bold text-slate-800">Your Assignments 🗺️</h2>
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
                                            {isPending && <p className="text-slate-500 text-sm">{quest.description}</p>}
                                        </div>
                                        {isPending && !isSubmitting && <div className="flex items-center gap-2 text-blue-600 font-bold"><span>NEW!</span></div>}
                                        {isSubmitting && <Icons.Spinner className="animate-spin w-6 h-6 text-slate-400" />}
                                        {isCompleted && <div className="flex items-center gap-2 text-slate-500"><Icons.Mail className="w-5 h-5" /><span>Waiting for Review</span></div>}
                                        {isEvaluated && <button onClick={() => setEvaluatedQuest(quest)} className="flex items-center gap-2 text-green-600 font-bold"><Icons.CheckCircle className="w-6 h-6" /><span>View Results</span></button>}
                                    </div>
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
                                </div>
                            );
                        })}
                    </main>
                    <aside className="space-y-6">
                        <h2 className="text-3xl font-bold text-slate-800">Fun Zone 🎈</h2>
                        <div className="bg-white rounded-2xl shadow-md p-5">
                            <h3 className="font-bold text-lg mb-4 text-purple-700">የማስታወስ ብቃት ጌም</h3>
                            <MemoryMatchGame />
                        </div>
                    </aside>
                </div>
            </div>
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