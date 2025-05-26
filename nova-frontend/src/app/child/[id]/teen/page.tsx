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
          {/* Right Column: Trivia (UNCHANGED) */}
            <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-purple-200">
                <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-6 flex items-center">
                    <span className="mr-3">🎉</span> Fun Trivia
                </h2>

                <button
                    onClick={() => {
                        fetchTrivia();
                        setScore(0);
                        setSelectedAnswers({});
                    }}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md transform hover:-translate-y-0.5 mb-6"
                >
                    🧠 Load New Trivia Questions
                </button>

                {showTrivia && (
                    <>
                        {loadingTrivia ? (
                            <p className="text-center text-gray-500 italic text-lg p-4 bg-purple-50 rounded-lg">Loading exciting trivia...</p>
                        ) : (
                            <div className="space-y-6">
                                {questions.length === 0 ? (
                                    <p className="text-center text-gray-500 italic text-lg p-4 bg-purple-50 rounded-lg">
                                        Click "Load New Trivia Questions" to start!
                                    </p>
                                ) : (
                                    questions.map((q, index) => {
                                        const correct = q.correct_answer;
                                        const decodedQuestion = decodeURIComponent(q.question);
                                        const decodedOptions = [...q.incorrect_answers, correct].map(opt => decodeURIComponent(opt)).sort(() => Math.random() - 0.5);
                                        const selected = selectedAnswers[index];

                                        return (
                                            <div key={index} className="bg-white p-5 rounded-lg shadow-md border border-purple-100 transition-all duration-300 hover:shadow-xl">
                                                <h3 className="font-bold text-xl text-purple-800 mb-3">
                                                    {index + 1}. {decodedQuestion}
                                                </h3>
                                                <div className="mt-2 space-y-3">
                                                    {decodedOptions.map((opt, i) => {
                                                        const isSelected = selected === opt;
                                                        const isCorrect = decodeURIComponent(opt) === decodeURIComponent(correct);
                                                        const wasClicked = selected !== undefined;

                                                        let btnStyle = "bg-blue-100 text-blue-800 hover:bg-blue-200";

                                                        if (wasClicked) {
                                                            if (isCorrect) {
                                                                btnStyle = "bg-green-200 text-green-900 border-green-400";
                                                            } else if (isSelected) {
                                                                btnStyle = "bg-red-200 text-red-900 border-red-400";
                                                            } else {
                                                                btnStyle = "bg-gray-100 text-gray-600 border-gray-200 opacity-70";
                                                            }
                                                        } else if (isSelected) {
                                                                btnStyle = "bg-blue-300 text-blue-900 border-blue-400";
                                                        }

                                                        return (
                                                            <button
                                                                key={i}
                                                                disabled={wasClicked}
                                                                onClick={() => handleTriviaAnswer(index, opt, correct)}
                                                                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ease-in-out border ${btnStyle} transform hover:scale-[1.01]`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {questions.length > 0 && (
                                    <p className="mt-6 text-2xl font-extrabold text-purple-600 text-center bg-purple-50 p-4 rounded-lg shadow-inner">
                                        🎯 Score: {score} / {questions.length}
                                    </p>
                                )}

                                {Object.keys(selectedAnswers).length === questions.length && questions.length > 0 && (
                                    <p className="text-green-700 text-lg mt-4 font-semibold text-center bg-green-50 p-3 rounded-lg shadow-sm animate-pulse">
                                        ✅ Your trivia score has been saved!
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </section>
  );
}
