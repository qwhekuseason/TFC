import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { X, Trophy, Star, Clock, CheckCircle, XCircle, RotateCcw, Award } from 'lucide-react';

interface BibleQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  verse?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const BIBLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Who was the first man created by God?",
    options: ["Noah", "Adam", "Moses", "Abraham"],
    correct: 1,
    verse: "Genesis 2:7",
    difficulty: "easy"
  },
  {
    id: 2,
    question: "How many days did God take to create the world?",
    options: ["5", "6", "7", "8"],
    correct: 1,
    verse: "Genesis 1:31",
    difficulty: "easy"
  },
  {
    id: 3,
    question: "Who built the ark?",
    options: ["Moses", "David", "Noah", "Solomon"],
    correct: 2,
    verse: "Genesis 6:14",
    difficulty: "easy"
  },
  {
    id: 4,
    question: "What was the name of Moses' brother?",
    options: ["Aaron", "Joshua", "Caleb", "Samuel"],
    correct: 0,
    verse: "Exodus 4:14",
    difficulty: "medium"
  },
  {
    id: 5,
    question: "How many apostles did Jesus choose?",
    options: ["10", "11", "12", "13"],
    correct: 2,
    verse: "Matthew 10:1",
    difficulty: "easy"
  },
  {
    id: 6,
    question: "Who was known as the 'beloved disciple'?",
    options: ["Peter", "John", "James", "Andrew"],
    correct: 1,
    verse: "John 13:23",
    difficulty: "medium"
  },
  {
    id: 7,
    question: "What was the first miracle Jesus performed?",
    options: ["Healing the blind", "Walking on water", "Turning water into wine", "Feeding 5000"],
    correct: 2,
    verse: "John 2:11",
    difficulty: "medium"
  },
  {
    id: 8,
    question: "Who was the strongest man in the Bible?",
    options: ["David", "Goliath", "Samson", "Joshua"],
    correct: 2,
    verse: "Judges 16:17",
    difficulty: "easy"
  },
  {
    id: 9,
    question: "How many books are in the New Testament?",
    options: ["25", "26", "27", "28"],
    correct: 2,
    verse: "",
    difficulty: "hard"
  },
  {
    id: 10,
    question: "Who wrote the most books in the New Testament?",
    options: ["Peter", "John", "Paul", "Luke"],
    correct: 2,
    verse: "",
    difficulty: "hard"
  }
];

export default function BibleQuiz({ isOpen, onClose }: BibleQuizProps) {
  const { isDarkMode } = useTheme();
  const { userData } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0 && !showResult && !quizCompleted) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleNextQuestion();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, showResult, quizCompleted]);

  const startQuiz = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    setTimeLeft(30);
    setUserAnswers([]);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(answerIndex);
      setShowResult(true);
      
      const newAnswers = [...userAnswers, answerIndex];
      setUserAnswers(newAnswers);
      
      if (answerIndex === BIBLE_QUESTIONS[currentQuestion].correct) {
        setScore(score + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      // Time ran out, record as wrong answer
      setUserAnswers([...userAnswers, -1]);
    }
    
    if (currentQuestion < BIBLE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setGameStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    setTimeLeft(30);
    setUserAnswers([]);
  };

  const getScoreMessage = () => {
    const percentage = (score / BIBLE_QUESTIONS.length) * 100;
    if (percentage >= 90) return "Excellent! You're a Bible scholar! 🌟";
    if (percentage >= 70) return "Great job! Keep studying God's word! 📖";
    if (percentage >= 50) return "Good effort! Continue growing in faith! 🌱";
    return "Keep reading and learning! God's word is a lamp to your feet! 💡";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`absolute inset-4 max-w-4xl mx-auto my-auto ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-3xl shadow-2xl overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">Bible Quiz Challenge</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="h-96 overflow-y-auto">
          {!gameStarted ? (
            // Welcome Screen
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome to Bible Quiz!
              </h3>
              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Test your knowledge of God's word with {BIBLE_QUESTIONS.length} questions
              </p>
              <div className={`grid grid-cols-3 gap-4 mb-8 p-4 rounded-xl ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="text-center">
                  <Clock className={`w-6 h-6 mx-auto mb-2 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    30 seconds
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    per question
                  </p>
                </div>
                <div className="text-center">
                  <Star className={`w-6 h-6 mx-auto mb-2 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Earn Points
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    for correct answers
                  </p>
                </div>
                <div className="text-center">
                  <Award className={`w-6 h-6 mx-auto mb-2 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Get Ranked
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    based on score
                  </p>
                </div>
              </div>
              <button
                onClick={startQuiz}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Start Quiz
              </button>
            </div>
          ) : quizCompleted ? (
            // Results Screen
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Quiz Completed!
              </h3>
              <div className={`text-4xl font-bold mb-2 ${
                score >= BIBLE_QUESTIONS.length * 0.7 ? 'text-green-500' : 
                score >= BIBLE_QUESTIONS.length * 0.5 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {score}/{BIBLE_QUESTIONS.length}
              </div>
              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {getScoreMessage()}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetQuiz}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={onClose}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Quiz Question
            <div className="p-8">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Question {currentQuestion + 1} of {BIBLE_QUESTIONS.length}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Clock className={`w-4 h-4 ${
                      timeLeft <= 10 ? 'text-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      timeLeft <= 10 ? 'text-red-500' : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {timeLeft}s
                    </span>
                  </div>
                </div>
                <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / BIBLE_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    BIBLE_QUESTIONS[currentQuestion].difficulty === 'easy' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : BIBLE_QUESTIONS[currentQuestion].difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {BIBLE_QUESTIONS[currentQuestion].difficulty.toUpperCase()}
                  </span>
                  {BIBLE_QUESTIONS[currentQuestion].verse && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {BIBLE_QUESTIONS[currentQuestion].verse}
                    </span>
                  )}
                </div>
                <h3 className={`text-xl font-semibold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {BIBLE_QUESTIONS[currentQuestion].question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {BIBLE_QUESTIONS[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedAnswer === null
                        ? isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                        : selectedAnswer === index
                          ? index === BIBLE_QUESTIONS[currentQuestion].correct
                            ? 'bg-green-100 border-2 border-green-500 text-green-700'
                            : 'bg-red-100 border-2 border-red-500 text-red-700'
                          : index === BIBLE_QUESTIONS[currentQuestion].correct
                            ? 'bg-green-100 border-2 border-green-500 text-green-700'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {selectedAnswer !== null && (
                        <div>
                          {index === BIBLE_QUESTIONS[currentQuestion].correct ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : selectedAnswer === index ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Next Button */}
              {showResult && (
                <div className="text-center">
                  <button
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    {currentQuestion < BIBLE_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}