import { useState } from "react";
import { Send, User, Sparkles, Trophy, Star, RefreshCw, Layers, ShieldAlert, CheckCircle, Flame, ExternalLink, MessageCircle } from "lucide-react";
import { ChatMessage } from "../types";
import ReactMarkdown from "react-markdown";

interface InterviewPrepProps {
  onSelectPlaygroundWithExercise: (exercise: any) => void;
}

export default function InterviewPrep({ onSelectPlaygroundWithExercise }: InterviewPrepProps) {
  // Persona configuration
  const [selectedPersona, setSelectedPersona] = useState<"friendly-recruiter" | "faang-manager" | "startup-cto">("friendly-recruiter");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  // Quick case studies catalog
  const caseStudies = [
    {
      id: "case-spotify",
      title: "Spotify Streaming Funnel Performance Audit",
      company: "Spotify (FAANG-style case study)",
      scenario: `Analyze a table containing 10M daily track plays: \`song_plays\` (play_id, user_id, song_id, duration_seconds, platform, timestamp).
Find the top 5 artists whose songs represent the highest percentage of the total play count on iOS devices during weekends:`,
      tables: "song_plays (play_id, user_id, song_id, len_sec, sys, ts) | artists (artist_id, name, gen)",
      isAvailable: true,
      exerciseLink: {
        id: "case-spotify-ex",
        title: "Spotify iOS Stream Filter",
        description: "Write aggregates checking iOS platform stream volumes.",
        instructions: "Write a SQL query retrieving `user_id` and the total sum of `feature_clicks` as `total_clicks` from Saas table `sessions` sorted by total_clicks DESC.",
        datasetId: "subscriptions", // let them run on SaaS
        expectedQuery: "SELECT user_id, SUM(feature_clicks) AS total_clicks FROM sessions GROUP BY user_id ORDER BY total_clicks DESC",
        placeholderQuery: "-- Check iOS/SaaS user totals\nSELECT user_id, SUM(feature_clicks) AS total_clicks \nFROM sessions \nGROUP BY user_id\nORDER BY total_clicks DESC;",
        hint: "Sum feature_clicks first, grouping by user_id.",
        evaluationLogic: "total_clicks,user_id"
      }
    },
    {
      id: "case-netflix",
      title: "Netflix Streaming Cohort Churn metrics",
      company: "Netflix Analytics Team",
      scenario: `You are given: \`subscriptions\` (sub_id, user_id, tier, signup_date, billing_status) and \`stream_activity\` (session_id, user_id, minutes_watched, date).
Trace the active watching volume across columns of churned users compared to premium users. Write SQL with subqueries to find premium cohorts watched less than 120 mins.`,
      tables: "users (user_id, status, tier), payments (payment_id, user_id, amount), sessions (duration_minutes)",
      isAvailable: true,
      exerciseLink: {
        id: "case-netflix-ex",
        title: "Netflix Churn Inactive Check",
        description: "Search for inactive users on subscription SaaS datasets.",
        instructions: "Write a SQL query that retrieves `user_id`, `username`, and `monthly_rate` for SaaS users who pay 49 monthly rate.",
        datasetId: "subscriptions",
        expectedQuery: "SELECT user_id, username, monthly_rate FROM users WHERE monthly_rate = 49",
        placeholderQuery: "-- Search for Pro $49 SaaS users\nSELECT user_id, username, monthly_rate FROM users WHERE monthly_rate = 49;",
        hint: "Filter rows with WHERE monthly_rate = 49.",
        evaluationLogic: "username,monthly_rate"
      }
    }
  ];

  // System Personas Details
  const personasDetails = {
    "friendly-recruiter": {
      name: "Sophia Martinez",
      title: "Senior Technical Talent Acquisition Recruiter",
      avatar: "👩‍💼",
      bio: "Focuses on career behavioral fit, overall system communication, entry level aggregates, and standard SQL JOIN capabilities.",
      tag: "Recruiter Mode"
    },
    "faang-manager": {
      name: "Dr. Ethan Thorne",
      title: "BI Director / Lead Analytics Architect",
      avatar: "👨‍💻",
      bio: "Specializes in extreme scale performance metrics, complex analytical Window equations, indexing schema, and database engine plans.",
      tag: "Tough Tech Screening"
    },
    "startup-cto": {
      name: "Ji-Woo Sparks",
      title: "Co-Founder & Chief Product Officer",
      avatar: "🚀",
      bio: "Checks speed and pragmatism. Loves conversion dashboards, cohorts tracking, and turning queries immediately to company metrics.",
      tag: "Startup Speed test"
    }
  };

  const handleStartInterview = async () => {
    setMessages([]);
    setIsTyping(true);
    setSessionFinished(false);

    try {
      const response = await fetch("/api/mock-interview-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          persona: selectedPersona,
          level: "Job-Ready Data Analyst"
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages([
          {
            id: "system-init",
            role: "model",
            text: data.reply || "Welcome! I am ready to begin your mock technical screening. Let's start...",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        throw new Error();
      }
    } catch {
      // Offline fallback seeds description
      setMessages([
        {
          id: "offline-init",
          role: "model",
          text: `### 🎙️ Welcome to your SQL Analyst Interview!
I am Sophia, your interviewer. Let's start with a classic technical concept.

Suppose we have an e-commerce database with a table called \`orders\` (containing cols \`order_id\`, \`customer_id\`, \`order_date\`, \`total_amount\`).
How would you write a query to find the absolute **SUM of total_amount** and the **average transaction size** from this table for the month of February 2026?

Take your time to explain your columns choice, filters, and write some raw SQL!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const nextConversationHistory = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/mock-interview-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextConversationHistory,
          persona: selectedPersona,
          level: "Job-Ready Data Analyst"
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "model",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        throw new Error();
      }
    } catch {
      // Offline simulated dynamic answers progression
      setTimeout(() => {
        const fallbackAnswers = [
          `### 🌟 Great start on aggregations!
Your query logic looks clean and well-structured:
\`\`\`sql
SELECT SUM(total_amount), AVG(total_amount)
FROM orders
WHERE order_date BETWEEN '2026-02-01' AND '2026-02-28';
\`\`\`

Let's scale it. Now, suppose the operations VP wants to see this revenue **grouped by country**; but they only want to see countries that spent **more than $1,000** in total.
How would you adjust your query using \`GROUP BY\` and \`HAVING\`? Remember, we need to JOIN the \`customers\` table on \`customer_id\` keys!`,

          `### 🚀 Outstanding performance!
You correctly implemented the \`INNER JOIN\` and leveraged the \`HAVING\` operator to filter aggregates:
\`\`\`sql
SELECT c.country, SUM(o.total_amount) AS total_spend
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
GROUP BY c.country
HAVING SUM(o.total_amount) > 1000;
\`\`\`

Let's discuss advanced scaling. If the \`orders\` table has **150 million rows** and this report takes 4 minutes to compile inside the production database, how would you optimize this? What physical indexing properties or DB metrics would you evaluate?`,

          `### 🏆 Incredible technical depth!
Excellent answers. You've demonstrated job-ready Data Analyst depth, discussing indexing on foreign key clusters (\`customer_id\`), checking the query execution plan via \`EXPLAIN\`, and partitioning date segments.

I am concluding our screening. You scored **9.5/10 on SQL execution correctness**! This portfolio readiness is superb.`
        ];

        // choose step based on query history
        let step = Math.min(Math.floor((nextConversationHistory.length - 1) / 2), fallbackAnswers.length - 1);
        
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "model",
            text: fallbackAnswers[step],
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
        if (step === fallbackAnswers.length - 1) {
          setSessionFinished(true);
        }
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-8" id="interview-prep-section">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6" id="welcome-box">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MessageCircle className="text-blue-600 w-5 h-5" /> Data Analyst SQL Mock Interview Simulator
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-sans">
          Simulate a realistic live interview. Test your query planning, syntax knowledge, and analytical habits under different corporate perspectives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">
              Configure Interview Aura
            </h3>

            <div className="space-y-3">
              {(Object.keys(personasDetails) as Array<keyof typeof personasDetails>).map(pKey => {
                const detailed = personasDetails[pKey];
                return (
                  <button
                    key={pKey}
                    onClick={() => {
                      if (messages.length === 0) setSelectedPersona(pKey);
                    }}
                    disabled={messages.length > 0}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex gap-3 ${
                      messages.length > 0 ? "opacity-65" : "cursor-pointer hover:border-slate-350"
                    } ${selectedPersona === pKey ? "border-blue-600 bg-blue-50/10 shadow-xs" : "border-slate-200"}`}
                  >
                    <span className="text-2xl mt-0.5">{detailed.avatar}</span>
                    <div className="space-y-1 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-850 block">{detailed.name}</span>
                        <span className={`text-[8.5px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                          pKey === "friendly-recruiter" ? "bg-amber-100 text-amber-800" : pKey === "faang-manager" ? "bg-purple-100 text-purple-800" : "bg-sky-100 text-sky-800"
                        }`}>
                          {detailed.tag}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-medium font-mono">{detailed.title}</span>
                      <p className="text-[11px] text-slate-500 leading-normal pt-1">{detailed.bio}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {messages.length === 0 ? (
              <button
                onClick={handleStartInterview}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1"
                id="start-interview-btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                Initialize Interview Room
              </button>
            ) : (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to restart. Stored history will reset.")) {
                    setMessages([]);
                    setSessionFinished(false);
                  }
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all text-center flex items-center justify-center gap-1 font-sans"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Close Room / Change Aura
              </button>
            )}
          </div>

          {/* Core Analytics Badges tracker */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-5 text-white space-y-4 shadow-sm border border-slate-800">
            <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="text-yellow-400 w-4 h-4 animate-bounce" /> SQL Interview Milestones
            </h4>
            <div className="space-y-3 pt-1 font-sans">
              <div className="flex items-center gap-2.5 text-xs font-medium">
                <CheckCircle className="text-emerald-400 w-4 h-4" />
                <span>Base Aggregations & Joins Match (Unlocked)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs opacity-65 font-medium">
                <Flame className="text-red-400 w-4 h-4" />
                <span>Advanced Cohort Retention Equations (Locked)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs opacity-65 font-medium">
                <Layers className="text-sky-400 w-4 h-4" />
                <span>Query Optimization Whiteboarding (Locked)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dialogue Screen and Chat Input */}
        <div className="lg:col-span-8 flex flex-col min-h-[500px]">
          {messages.length === 0 ? (
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-3xl">
                🎙️
              </div>
              <div className="max-w-md space-y-2 font-sans">
                <h4 className="text-base font-bold text-slate-800">Entrance technical screen chamber</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select an interviewer on the left panel, and then click **Initialize Interview Room** to begin your mock technical screening.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-slate-900 shadow-xl border border-slate-950 rounded-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-slate-800/90 px-5 py-3.5 border-b border-slate-950 flex items-center gap-3 font-sans">
                <div className="text-xl bg-slate-700/60 p-1 rounded-full">{personasDetails[selectedPersona].avatar}</div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{personasDetails[selectedPersona].name}</span>
                  <span className="text-[10px] text-blue-400 font-mono block uppercase">{personasDetails[selectedPersona].title}</span>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2.5 py-0.5 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Connection Live
                </span>
              </div>

              {/* Message Streams list */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[420px]" id="chat-messages-container">
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex gap-3 max-w-xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isUser ? "bg-blue-600 text-white text-xs" : "bg-slate-700 text-lg"
                      }`}>
                        {isUser ? <User className="w-4 h-4" /> : personasDetails[selectedPersona].avatar}
                      </div>

                      <div className={`space-y-1 p-4 rounded-2xl text-xs leading-relaxed border ${
                        isUser
                          ? "bg-slate-950 border-slate-800 text-blue-200 rounded-tr-none"
                          : "bg-slate-800 text-slate-200 border-slate-700/60 rounded-tl-none prose prose-invert max-w-full"
                      }`}>
                        <div className="prose prose-invert prose-slate text-[12.5px] leading-relaxed select-text font-sans">
                          {isUser ? (
                            <p className="whitespace-pre-line font-mono">{msg.text}</p>
                          ) : (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono block text-right pt-2">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-3 mr-auto items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-700 text-lg flex items-center justify-center">
                      {personasDetails[selectedPersona].avatar}
                    </div>
                    <div className="bg-slate-800 border border-slate-700/60 p-3 rounded-2xl rounded-tl-none flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Form Area */}
              <form onSubmit={handleSendMessage} className="bg-slate-950 p-4 border-t border-slate-900 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isTyping || sessionFinished}
                  placeholder={sessionFinished ? "Interview concluded successfully!" : "Write your query, explanation or conceptual answer here..."}
                  className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-600 disabled:opacity-45"
                  id="chat-input-text"
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputText.trim() || sessionFinished}
                  className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer"
                  id="chat-send-btn"
                >
                  <Send className="w-4 h-4 fill-current" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Week-over-Week Corporate Case Studies Catalog */}
      <div className="space-y-4" id="weekly-cases-catalog">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Weekly SQL Corporate Case Studies</h3>
            <p className="text-xs text-slate-500 mt-1">
              Analyze real-world business scenarios. Practice query optimizations on industry-grade challenges.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {caseStudies.map(study => (
            <div key={study.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2 font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded uppercase font-sans">
                    {study.company}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">{study.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{study.scenario}</p>
                
                <div className="bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Schemas Map:
                  </span>
                  <code className="text-[10px] font-mono text-slate-500 break-all leading-normal block">
                    {study.tables}
                  </code>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectPlaygroundWithExercise(study.exerciseLink);
                }}
                className="w-full py-2 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-slate-750 hover:text-blue-700 rounded-xl text-xs font-semibold font-sans transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Open Study whiteboard
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
