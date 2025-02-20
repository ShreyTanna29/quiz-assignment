import { useState, useEffect, useRef } from "react";
import { saveQuizAttempt, getQuizAttempts, QuizAttempt } from "../utils/db";
import { motion, AnimatePresence } from "framer-motion";
import { quizQuestions } from "../utils/quiz";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showFailPopup, setShowFailPopup] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<QuizAttempt[]>([]);
  const [showAttempts, setShowAttempts] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0 && !showResult && !showFailPopup) {
        setTimeLeft((prev) => prev - 1);
      } else if (timeLeft === 0) {
        handleTimeout();
      }
    }, 1000);

    // Clear interval when quiz is completed or failed
    if (showResult || showFailPopup) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [timeLeft, showResult, showFailPopup]);

  const handleTimeout = () => {
    setIncorrectAnswers((prev) => prev + 1);
    if (incorrectAnswers + 1 >= 3) {
      setShowFailPopup(true);
    } else {
      goToNextQuestion();
    }
  };

  const saveResult = async () => {
    const attempt: QuizAttempt = {
      date: new Date(),
      score: Math.round(
        ((quizQuestions.length - incorrectAnswers) / quizQuestions.length) * 100
      ),
      correctAnswers: quizQuestions.length - incorrectAnswers,
      totalQuestions: quizQuestions.length,
    };
    await saveQuizAttempt(attempt);
  };

  const loadPreviousAttempts = async () => {
    const attempts = await getQuizAttempts();
    setPreviousAttempts(attempts);
    setShowAttempts(true);
  };

  const handleAnswerSelect = (answer: string, optionKey?: string) => {
    setSelectedAnswer(optionKey || answer);
    const currentQ = quizQuestions[currentQuestion];
    let isCorrect = false;

    if (currentQ.type === "mcq") {
      isCorrect = optionKey === currentQ.answer;
    } else if (currentQ.type === "integer") {
      isCorrect = parseInt(answer) === currentQ.answer;
    }

    if (!isCorrect) {
      setIncorrectAnswers((prev) => prev + 1);
      if (incorrectAnswers + 1 >= 3) {
        setShowFailPopup(true);
        return;
      }
    }

    setTimeout(() => {
      goToNextQuestion();
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }, 1000);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimeLeft(30);
      setSelectedAnswer("");
    } else {
      setShowResult(true);
      saveResult();
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setIncorrectAnswers(0);
    setTimeLeft(30);
    setShowResult(false);
    setSelectedAnswer("");
    setShowFailPopup(false);
  };

  const renderQuestion = () => {
    const currentQ = quizQuestions[currentQuestion];

    if (currentQ.type === "mcq") {
      return (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {currentQ.options &&
              Object.entries(currentQ.options).map(([key, value]) => (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(value, key)}
                  className={`p-4 rounded-lg text-left transition-colors cursor-pointer ${
                    selectedAnswer
                      ? key === currentQ.answer
                        ? "bg-green-500 text-white"
                        : key === selectedAnswer
                        ? "bg-red-500 text-white"
                        : "bg-gray-100"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {key}: {value}
                </motion.button>
              ))}
          </AnimatePresence>
        </div>
      );
    } else if (currentQ.type === "integer") {
      return (
        <div className="mt-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="number"
              placeholder="Enter your answer"
              className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAnswerSelect(e.currentTarget.value);
                }
              }}
            />
            {selectedAnswer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 mr-6"
              >
                {parseInt(selectedAnswer) === currentQ.answer ? (
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <div className="absolute top-full mt-2 right-0 bg-gray-800 text-white px-3 py-1 rounded text-sm">
                      Correct answer: {currentQ.answer}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">Press Enter to submit</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {!showFailPopup && !showResult && (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-600">
                  Question {currentQuestion + 1}/{quizQuestions.length}
                </span>
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
                  transition={{ repeat: timeLeft <= 5 ? Infinity : 0 }}
                  className={`text-lg font-bold ${
                    timeLeft <= 5 ? "text-red-500" : "text-blue-500"
                  }`}
                >
                  {timeLeft}s
                </motion.div>
              </div>
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${(timeLeft / 30) * 100}%` }}
                className="h-2 bg-blue-500 rounded-full"
              />
            </div>

            <motion.h2
              key={currentQuestion}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl font-bold mb-8 text-gray-800"
            >
              {quizQuestions[currentQuestion].question}
            </motion.h2>

            {renderQuestion()}
          </>
        )}

        {showFailPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-red-500 mb-6">
              Test Failed!
            </h2>
            <p className="text-gray-600 mb-8">
              You've given 3 incorrect answers. Would you like to try again?
            </p>
            <button
              onClick={restartQuiz}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Restart Quiz
            </button>
          </motion.div>
        )}

        {showResult && !showFailPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-green-500 mb-6">
              Quiz Completed!
            </h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-700">
                    Correct Answers
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {quizQuestions.length - incorrectAnswers}
                  </p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-700">
                    Incorrect Answers
                  </h3>
                  <p className="text-3xl font-bold text-red-600">
                    {incorrectAnswers}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${
                        ((quizQuestions.length - incorrectAnswers) /
                          quizQuestions.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-lg text-gray-700 mb-2">
                Final Score:{" "}
                {Math.round(
                  ((quizQuestions.length - incorrectAnswers) /
                    quizQuestions.length) *
                    100
                )}
                %
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center">
              <button
                onClick={restartQuiz}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto cursor-pointer "
              >
                Take Quiz Again
              </button>
              <button
                onClick={loadPreviousAttempts}
                className=" bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-600 transition-colors w-full sm:w-auto cursor-pointer"
              >
                Show Previous Attempts
              </button>
            </div>
            {showAttempts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8 bg-white p-6 rounded-lg shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Previous Attempts</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAttempts(false)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {previousAttempts.map((attempt, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b pb-4"
                    >
                      <p className="font-semibold">
                        Date: {new Date(attempt.date).toLocaleDateString()}
                      </p>
                      <p>Score: {attempt.score}%</p>
                      <p>
                        Correct Answers: {attempt.correctAnswers}/
                        {attempt.totalQuestions}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
