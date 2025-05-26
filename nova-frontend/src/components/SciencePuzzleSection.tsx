// src/components/SciencePuzzleSection.tsx
"use client";

import { gql, useLazyQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { GENERATE_PUZZLE } from '@/graphql/queries';
import { EVALUATE_PUZZLE_ANSWER } from '@/graphql/queries';

const TOPICS = [
  { label: "Biology", emoji: "🧬" },
  { label: "Astronomy", emoji: "🌌" },
  { label: "Animals", emoji: "🐘" },
  { label: "Earth", emoji: "🌍" },
  { label: "Physics", emoji: "⚛️" },
  { label: "Chemistry", emoji: "🧪" },
];

export default function SciencePuzzleSection() {
  const { id: childId } = useParams();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const [generate, { loading, data }] = useLazyQuery(GENERATE_PUZZLE);
  const [evaluateAnswer] = useLazyQuery(EVALUATE_PUZZLE_ANSWER);

  const puzzle = data?.generatePuzzleFromTopic;

  useEffect(() => {
    if (!childId) return;
    const todayKey = new Date().toISOString().split("T")[0];
    const fullKey = `puzzleClicks-${childId}`;
    const stored = localStorage.getItem(fullKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === todayKey) {
        setClickCount(parsed.count);
      }
    }
  }, [childId]);

  const handleTopicClick = (topic: string) => {
    if (clickCount >= 2) {
      alert("🚫 You've reached your 2 puzzle limit for today. Come back tomorrow!");
      return;
    }

    const todayKey = new Date().toISOString().split("T")[0];
    const fullKey = `puzzleClicks-${childId}`;
    const newCount = clickCount + 1;

    setClickCount(newCount);
    localStorage.setItem(fullKey, JSON.stringify({ date: todayKey, count: newCount }));

    setSelectedTopic(topic);
    setRevealAnswer(false);
    setUserAnswer("");
    setFeedback(null);
    generate({ variables: { topic } });
  };

  const handleSubmitAnswer = () => {
    if (!puzzle?.question || !userAnswer.trim()) return;
    evaluateAnswer({
      variables: { question: puzzle.question, userAnswer },
      onCompleted: (res) => {
        setFeedback(res.evaluatePuzzleAnswer.feedback);
      },
    });
  };

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold text-green-700 mb-4">🔍 Explore a Science Puzzle</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        {TOPICS.map(({ label, emoji }) => (
          <button
            key={label}
            onClick={() => handleTopicClick(label)}
            className={`px-4 py-2 rounded-lg font-semibold shadow-sm border border-gray-300 hover:bg-green-50 transition ${
              selectedTopic === label ? "bg-green-100 text-green-800" : "bg-white text-gray-800"
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">🔄 Generating your puzzle...</p>}

      {puzzle && (
        <div className="mt-6 text-center">
          <img
            src={puzzle.imageUrl}
            alt="Puzzle visual"
            className="mx-auto rounded shadow-lg w-full max-w-md"
          />

          <p className="mt-4 text-lg font-medium text-gray-800">❓ {puzzle.question}</p>

          <input
            type="text"
            placeholder="Your answer..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="mt-4 w-full max-w-md px-4 py-2 rounded border border-gray-300 text-base"
          />

          <button
            onClick={handleSubmitAnswer}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Answer
          </button>

          {feedback && (
            <p className="mt-4 text-indigo-700 font-medium text-lg">💬 {feedback}</p>
          )}

          {!revealAnswer ? (
            <button
              onClick={() => setRevealAnswer(true)}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Reveal Answer
            </button>
          ) : (
            <p className="mt-4 text-green-700 font-semibold text-xl">
              ✅ Correct Answer is: {puzzle.answer}
            </p>
          )}
        </div>
      )}
    </section>
  );
}