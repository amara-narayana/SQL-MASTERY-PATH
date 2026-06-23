import { useState } from "react";
import { CheckSquare, Square, PlayCircle, BookOpen, Clock, ChevronRight, Sparkles, Award, Star, Milestone, Calendar, ArrowUpRight, Flame } from "lucide-react";
import { MonthlyMilestone, DailyLesson, WeeklyMilestone, UserProgress } from "../types";
import { SQLCurriculum } from "../data/curriculum";
import ReactMarkdown from "react-markdown";

interface CurriculumViewProps {
  userProgress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onSelectPlaygroundWithExercise: (exercise: any) => void;
  activeExerciseId?: string;
}

export default function CurriculumView({
  userProgress,
  onUpdateProgress,
  onSelectPlaygroundWithExercise,
  activeExerciseId
}: CurriculumViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const activeMonth = SQLCurriculum.find(m => m.monthNumber === selectedMonth) || SQLCurriculum[0];

  // Selected Day state - default first day of selected month
  const [selectedDayNum, setSelectedDayNum] = useState<number>(activeMonth.weeks[0].days[0].dayNumber);
  
  // Find current active day lesson
  let activeLesson: DailyLesson | undefined;
  for (const m of SQLCurriculum) {
    for (const w of m.weeks) {
      const found = w.days.find(d => d.dayNumber === selectedDayNum);
      if (found) {
        activeLesson = found;
        break;
      }
    }
  }

  // Handle manual day completion toggle
  const handleToggleDayComplete = (dayNum: number) => {
    onUpdateProgress(prev => {
      const exists = prev.completedDays.includes(dayNum);
      const nextDays = exists
        ? prev.completedDays.filter(d => d !== dayNum)
        : [...prev.completedDays, dayNum];

      return {
        ...prev,
        completedDays: nextDays
      };
    });
  };

  // Quick stats calculations
  const totalDays = 120;
  const completedDaysCount = userProgress.completedDays.length;
  const progressPercent = Math.round((completedDaysCount / totalDays) * 100);
  
  const exercisesCompletedCount = Object.keys(userProgress.completedExercises).length;
  const totalExercises = 10; // estimate based on available exercises
  const execPercent = Math.round((exercisesCompletedCount / totalExercises) * 100);

  // Career tier indicators
  let careerStatus = "Beginner (Month 1 Foundations)";
  let colorBadge = "bg-slate-100 text-slate-700 border border-slate-200/55";
  if (completedDaysCount > 90) {
    careerStatus = "Job-Ready Data Analyst (Month 4 Prep)";
    colorBadge = "bg-emerald-50 text-emerald-700 border border-emerald-200/50 font-bold";
  } else if (completedDaysCount > 60) {
    careerStatus = "Advanced Analyst (Month 3 Analytics)";
    colorBadge = "bg-blue-50 text-blue-700 border border-blue-200/40 font-semibold";
  } else if (completedDaysCount > 30) {
    careerStatus = "Intermediate SQL coder (Month 2 CTEs)";
    colorBadge = "bg-slate-100 text-slate-705 border border-slate-200/50";
  }

  return (
    <div className="space-y-8" id="curriculum-view-root">
      {/* Upper Overall Course progress statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="dashboard-progress-panel">
        <div className="md:col-span-8 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xs relative overflow-hidden border border-slate-950">
          <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-y-6 translate-x-6 scale-150">
            <Award className="w-48 h-48" />
          </div>

          <div className="space-y-2 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold font-mono text-slate-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-705 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-current animate-pulse" /> 4-Month Career Track
              </span>
              <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded ${colorBadge}`}>
                {careerStatus}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-2">
              Your SQL Data Analyst Path Roadmap
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Consistently study **2 hours per day** to transition from complete beginner to job-ready Analyst with strong analytical SQL skillset.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 font-mono block">Days Tracked</span>
              <span className="text-lg font-bold font-mono text-white">{completedDaysCount} <span className="text-xs text-slate-500 font-normal">/ 120</span></span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono block">Weekly Projects</span>
              <span className="text-lg font-bold font-mono text-white">{Object.keys(userProgress.completedProjects).length} <span className="text-xs text-slate-500 font-normal">/ 4</span></span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono block">Exercises Solved</span>
              <span className="text-lg font-bold font-mono text-white">{exercisesCompletedCount} <span className="text-xs text-slate-500 font-normal">/ {totalExercises}</span></span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono block">Daily Consistency</span>
              <span className="text-lg font-bold font-mono text-emerald-400">98% 🔥</span>
            </div>
          </div>
        </div>

        {/* Circular tracker */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between items-center text-center">
          <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block">
            Overall Course Completeness
          </span>
          
          <div className="relative flex items-center justify-center my-4">
            {/* Simple representation of circular chart */}
            <div className="w-28 h-28 rounded-full border-8 border-slate-100 flex flex-col justify-center items-center font-sans">
              <span className="text-2xl font-black font-mono text-slate-800">{progressPercent}%</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Graduated</span>
            </div>
            <div className="absolute w-28 h-28 rounded-full border-8 border-transparent border-t-blue-600 animate-spin opacity-40" />
          </div>

          <div className="space-y-1.5 w-full">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Completed <strong>{completedDaysCount} of 120</strong> learning lessons
            </span>
          </div>
        </div>
      </div>

      {/* Month selections navigation */}
      <div className="flex bg-slate-100 border border-slate-200/50 p-1 rounded-xl max-w-2xl mx-auto gap-1">
        {SQLCurriculum.map(m => (
          <button
            key={m.monthNumber}
            onClick={() => {
              setSelectedMonth(m.monthNumber);
              // select first day of selected month
              setSelectedDayNum(m.weeks[0].days[0].dayNumber);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg tracking-wide transition-all ${
              selectedMonth === m.monthNumber
                ? "bg-white text-blue-600 shadow-xs border border-slate-200/40"
                : "text-slate-600 hover:text-slate-900"
            }`}
            id={`month-selector-btn-${m.monthNumber}`}
          >
            Month {m.monthNumber}
          </button>
        ))}
      </div>

      {/* Main Grid: Days browser in left, Detailed Lesson resources on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Month Summary & 120 Days Interactive Grid Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase font-mono">
                Active Month {activeMonth.monthNumber} Focus
              </span>
              <h3 className="text-base font-bold text-slate-950">{activeMonth.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans mt-1">
                {activeMonth.objective}
              </p>
            </div>

            {/* Weeks list inside the month */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {activeMonth.weeks.map(week => (
                <div key={week.weekNumber} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      Week {week.weekNumber}: {week.title}
                    </span>
                    <span className="text-[10px] text-blue-600 font-mono font-medium lowercase">
                      {week.days.length} days lessons
                    </span>
                  </div>
                  
                  {/* Miniature days grid */}
                  <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                    {week.days.map(day => {
                      const isSelected = selectedDayNum === day.dayNumber;
                      const isCompleted = userProgress.completedDays.includes(day.dayNumber);
                      
                      return (
                        <button
                          key={day.dayNumber}
                          onClick={() => setSelectedDayNum(day.dayNumber)}
                          className={`h-11 rounded-lg flex flex-col items-center justify-center relative cursor-pointer border transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 shadow-xs"
                              : isCompleted
                              ? "border-emerald-200 bg-emerald-50/50"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <span className={`text-[11px] font-mono font-bold ${isSelected ? "text-blue-700 font-extrabold" : isCompleted ? "text-emerald-800" : "text-slate-600"}`}>
                            D{day.dayNumber}
                          </span>
                          
                          {/* Checkbox badge dot */}
                          {isCompleted && (
                            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly Project Prompt target info */}
            <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100 text-left space-y-1.5 pt-3">
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">
                ⭐ Month {activeMonth.monthNumber} Portfolio project
              </span>
              <h4 className="text-xs font-bold text-slate-800">{activeMonth.portfolioProject.title}</h4>
              <p className="text-[11px] text-slate-500 leading-normal font-sans">
                Submit this final resume-ready task to graduate Month {activeMonth.monthNumber}!
              </p>
            </div>
          </div>
        </div>

        {/* Right: Selected Day Detailed Panel (Video, Lecturing Notes, Assignment) */}
        <div className="lg:col-span-7 space-y-6">
          {activeLesson ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6" id="daily-lesson-sheet">
              {/* Day title & Complete Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 pb-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded uppercase border border-blue-100/40">
                      Day {activeLesson.dayNumber} of 120
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Focus: {activeLesson.focus}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 pt-1">
                    {activeLesson.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleToggleDayComplete(activeLesson!.dayNumber)}
                  className={`px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                    userProgress.completedDays.includes(activeLesson.dayNumber)
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                      : "bg-white border-slate-200 text-slate-650 hover:border-slate-350"
                  }`}
                  id="mark-day-complete-btn"
                >
                  {userProgress.completedDays.includes(activeLesson.dayNumber) ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-emerald-600" /> Checked Complete
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 text-slate-400" /> Check Lesson Done
                    </>
                  )}
                </button>
              </div>

              {/* Animated/Interactive Classroom Video Card */}
              <div className="bg-slate-900 rounded-xl overflow-hidden shadow-xs flex flex-col" id="curator-video-card">
                <div className="relative aspect-video flex flex-col justify-between p-5 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent">
                  {/* Play circle trigger illustration */}
                  <div className="absolute inset-0 flex items-center justify-center cursor-pointer group">
                    <PlayCircle className="w-14 h-14 text-blue-500 group-hover:text-blue-400 opacity-90 transition-transform duration-300 scale-100 group-hover:scale-110 drop-shadow-lg" />
                  </div>

                  <span className="self-end text-[10px] font-mono bg-blue-600 text-white px-3 py-1 rounded uppercase font-bold tracking-wider">
                    Animated Explanation Block
                  </span>

                  <div className="space-y-1 text-left relative z-10 pt-16">
                    <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> duration: {activeLesson.videoDuration}
                    </span>
                    <h4 className="text-xs md:text-sm font-bold text-white leading-snug">
                      Video Lesson: {activeLesson.videoTitle}
                    </h4>
                  </div>
                </div>

                {/* Simulated video notes summary */}
                <div className="bg-slate-950 p-4 border-t border-slate-850 text-[11.5px] text-slate-400 leading-normal font-mono">
                  <span className="font-bold text-blue-450 uppercase font-mono block mb-1">Video Core Takeaways:</span>
                  <p className="font-sans text-[11px]">{activeLesson.videoTranscriptSummary}</p>
                </div>
              </div>

              {/* Classroom technical notes reading page */}
              <div className="prose prose-slate prose-xs leading-relaxed text-xs max-w-none text-slate-700 pb-4 border-b border-slate-150 select-text">
                <ReactMarkdown>{activeLesson.readingMarkdown}</ReactMarkdown>
              </div>

              {/* Daily SQL Practice / Interactive Assignment Card */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="practice-exercise-card">
                <div className="text-left space-y-1 font-sans">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">
                      DAILY CODE CHALLENGE
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-850">{activeLesson.exercise.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {activeLesson.exercise.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onSelectPlaygroundWithExercise(activeLesson!.exercise);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer font-sans"
                  id={`load-exercise-btn-${activeLesson.exercise.id}`}
                >
                  Code Assignment
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200">
              Select any Day Number in the left grid to open associated studies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
