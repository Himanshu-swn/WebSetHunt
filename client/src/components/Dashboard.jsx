import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Leaderboard from "./Leaderboard";

const Dashboard = ({ initialTime = 0 }) => {
  const [imageURL, setImageURL] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionNumber, setquestionNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [time, setTime] = useState(initialTime);
  const [endTimeReached, setEndTimeReached] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  // Demo mode questions
  const demoQuestions = [
    {
      queNo: "DEMO-1",
      queUrl: "1.jpg",
      answer: "leaning tower of pisa"
    },
    {
      queNo: "DEMO-2",
      queUrl: "2.jpg",
      answer: "library of congress"
    },

  ];
  
  const [currentDemoQuestion, setCurrentDemoQuestion] = useState(0);

  const calculateTimeUntilEnd = () => {
    const now = new Date();
    const endTime = new Date();

    endTime.setHours(3, 0, 0, 0);

    if (now > endTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    return Math.floor((endTime - now) / 1000);
  };

  const fetchTestData = async () => {
    if (demoMode) {
      // In demo mode, use the current demo question
      setImageURL(demoQuestions[currentDemoQuestion].queUrl);
      setquestionNumber(demoQuestions[currentDemoQuestion].queNo);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/dashboard/contest/1`,
        { withCredentials: true }
      );
      setImageURL(response.data.question.queUrl);
      setquestionNumber(response.data.question.queNo);

      if (response.data.question.queUrl === "testcompleted") {
        setTestCompleted(true);
      }
    } catch (error) {
      console.error("Error fetching test data:", error);
      toast("Connection to mission server failed. Retrying...");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (demoMode) {
      // If in demo mode, fetch demo data immediately
      setTestStarted(true);
      setIsLoading(false);
      fetchTestData();
    } else if (time > 0 && !demoMode) {
      // Normal timer for production mode
      const timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (time <= 0 && !testStarted && !demoMode) {
      setTestStarted(true);
    }
  }, [time, testStarted, demoMode]);

  // Effect for monitoring test end time - only in non-demo mode
  useEffect(() => {
    if (testStarted && !testCompleted && !endTimeReached && !demoMode) {
      const checkEndTime = setInterval(() => {
        const timeRemaining = calculateTimeUntilEnd();

        // End test when time reaches 0
        if (timeRemaining <= 0) {
          setEndTimeReached(true);
          setTestCompleted(true);
          clearInterval(checkEndTime);
        }
      }, 1000);

      return () => clearInterval(checkEndTime);
    }
  }, [testStarted, testCompleted, endTimeReached, demoMode]);

  useEffect(() => {
    if ((testStarted && !testCompleted) || demoMode) {
      fetchTestData();
    }
  }, [testStarted, testCompleted, demoMode, currentDemoQuestion]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!answer.trim()) {
      toast("Input required to proceed with decryption");
      return;
    }

    setIsSubmitting(true);

    if (demoMode) {
      // Handle demo mode submissions
      setTimeout(() => {
        if (answer.toLowerCase() === demoQuestions[currentDemoQuestion].answer) {
          toast("Decryption successful!");
          
          if (currentDemoQuestion < demoQuestions.length - 1) {
            setCurrentDemoQuestion(prev => prev + 1);
          } else {
            toast("Demo completed! You've finished all demo questions.");
            setTestCompleted(true);
          }
          setAnswer("");
        } else {
          toast("Decryption failed. Try again.");
        }
        setIsSubmitting(false);
      }, 1000); // Simulate server delay
      
      return;
    }

    try {
      // setIsLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/api/dashboard/contest/1`,
        { answer },
        { withCredentials: true }
      );

      if (response.data.status) {
        toast(response.data.message || "Decryption successful!");

        if (
          response.data.question &&
          response.data.question.queUrl === "testcompleted"
        ) {
          setTestCompleted(true);
        } else {
          fetchTestData();
          setAnswer("");
        }
      } else {
        toast(response.data.message || "Decryption failed. Try again.");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast("Connection failure during decryption attempt.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const toggleDemoMode = () => {
    if (demoMode) {
      // Turning off demo mode - reset to normal state
      setDemoMode(false);
      setCurrentDemoQuestion(0);
      setTestStarted(false);
      setTestCompleted(false);
      setTime(initialTime);
      setAnswer("");
      setIsLoading(true);
      
      // If we should start immediately
      if (initialTime === 0) {
        setTestStarted(true);
        fetchTestData();
      }
    } else {
      // Turning on demo mode
      setDemoMode(true);
      setTestStarted(true);
      setTestCompleted(false);
      setAnswer("");
    }
  };

  const RemainingTime = () => {
    const [endRemaining, setEndRemaining] = useState(calculateTimeUntilEnd());

    useEffect(() => {
      if (demoMode) return; // Don't run timer in demo mode
      
      const timer = setInterval(() => {
        const remaining = calculateTimeUntilEnd();
        setEndRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    if (demoMode) {
      return (
        <div className="bg-yellow-900/30 border border-yellow-500/50 px-4 py-2 rounded-lg shadow-lg shadow-yellow-500/10 font-mono flex items-center gap-3">
          <svg
            className="mb-0.5 mx-2 h-5 w-6 text-yellow-500 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-yellow-400">DEMO MODE</span>
        </div>
      );
    }

    const hours = Math.floor(endRemaining / 3600);
    const minutes = Math.floor((endRemaining % 3600) / 60);
    const seconds = endRemaining % 60;

    return (
      <div className="bg-green-900/30 border border-green-500/50 px-4 py-2 rounded-lg shadow-lg shadow-green-500/10 font-mono flex items-center gap-3">
        <svg
          className="mb-0.5 mx-2 h-5 w-6 text-green-500 animate-pulse"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-green-400">
          HUNT ENDS IN: {hours.toString().padStart(2, "0")}:
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </span>
      </div>
    );
  };

  // Demo Mode Toggle Button - now conditionally rendered
  const DemoModeToggle = () => (
    <button
      onClick={toggleDemoMode}
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg font-mono font-bold shadow-lg transition-colors flex items-center gap-2 ${
        demoMode 
          ? "bg-yellow-600 hover:bg-yellow-700 text-white border border-yellow-500/50" 
          : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/50"
      }`}
      style={{ marginBottom: "10px" }}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {demoMode ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        )}
      </svg>
      {demoMode ? "EXIT DEMO" : "TRY DEMO"}
    </button>
  );

  // Function to determine whether to show the demo button
  const shouldShowDemoButton = () => {
    // Only show during countdown or in demo mode - hide when actual contest starts
    return time > 0 || demoMode;
  };

  if (testCompleted && !demoMode) return <Leaderboard />;
  
  if (testCompleted && demoMode) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-black bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1),transparent_70%)]">
        <div className="backdrop-blur-sm bg-black/70 border-2 border-yellow-500/50 p-8 rounded-lg shadow-lg shadow-yellow-500/20 max-w-md w-full">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-yellow-400 font-mono">
              DEMO COMPLETED
            </h2>
            <p className="text-white">
              You've completed all demo questions! In a real contest, you would see the leaderboard here.
            </p>
            <button
              onClick={toggleDemoMode}
              className="w-full py-3 bg-yellow-800 hover:bg-yellow-700 text-white font-mono font-bold rounded-lg transition-colors border border-yellow-500/50 shadow-lg"
            >
              EXIT DEMO MODE
            </button>
          </div>
        </div>
        
        {/* Only show demo button conditionally */}
        {shouldShowDemoButton() && <DemoModeToggle />}
      </div>
    );
  }

  if (time > 0 && !demoMode) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return (
      <div className="flex flex-col items-center justify-center p-20 bg-black bg-[radial-gradient(circle_at_center,rgba(0,128,0,0.1),transparent_70%)]">
        <div className="backdrop-blur-sm bg-black/70 border-2 border-green-500/50 p-8 rounded-lg shadow-lg shadow-green-500/20 max-w-md w-full">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-green-400 font-mono">
              WEB SET HUNT WILL START SHORTLY
            </h2>

            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center relative">
                <div className="text-green-400 font-mono text-xl font-bold">
                  {seconds}
                </div>
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                >
                  <circle
                    className="text-green-900/50"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-green-500"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - seconds / 60)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="50"
                    cy="50"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center text-white font-mono">
              <div className="text-3xl font-bold mb-2">
                {hours.toString().padStart(2, "0")}:
                {minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
              </div>
              <p className="text-green-400">UNTIL WE BEGIN</p>
            </div>
          </div>
        </div>
        
        {/* Only show demo button conditionally */}
        {shouldShowDemoButton() && <DemoModeToggle />}
      </div>
    );
  }

  // Show loading while fetching question
  if (isLoading && !demoMode) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black bg-[radial-gradient(circle_at_center,rgba(0,128,0,0.1),transparent_70%)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-14 w-14 border-4 border-green-500 border-t-transparent rounded-full shadow-lg shadow-green-500/30"></div>
          <p className="text-green-400 font-mono mt-4">
            FETCHING DASHBOARD ...
          </p>
        </div>
        
        {/* Only show demo button conditionally */}
        {shouldShowDemoButton() && <DemoModeToggle />}
      </div>
    );
  }

  // Show test content (for both normal and demo mode)
  const bgGradient = demoMode 
    ? "bg-black bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1),transparent_70%)]"
    : "bg-black bg-[radial-gradient(circle_at_center,rgba(0,128,0,0.1),transparent_70%)]";
  
  const borderColor = demoMode ? "border-yellow-500/50" : "border-green-500/50";
  const textColor = demoMode ? "text-yellow-400" : "text-green-400";
  const bgColor = demoMode ? "bg-yellow-900/30" : "bg-green-900/30";
  const shadowColor = demoMode ? "shadow-yellow-500/20" : "shadow-green-500/20";
  const buttonBgColor = demoMode ? "bg-yellow-800 hover:bg-yellow-700" : "bg-green-800 hover:bg-green-700";

  return (
    <div className={`flex flex-col items-center min-h-screen p-6 ${bgGradient}`}>
      <div className="w-full max-w-5xl">
        {/* Terminal-like header */}
        <div className={`${bgColor} border-t-2 border-l-2 border-r-2 ${borderColor} rounded-t-lg p-3 flex items-center`}>
          <div className="flex space-x-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className={`font-mono ${textColor} flex-1 text-center text-sm`}>
            {demoMode ? "DEMO MODE - DECRYPTION CHALLENGE" : "DECRYPTION CHALLENGE"}
          </div>
        </div>

        {/* Main content */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <div className={`backdrop-blur-sm bg-black/70 border-2 ${borderColor} p-8 rounded-b-lg shadow-lg ${shadowColor}`}>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg
                className={`h-6 w-6 ${demoMode ? "text-yellow-400" : "text-yellow-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className={`text-2xl text-yellow-400 font-mono font-bold tracking-wider`}>
                PROBLEM: {questionNumber}
              </h2>
            </div>
            <RemainingTime />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`md:col-span-2 bg-black/60 rounded-lg border ${borderColor} shadow-lg overflow-hidden`}>
              {imageURL && (
                <div className="relative pt-6 pb-6">
                  {" "}
                  <div className={`absolute top-0 left-0 right-0 ${bgColor} py-1 px-3 font-mono text-xs ${textColor} flex justify-between`}>
                    <span>ENCRYPTED_DATA.IMG</span>
                  </div>
                  <img
                    className="w-full object-cover mt-6 mb-6"
                    src={imageURL}
                    alt="Encrypted Data"
                  />
                  <div className={`absolute bottom-0 left-0 right-0 ${bgColor} py-1 px-3 font-mono text-xs ${textColor} flex justify-between`}>
                    <span>{demoMode ? "WSH DEMO | TV" : "WSH 2025 | TV"}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-1">
              <div className={`${demoMode ? "bg-yellow-900/10" : "bg-green-900/10"} p-6 rounded-lg border ${borderColor} shadow-lg h-full flex flex-col`}>
                <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
                  <div className="flex-1 mb-4">
                    <label className={`${textColor} font-mono text-sm mb-2 block`}>
                      ENTER YOUR ANSWER
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`mt-5 w-full p-3 bg-black border-2 ${borderColor} rounded-lg ${textColor} font-mono focus:outline-none focus:border-${demoMode ? "yellow" : "green"}-400 focus:ring-1 focus:ring-${demoMode ? "yellow" : "green"}-400 placeholder-${demoMode ? "yellow" : "green"}-700`}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3 ${buttonBgColor} text-white font-mono font-bold rounded-lg transition-colors border ${borderColor} shadow-lg flex items-center justify-center gap-2`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>PROCESSING...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="mb-1 h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <span>{isSubmitting ? 'Processing...' : 'Submit'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`text-center text-xs ${demoMode ? "text-yellow-500/50" : "text-green-500/50"} font-mono mt-8 pt-4 border-t ${demoMode ? "border-yellow-500/20" : "border-green-500/20"}`}>
            {demoMode ? "DEMO MODE • " : "SECURE CONNECTION • "}{new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Only show demo button conditionally */}
      {shouldShowDemoButton() && <DemoModeToggle />}
    </div>
  );
};

export default Dashboard;