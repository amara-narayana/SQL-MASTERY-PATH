import { useState, useEffect } from "react";
import { Play, FileText, CheckCircle2, AlertCircle, HelpCircle, Code, Eye, RefreshCw, BarChart4, Download, Lightbulb, Sparkles, Database } from "lucide-react";
import { Dataset, PracticeExercise, UserProgress } from "../types";
import { Datasets } from "../data/datasets";
import { runClientSQL, formatQuery, generateSampleCSV, checkExerciseCompleted } from "../utils/sqlRunner";
import ReactMarkdown from "react-markdown";

interface SQLPlaygroundProps {
  initialDatasetId?: string;
  activeExercise?: PracticeExercise;
  userProgress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export default function SQLPlayground({
  initialDatasetId = "ecommerce",
  activeExercise,
  userProgress,
  onUpdateProgress
}: SQLPlaygroundProps) {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(initialDatasetId);
  const currentDataset: Dataset = Datasets[selectedDatasetId] || Datasets.ecommerce;

  // Code editor text state
  const [queryText, setQueryText] = useState<string>("");
  const [selectedTableName, setSelectedTableName] = useState<string>("");

  // SQL Execution states
  const [queryResult, setQueryResult] = useState<any>(null);
  const [executionPlan, setExecutionPlan] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // AI Assistant states
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  // Visualization states
  const [showChart, setShowChart] = useState<boolean>(false);

  // Synchronize initial query based on selected datasets or assignments
  useEffect(() => {
    if (activeExercise) {
      setSelectedDatasetId(activeExercise.datasetId);
      setQueryText(activeExercise.placeholderQuery || `-- Write a query for: ${activeExercise.title}\n`);
      // Reset evaluations
      setQueryResult(null);
      setAiExplanation("");
      setShowChart(false);
    } else {
      // Seed generic starting queries
      const firstTable = Object.keys(currentDataset.tables)[0];
      setQueryText(`SELECT * FROM ${firstTable} LIMIT 5;`);
      setSelectedTableName(firstTable);
      setQueryResult(null);
      setAiExplanation("");
      setShowChart(false);
    }
  }, [activeExercise, selectedDatasetId]);

  // Execute standard user queries
  const handleRunSQL = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const outcome = runClientSQL(queryText, currentDataset);
      setQueryResult(outcome);
      if (outcome.success) {
        setExecutionPlan(outcome.queryPlan || []);

        // Check if an active exercise is solved
        if (activeExercise && activeExercise.datasetId === selectedDatasetId) {
          const completed = checkExerciseCompleted(
            queryText,
            outcome,
            activeExercise.expectedQuery,
            currentDataset,
            activeExercise.evaluationLogic
          );

          if (completed) {
            // Trigger storage progress update
            onUpdateProgress(prev => {
              if (prev.completedExercises[activeExercise.id]) return prev;
              const nextCompletedDays = [...prev.completedDays];
              // extract assignment relative day number if not already present
              const dayNum = parseInt(activeExercise.id.replace("day-", ""), 10);
              if (!isNaN(dayNum) && !nextCompletedDays.includes(dayNum)) {
                nextCompletedDays.push(dayNum);
              }

              return {
                ...prev,
                completedDays: nextCompletedDays,
                completedExercises: { ...prev.completedExercises, [activeExercise.id]: true },
                savedQueries: { ...prev.savedQueries, [activeExercise.id]: queryText }
              };
            });
          }
        }
      }
      setIsEvaluating(false);
    }, 400);
  };

  // Trigger server-side AI explain route
  const handleExplainWithAI = async () => {
    setIsLoadingAI(true);
    setAiExplanation("");
    try {
      const response = await fetch("/api/query-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          datasetName: currentDataset.name,
          tableSchemas: Object.keys(currentDataset.tables).reduce((acc, tkey) => {
            acc[tkey] = currentDataset.tables[tkey].schema.map(c => `${c.name} (${c.type}): ${c.description}`);
            return acc;
          }, {} as Record<string, string[]>)
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAiExplanation(data.explanation || "No explanation provided.");
      } else {
        throw new Error(data.error || "Internal Server Failure");
      }
    } catch (error: any) {
      console.error(error);
      setAiExplanation("### ❌ AI Offline / Config Required\nUnable to reach the Gemini server-side environment. Ensure your API secrets are registered under AI Studio Secrets Configuration.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!queryResult || !queryResult.success) return;
    const csvContent = generateSampleCSV(queryResult.columns, queryResult.rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sql_query_export_${selectedDatasetId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine if result features columns that are chart-friendly (label + volume metrics)
  const isChartable = queryResult?.success &&
    queryResult.columns.length >= 2 &&
    queryResult.rows.length > 0 &&
    queryResult.columns.some((col: string) => {
      const val = queryResult.rows[0][col];
      return typeof val === "number";
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sql-playground">
      {/* Sidebar: Schema Browser & Table previews */}
      <div className="lg:col-span-4 space-y-6">
        {/* Dataset selector */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block mb-1">
            Active Dataset Context
          </label>
          <select
            value={selectedDatasetId}
            onChange={(e) => {
              setSelectedDatasetId(e.target.value);
              // default select first table
              const firstTbl = Object.keys(Datasets[e.target.value].tables)[0];
              setSelectedTableName(firstTbl);
            }}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-indigo-600 cursor-pointer"
            id="dataset-ctx-dropdown"
          >
            {Object.values(Datasets).map(set => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-2 italic leading-relaxed">
            {currentDataset.description}
          </p>
        </div>        {/* Schema schema panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Database className="w-4 h-4 text-slate-500" /> Schema Browser
            </h3>
            <span className="text-[10px] font-mono text-blue-650 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded font-bold">
              {Object.keys(currentDataset.tables).length} tables available
            </span>
          </div>

          <div className="space-y-3">
            {Object.values(currentDataset.tables).map(table => (
              <div
                key={table.tableName}
                className={`border rounded-xl transition-all ${
                  selectedTableName === table.tableName ? "border-blue-200 bg-blue-50/5" : "border-slate-200 hover:border-slate-350"
                }`}
              >
                <button
                  onClick={() => setSelectedTableName(table.tableName)}
                  className="w-full flex items-center justify-between p-3 text-left focus:outline-hidden cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`w-3.5 h-3.5 ${selectedTableName === table.tableName ? "text-blue-600" : "text-slate-400"}`} />
                    <span className="text-xs font-bold font-mono text-slate-800">{table.tableName}</span>
                  </div>
                  <Eye className="w-3.5 h-3.5 text-slate-400 opacity-60 hover:opacity-100" />
                </button>

                {selectedTableName === table.tableName && (
                  <div className="p-3 border-t border-blue-50/60 bg-slate-50/45 space-y-2 text-[11px]">
                    <p className="text-slate-500 leading-normal">{table.description}</p>
                    
                    <div className="pt-2 space-y-1">
                      <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase font-mono pb-1 border-b border-slate-200">
                        <span className="col-span-5">Column</span>
                        <span className="col-span-3">Type</span>
                        <span className="col-span-4 text-right">Constraint</span>
                      </div>
                      
                      {table.schema.map(col => (
                        <div key={col.name} className="grid grid-cols-12 font-mono py-1 border-b border-dashed border-slate-100 text-slate-700">
                          <span className="col-span-5 font-bold text-slate-800 truncate" title={col.description}>
                            {col.name}
                          </span>
                          <span className="col-span-3 text-[10px] text-slate-505">{col.type}</span>
                          <span className="col-span-4 text-right text-[9px] text-blue-600 uppercase font-semibold">
                            {col.isPrimaryKey ? "PK" : col.isForeignKey ? "FK" : ""}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Quick copy select statement */}
                    <button
                      onClick={() => setQueryText(`SELECT * FROM ${table.tableName} LIMIT 5;`)}
                      className="mt-2 w-full text-center text-[10px] font-mono text-blue-600 hover:text-blue-800 py-1.5 border border-dashed border-blue-200 bg-white/80 rounded-lg hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      Seed Query: SELECT *
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Editor & Results Terminal */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        {/* Active assignment banner */}
        {activeExercise && (
          <div className="bg-blue-50/40 border border-blue-200/50 p-4 rounded-xl flex flex-col sm:flex-row items-start gap-3" id="active-assignment-box">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="space-y-1 font-sans">
              <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-100/50 px-2.5 py-0.5 rounded uppercase border border-blue-200/20">
                Active Assignment Target
              </span>
              <h4 className="text-sm font-bold text-slate-900">{activeExercise.title}</h4>
              <p className="text-xs text-slate-600">{activeExercise.instructions}</p>
              
              <div className="flex gap-4 pt-1 text-[11px] font-mono">
                <span className="text-slate-500">
                  Difficulty: <strong className="text-blue-600">Easy</strong>
                </span>
                <button
                  onClick={() => alert(`💡 Hint: ${activeExercise.hint}`)}
                  className="text-blue-650 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                >
                  <Lightbulb className="w-3.5 h-3.5 inline text-amber-500" /> Read Hint
                </button>
              </div>
            </div>
            
            {userProgress.completedExercises[activeExercise.id] && (
              <span className="sm:ml-auto bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded flex items-center gap-1 shrink-0 border border-emerald-200">
                🎉 Solved
              </span>
            )}
          </div>
        )}

        {/* SQL text querying block */}
        <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-900 overflow-hidden flex flex-col" id="ide-editor-container">
          <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-900">
            <div className="flex items-center gap-2">
              <Code className="text-indigo-400 w-4 h-4" />
              <span className="text-xs font-bold font-mono text-slate-300">Analytical SQL Query Workspace</span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setQueryText(formatQuery(queryText))}
                className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 hover:text-white font-mono text-[10px] cursor-pointer"
                title="Format SQL beautifully"
              >
                Pretty SQL
              </button>
              <button
                onClick={() => setQueryText("")}
                className="px-2.5 py-1 bg-slate-700 text-slate-400 rounded hover:bg-red-950/80 hover:text-red-300 font-mono text-[10px] cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-1 min-h-[220px]">
            {/* Simple simulated line numbering list */}
            <div className="bg-slate-950/80 text-slate-600 py-3.5 px-3 border-r border-slate-800/60 font-mono text-xs text-right select-none space-y-1 flex flex-col">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <span key={n}>{n}</span>)}
            </div>

            <textarea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="-- Write standard SQL syntax projection here e.g.:&#10;SELECT * FROM products WHERE price > 50;"
              className="flex-1 bg-slate-950/90 text-slate-100 outline-none p-3.5 font-mono text-xs resize-y block leading-relaxed leading-5 h-full min-h-[200px]"
              id="raw-editor-texarea"
            />
          </div>

          <div className="bg-slate-950 px-4 py-3 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800/80">
            <button
              onClick={handleExplainWithAI}
              disabled={isLoadingAI || !queryText}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold rounded flex items-center gap-1.5 shadow-xs hover:text-white transition-all cursor-pointer font-sans"
              id="ai-explain-btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-450" />
              {isLoadingAI ? "AI analyzing..." : "Explain with AI Coach"}
            </button>

            <button
              onClick={handleRunSQL}
              disabled={isEvaluating || !queryText}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer font-sans"
              id="run-query-btn"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Playing query...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Run Query (Ctrl+Enter)
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Explain Output */}
        {aiExplanation && (
          <div className="bg-slate-900 rounded-2xl p-5 text-slate-100 border border-slate-800 shadow-xs space-y-3" id="ai-explanation-box">
            <h4 className="font-bold text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="text-yellow-400 w-4 h-4" /> AI SQL Tutor Analysis
            </h4>
            <div className="text-xs text-slate-300 leading-relaxed font-sans prose prose-invert overflow-auto max-h-[300px] prose-slate">
              <ReactMarkdown>{aiExplanation}</ReactMarkdown>
            </div>
            <button
              onClick={() => setAiExplanation("")}
              className="text-[10px] font-mono text-slate-550 hover:text-slate-300 mt-2 block"
            >
              Close Analysis
            </button>
          </div>
        )}

        {/* Execution Results Display Screen */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="query-results-display">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider flex items-center gap-1">
              <BarChart4 className="w-4 h-4 text-slate-500" /> Query Results Terminal
            </span>
            
            {queryResult?.success && (
              <div className="flex gap-2">
                {isChartable && (
                  <button
                    onClick={() => setShowChart(!showChart)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium cursor-pointer transition-all ${
                      showChart
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {showChart ? "View Table" : "Plot Report"}
                  </button>
                )}
                
                <button
                  onClick={handleDownloadCSV}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-mono font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Export CSV
                </button>
              </div>
            )}
          </div>

          <div className="p-5">
            {!queryResult ? (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center">
                <Database className="w-10 h-10 text-slate-300 stroke-[1.2] mb-3 animate-bounce" />
                <p className="text-xs">Your results set will render here. Write your query and click **Run Query**.</p>
              </div>
            ) : !queryResult.success ? (
              // SQL Parsing Failure Screen
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800" id="query-fail-box">
                <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h5 className="font-bold text-xs font-mono">SQL Syntax Compiler Fail</h5>
                  <p className="text-xs font-mono leading-relaxed bg-white/60 p-2 rounded-lg border border-rose-100">
                    {queryResult.errorMessage}
                  </p>
                  <p className="text-[11px] text-rose-700 mt-1">
                    💡 Check that you correctly closed parentheses, aliased table references or added valid double quotes around string literals!
                  </p>
                </div>
              </div>
            ) : queryResult.rows.length === 0 ? (
              <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed text-xs">
                Executed beautifully, but returned <strong>0 matching records</strong>. Try adjusting your WHERE clause boundaries!
              </div>
            ) : showChart && isChartable ? (
              // Simple dynamic Analytical bar reports
              <div className="space-y-4" id="query-report-plot">
                <h5 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                  Continuous Aggregate Plot
                </h5>
                <div className="space-y-3 pt-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                  {(() => {
                    const numberCol = queryResult.columns.find((c: string) => typeof queryResult.rows[0][c] === "number")!;
                    const labelCol = queryResult.columns.find((c: string) => c !== numberCol) || queryResult.columns[0];
                    const maxVal = Math.max(...queryResult.rows.map((r: any) => Number(r[numberCol]) || 1));

                    return queryResult.rows.map((row: any, i: number) => {
                      const numVal = Number(row[numberCol]) || 0;
                      const label = String(row[labelCol] || "Record " + i);
                      const percent = Math.min(100, Math.max(5, (numVal / (maxVal || 1)) * 100));

                      return (
                        <div key={i} className="space-y-1 text-xs">
                          <div className="flex justify-between font-mono font-medium text-slate-700">
                            <span>{label}</span>
                            <span className="font-bold text-blue-600">{numVal}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              // Success Records Table Grid
              <div className="space-y-4" id="table-results-grid">
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono font-bold bg-slate-50 px-3 py-2 rounded-lg border">
                  <span>STATUS: SUCCESS 🎉</span>
                  <span>|</span>
                  <span>ROWS: {queryResult.rows.length}</span>
                  <span>|</span>
                  <span>COLUMNS: {queryResult.columns.length}</span>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-xs">
                  <table className="min-w-full text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-600">
                        {queryResult.columns.map((col: string) => (
                          <th key={col} className="py-2 px-3 text-left font-bold border-r border-slate-100 truncate">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-slate-800">
                          {queryResult.columns.map((col: string) => (
                            <td key={col} className="py-2 px-3 border-r border-slate-100 max-w-xs truncate">
                              {row[col] === null || row[col] === undefined ? (
                                <span className="text-rose-400 italic font-normal text-[10px]">NULL</span>
                              ) : typeof row[col] === "number" ? (
                                <span className="text-emerald-700 font-bold">{row[col]}</span>
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Query execution logs */}
                {executionPlan.length > 0 && (
                  <div className="space-y-1 text-[10px] font-mono text-slate-400 bg-slate-50/50 p-2.5 rounded border border-dotted">
                    <span className="font-bold uppercase tracking-widest text-[9px] block mb-1">Execution Pipeline Plan Logs:</span>
                    {executionPlan.map((step, sIdx) => (
                      <div key={sIdx} className="flex gap-1">
                        <span className="text-indigo-400">Step {sIdx + 1}:</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
