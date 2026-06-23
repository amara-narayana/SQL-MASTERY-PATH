import { useState, useEffect } from "react";
import { BookOpen, Code, Layers, MessageSquare, Award, Sparkles, FolderKanban, LogOut, CheckCircle2 } from "lucide-react";
import { UserProgress, PracticeExercise } from "./types";
import CurriculumView from "./components/CurriculumView";
import SQLPlayground from "./components/SQLPlayground";
import AnimatedSQLVisualizer from "./components/AnimatedSQLVisualizer";
import InterviewPrep from "./components/InterviewPrep";
import CaseProjects from "./components/CaseProjects";

export default function App() {
  const [activeTab, setActiveTab] = useState<"curriculum" | "playground" | "visualizer" | "interview" | "projects">("curriculum");
  const [selectedExercise, setSelectedExercise] = useState<PracticeExercise | undefined>(undefined);

  // Durable Progress Tracking State
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedDays: [],
    completedExercises: {},
    completedProjects: {},
    savedQueries: {},
    interviewHistory: []
  });

  // Load progress from localStorage on initialization
  useEffect(() => {
    const saved = localStorage.getItem("sql_data_analyst_path_progress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.completedDays)) {
          setUserProgress(parsed);
        }
      } catch (e) {
        console.error("Local storage progress retrieval failed:", e);
      }
    }
  }, []);

  // Sync state changes to storage
  const handleUpdateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setUserProgress(prev => {
      const updated = updater(prev);
      localStorage.setItem("sql_data_analyst_path_progress", JSON.stringify(updated));
      return updated;
    });
  };

  // Helper to deep load exercise directly to the playground tab
  const handleSelectPlaygroundWithExercise = (exercise: PracticeExercise) => {
    setSelectedExercise(exercise);
    setActiveTab("playground");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased font-sans" id="application-root">
      {/* Upper Navigation Header bar */}
      <header className="bg-white border-b border-slate-200 flex items-center justify-between px-8 py-4 sticky top-0 z-50 shadow-xs" id="app-navbar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs uppercase shadow-xs">
            SQL
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900 flex items-center gap-2">
              Data Analyst Path
              <span className="text-[10px] font-semibold font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100/60">Beginner to Job-Ready</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-normal">Your 4-Month Curated Interactive Syllabus & Sandbox</p>
          </div>
        </div>

        {/* Global check indicators */}
        <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-slate-700">Syllabus: {userProgress.completedDays.length} / 120 Days</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-current animate-pulse" />
            <span className="font-semibold text-slate-700">Solved: {Object.keys(userProgress.completedExercises).length} Tasks</span>
          </div>
        </div>
      </header>

      {/* Primary Center Workspace Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Navigation Tabs bar switcher */}
        <nav className="flex overflow-x-auto border-b border-slate-200 pb-0.5 gap-2" id="main-navigation-tabs">
          <button
            onClick={() => {
              setActiveTab("curriculum");
              setSelectedExercise(undefined);
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "curriculum"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            id="tab-selector-curriculum"
          >
            <BookOpen className="w-4 h-4" />
            📘 Curriculum Platform
          </button>

          <button
            onClick={() => {
              setActiveTab("playground");
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "playground"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            id="tab-selector-playground"
          >
            <Code className="w-4 h-4" />
            💻 Interactive SQL Playground
          </button>

          <button
            onClick={() => setActiveTab("visualizer")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "visualizer"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            id="tab-selector-visualizer"
          >
            <Layers className="w-4 h-4" />
            🚀 Animated Explanations
          </button>

          <button
            onClick={() => setActiveTab("interview")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "interview"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            id="tab-selector-interview"
          >
            <MessageSquare className="w-4 h-4" />
            🎙️ AI Mock Interview Hub
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "projects"
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            id="tab-selector-projects"
          >
            <Award className="w-4 h-4" />
            💼 Portfolio Projects
          </button>
        </nav>

        {/* Dynamic Inner views router container */}
        <div className="py-2" id="routed-view-container">
          {activeTab === "curriculum" && (
            <CurriculumView
              userProgress={userProgress}
              onUpdateProgress={handleUpdateProgress}
              onSelectPlaygroundWithExercise={handleSelectPlaygroundWithExercise}
              activeExerciseId={selectedExercise?.id}
            />
          )}

          {activeTab === "playground" && (
            <SQLPlayground
              activeExercise={selectedExercise}
              userProgress={userProgress}
              onUpdateProgress={handleUpdateProgress}
            />
          )}

          {activeTab === "visualizer" && <AnimatedSQLVisualizer />}

          {activeTab === "interview" && (
            <InterviewPrep onSelectPlaygroundWithExercise={handleSelectPlaygroundWithExercise} />
          )}

          {activeTab === "projects" && (
            <CaseProjects onSelectPlaygroundWithExercise={handleSelectPlaygroundWithExercise} />
          )}
        </div>
      </main>

      {/* Corporate footer */}
      <footer className="bg-white border-t border-slate-100 py-6 px-6 text-center text-slate-400 text-[11px] mt-12 font-medium" id="app-footer">
        📝 Data Analyst SQL path learning module &copy; 2026. Designed with professional analytical bento structures, offline emulated database compilation, and interactive generative AI tutor.
      </footer>
    </div>
  );
}
