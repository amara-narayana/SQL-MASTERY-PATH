import { useState, useEffect } from "react";
import { Play, Database, Check, RefreshCw, Layers, ArrowRight, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AnimatedSQLVisualizer() {
  const [activeTab, setActiveTab] = useState<"join" | "where" | "groupby">("join");

  // JOIN state
  const [joinType, setJoinType] = useState<"INNER" | "LEFT" | "RIGHT" | "FULL">("INNER");
  const [joinedRows, setJoinedRows] = useState<any[]>([]);

  // LEFT Table customers
  const leftTable = [
    { id: 101, name: "Sarah", country: "USA" },
    { id: 102, name: "Alex", country: "UK" },
    { id: 103, name: "Yuki", country: "Japan" }
  ];

  // RIGHT Table orders
  const rightTable = [
    { order_id: 501, customer_id: 101, amount: 1389 },
    { order_id: 502, customer_id: 103, amount: 200 },
    { order_id: 503, customer_id: 105, amount: 154 } // 105 is not in leftTable
  ];

  useEffect(() => {
    // Recalculate JOIN
    let results: any[] = [];
    if (joinType === "INNER") {
      leftTable.forEach(l => {
        const match = rightTable.find(r => r.customer_id === l.id);
        if (match) {
          results.push({ ...l, ...match, match: true });
        }
      });
    } else if (joinType === "LEFT") {
      leftTable.forEach(l => {
        const match = rightTable.find(r => r.customer_id === l.id);
        if (match) {
          results.push({ ...l, ...match, match: true });
        } else {
          results.push({ ...l, order_id: "NULL", amount: "NULL", match: false });
        }
      });
    } else if (joinType === "RIGHT") {
      rightTable.forEach(r => {
        const match = leftTable.find(l => l.id === r.customer_id);
        if (match) {
          results.push({ ...match, ...r, match: true });
        } else {
          results.push({ id: "NULL", name: "NULL", country: "NULL", ...r, match: false });
        }
      });
    } else if (joinType === "FULL") {
      // Combined LEFT and missing RIGHT
      leftTable.forEach(l => {
        const match = rightTable.find(r => r.customer_id === l.id);
        if (match) {
          results.push({ ...l, ...match, match: true });
        } else {
          results.push({ ...l, order_id: "NULL", amount: "NULL", match: false });
        }
      });
      rightTable.forEach(r => {
        const match = leftTable.find(l => l.id === r.customer_id);
        if (!match) {
          results.push({ id: "NULL", name: "NULL", country: "NULL", ...r, match: false });
        }
      });
    }
    setJoinedRows(results);
  }, [joinType]);

  // WHERE state
  const [filterType, setFilterType] = useState<"usOnly" | "idHigh" | "sPrefix">("usOnly");
  const [whereStage, setWhereStage] = useState<"idle" | "filtering" | "done">("idle");
  const whereRows = [
    { id: 101, name: "Sarah", country: "USA" },
    { id: 102, name: "Alex", country: "UK" },
    { id: 103, name: "Yuki", country: "Japan" },
    { id: 104, name: "Elena", country: "Germany" },
    { id: 107, name: "Sophia", country: "USA" }
  ];
  const [visibleWhereRows, setVisibleWhereRows] = useState(whereRows);

  const simulateWhere = () => {
    setWhereStage("filtering");
    setTimeout(() => {
      let filtered = whereRows;
      if (filterType === "usOnly") {
        filtered = whereRows.filter(r => r.country === "USA");
      } else if (filterType === "idHigh") {
        filtered = whereRows.filter(r => r.id > 103);
      } else if (filterType === "sPrefix") {
        filtered = whereRows.filter(r => r.name.startsWith("S"));
      }
      setVisibleWhereRows(filtered);
      setWhereStage("done");
    }, 1200);
  };

  const resetWhere = () => {
    setVisibleWhereRows(whereRows);
    setWhereStage("idle");
  };

  // GROUP BY state
  const [groupByEnabled, setGroupByEnabled] = useState(false);
  const [groupByStage, setGroupByStage] = useState<"idle" | "grouping" | "ready">("idle");
  const productRows = [
    { id: 1, name: "UltraBook Pro", category: "Electronics", price: 1299 },
    { id: 2, name: "Noise Headphones", category: "Electronics", price: 199 },
    { id: 3, name: "Mechanical Keyboard", category: "Accessories", price: 89 },
    { id: 4, name: "Vertical Mouse", category: "Accessories", price: 49 },
    { id: 5, name: "Leather Planner", category: "Office", price: 29 }
  ];

  const simulateGroupBy = () => {
    setGroupByStage("grouping");
    setGroupByEnabled(true);
    setTimeout(() => {
      setGroupByStage("ready");
    }, 1500);
  };

  const resetGroupBy = () => {
    setGroupByEnabled(false);
    setGroupByStage("idle");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 max-w-4xl mx-auto" id="sql-visualizer-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-indigo-600 w-5 h-5 animate-pulse" />
            Animated SQL Concepts Explainer
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Build your mental model of query execution mechanics using live, interactive visual steps.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl mt-4 md:mt-0 gap-1 self-start">
          <button
            onClick={() => setActiveTab("join")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "join" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="tab-btn-join"
          >
            Multi-Table JOINs
          </button>
          <button
            onClick={() => setActiveTab("where")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "where" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="tab-btn-where"
          >
            WHERE Row Filter
          </button>
          <button
            onClick={() => setActiveTab("groupby")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "groupby" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
            id="tab-btn-groupby"
          >
            GROUP BY Aggregates
          </button>
        </div>
      </div>

      {/* JOIN Visualizer */}
      {activeTab === "join" && (
        <div className="space-y-6" id="join-viz-panel">
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 font-mono">CHOOSE JOIN METHOD</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {["INNER", "LEFT", "RIGHT", "FULL"].map(type => (
                  <button
                    key={type}
                    onClick={() => setJoinType(type as any)}
                    className={`px-4 py-1.5 text-xs font-mono font-bold rounded-lg uppercase tracking-wide transition-all border ${
                      joinType === type
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {type} JOIN
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 sm:max-w-md">
              <span className="text-xs font-bold text-indigo-800 block">SQL Query:</span>
              <code className="text-xs font-mono text-slate-700 block whitespace-pre mt-1">
                SELECT c.name, o.amount{"\n"}
                FROM customers c{"\n"}
                <span className="text-indigo-600 font-bold">{joinType} JOIN</span> orders o ON c.id = o.customer_id
              </code>
            </div>
          </div>

          {/* Venn Diagrams */}
          <div className="flex justify-center py-6 bg-slate-50 rounded-xl relative overflow-hidden min-h-[160px] items-center">
            <div className="absolute top-2 left-3 bg-white px-2 py-1 rounded text-[10px] text-slate-400 font-mono shadow-sm">
              Venn Diagram Set Representation
            </div>
            
            {/* Left circle */}
            <div
              className={`w-36 h-36 rounded-full flex flex-col justify-center items-center text-xs transition-all duration-500 absolute translate-x-[-40px] border-2 ${
                joinType === "INNER" || joinType === "LEFT" || joinType === "FULL"
                  ? "bg-indigo-100/75 border-indigo-500 text-indigo-900 font-semibold"
                  : "bg-white/80 border-slate-300 text-slate-400"
              }`}
            >
              <span className="font-mono text-[10px] tracking-wider uppercase">Left Table</span>
              <span className="text-sm mt-0.5">Customers</span>
            </div>

            {/* Intersection glow */}
            {(joinType === "INNER" || joinType === "LEFT" || joinType === "RIGHT" || joinType === "FULL") && (
              <div
                className={`w-[60px] h-36 bg-emerald-100/80 border-y-2 border-emerald-500 absolute z-10 opacity-80 pointer-events-none transition-all duration-300 ${
                  joinType === "INNER" ? "bg-emerald-200/90" : ""
                }`}
              />
            )}

            {/* Right circle */}
            <div
              className={`w-36 h-36 rounded-full flex flex-col justify-center items-center text-xs transition-all duration-500 absolute translate-x-[40px] border-2 ${
                joinType === "INNER" || joinType === "RIGHT" || joinType === "FULL"
                  ? "bg-emerald-100/75 border-emerald-500 text-emerald-900 font-semibold"
                  : "bg-white/80 border-slate-300 text-slate-400"
              }`}
            >
              <span className="font-mono text-[10px] tracking-wider uppercase text-center">Right Table</span>
              <span className="text-sm mt-0.5">Orders</span>
            </div>
          </div>

          {/* Join Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Left table column */}
            <div className="md:col-span-4 space-y-2">
              <span className="text-xs font-bold text-indigo-700 block uppercase tracking-wider font-mono">
                Customers (Left)
              </span>
              <div className="space-y-1.5">
                {leftTable.map(row => {
                  const hasMatch = rightTable.some(r => r.customer_id === row.id);
                  let isActive = false;
                  if (joinType === "INNER" || joinType === "LEFT" || joinType === "FULL") isActive = true;
                  if (joinType === "RIGHT" && hasMatch) isActive = true;

                  return (
                    <div
                      key={row.id}
                      className={`p-2.5 rounded-lg border text-xs font-mono transition-all duration-300 flex justify-between items-center ${
                        isActive
                          ? "bg-indigo-50/80 border-indigo-200 text-indigo-900 font-medium"
                          : "bg-slate-50 border-slate-100 text-slate-300"
                      }`}
                    >
                      <span>
                        [{row.id}] {row.name}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-sans">{row.country}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mapping Line Animation Indicator */}
            <div className="md:col-span-1 flex flex-col justify-center items-center text-slate-300 py-2">
              <ArrowRight className="w-5 h-5 text-indigo-500 font-bold hidden md:block" />
              <span className="text-[9.5px] font-mono tracking-tighter block text-center md:mt-1">JOIN</span>
            </div>

            {/* Right table column */}
            <div className="md:col-span-4 space-y-2">
              <span className="text-xs font-bold text-emerald-700 block uppercase tracking-wider font-mono">
                Orders (Right)
              </span>
              <div className="space-y-1.5">
                {rightTable.map(row => {
                  const hasMatch = leftTable.some(l => l.id === row.customer_id);
                  let isActive = false;
                  if (joinType === "INNER" || joinType === "RIGHT" || joinType === "FULL") isActive = true;
                  if (joinType === "LEFT" && hasMatch) isActive = true;

                  return (
                    <div
                      key={row.order_id}
                      className={`p-2.5 rounded-lg border text-xs font-mono transition-all duration-300 flex justify-between items-center ${
                        isActive
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-900 font-medium"
                          : "bg-slate-50 border-slate-100 text-slate-300"
                      }`}
                    >
                      <span>
                        Orders ID: {row.order_id}
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded">
                        c_id: {row.customer_id}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Joined Final Result Set */}
            <div className="md:col-span-12 mt-4 space-y-2" id="join-results">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Output Combined Set (RESULT SET)</span>
                <span className="text-[10px] text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded font-mono font-medium lowercase">
                  {joinedRows.length} rows compiled
                </span>
              </span>
              <div className="overflow-x-auto border border-indigo-100/80 rounded-xl shadow-sm bg-indigo-950 text-indigo-100">
                <table className="min-w-full text-xs font-mono">
                  <thead>
                    <tr className="bg-indigo-900 border-b border-indigo-800 text-indigo-200">
                      <th className="py-2.5 px-4 text-left font-bold">customer_id</th>
                      <th className="py-2.5 px-4 text-left font-bold">name</th>
                      <th className="py-2.5 px-4 text-left font-bold">country</th>
                      <th className="py-2.5 px-4 text-left font-bold">order_id</th>
                      <th className="py-2.5 px-4 text-left font-bold text-right">amount_usd</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {joinedRows.map((row, idx) => (
                        <motion.tr
                          key={`${row.id}-${row.order_id}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className={`border-b border-indigo-950/40 hover:bg-indigo-900/40 ${
                            row.order_id === "NULL" || row.name === "NULL"
                              ? "text-indigo-400 bg-indigo-900/10 italic"
                              : "text-indigo-50 font-normal"
                          }`}
                        >
                          <td className="py-2.5 px-4 font-bold">{row.id || "NULL"}</td>
                          <td className="py-2.5 px-4">{row.name || "NULL"}</td>
                          <td className="py-2.5 px-4">{row.country || "NULL"}</td>
                          <td className="py-2.5 px-4">{row.order_id}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                            {row.amount === "NULL" ? "NULL" : `$${row.amount}`}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHERE filter animator */}
      {activeTab === "where" && (
        <div className="space-y-6" id="where-viz-panel">
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 font-mono">CHOOSE FILTER TRIGGER</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setFilterType("usOnly");
                    resetWhere();
                  }}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all ${
                    filterType === "usOnly"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  country = 'USA'
                </button>
                <button
                  onClick={() => {
                    setFilterType("idHigh");
                    resetWhere();
                  }}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all ${
                    filterType === "idHigh"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  customer_id &gt; 103
                </button>
                <button
                  onClick={() => {
                    setFilterType("sPrefix");
                    resetWhere();
                  }}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-all ${
                    filterType === "sPrefix"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  first_name LIKE 'S%'
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              {whereStage === "idle" ? (
                <button
                  onClick={simulateWhere}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                  id="simulate-where-btn"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Simulate Query Filter!
                </button>
              ) : (
                <button
                  onClick={resetWhere}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                  id="reset-where-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Row Set
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Input Table */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-500 font-mono uppercase block">
                Raw Input Source (FROM customers)
              </span>
              <div className="space-y-2">
                {whereRows.map(row => {
                  // Determine filter condition match
                  let isMatch = false;
                  if (filterType === "usOnly" && row.country === "USA") isMatch = true;
                  if (filterType === "idHigh" && row.id > 103) isMatch = true;
                  if (filterType === "sPrefix" && row.name.startsWith("S")) isMatch = true;

                  const isExcluded = whereStage === "done" && !isMatch;
                  const isHighlighted = whereStage === "filtering" && isMatch;

                  return (
                    <motion.div
                      key={row.id}
                      animate={{
                        opacity: isExcluded ? 0.25 : 1,
                        x: isHighlighted ? 10 : 0,
                        scale: isHighlighted ? 1.02 : 1,
                        backgroundColor: isHighlighted ? "#ecfdf5" : isExcluded ? "#f8fafc" : "#ffffff"
                      }}
                      transition={{ duration: 0.4 }}
                      style={{ border: isHighlighted ? "1px solid #10b981" : "1px solid #e2e8f0" }}
                      className="p-3 bg-white rounded-xl text-xs font-mono flex justify-between items-center shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700">[{row.id}]</span>
                        <span className="text-slate-800 font-semibold">{row.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-sans">{row.country}</span>
                        {whereStage === "filtering" && isMatch && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                        {whereStage === "done" && isMatch && (
                          <span className="text-emerald-500 font-bold text-[10px] flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> MATCH
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Filter Output Box */}
            <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/30 flex flex-col justify-between min-h-[240px]">
              <div>
                <span className="text-xs font-bold text-indigo-700 font-mono uppercase block mb-3">
                  RESULT SET (Output rows)
                </span>

                <AnimatePresence mode="popLayout">
                  {whereStage === "idle" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 text-slate-400"
                    >
                      <HelpCircle className="w-8 h-8 text-indigo-300 stroke-[1.5]" />
                      <p className="text-xs mt-2">Click "Simulate Query Filter!" to trace evaluation.</p>
                    </motion.div>
                  )}

                  {whereStage === "filtering" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 text-indigo-500 h-full"
                    >
                      <RefreshCw className="w-8 h-8 animate-spin font-bold" />
                      <p className="text-xs font-mono mt-2">Evaluation conditional matches...</p>
                    </motion.div>
                  )}

                  {whereStage === "done" && (
                    <motion.div className="space-y-2">
                      {visibleWhereRows.map(row => (
                        <motion.div
                          key={row.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 bg-white border border-indigo-100 rounded-lg text-xs font-mono flex justify-between items-center shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-indigo-600">[{row.id}]</span>
                            <span className="text-slate-800 font-semibold">{row.name}</span>
                          </div>
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-sans">
                            {row.country}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {whereStage === "done" && (
                <div className="mt-4 pt-3 border-t border-indigo-100/60 bg-white/80 p-2.5 rounded-lg text-[11px] text-indigo-950 font-mono">
                  💡 **Analytical Note:** The WHERE engine scanned 5 tables rows sequentially. {visibleWhereRows.length} passed the conditional bound and compiled.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GROUP BY Visualizer */}
      {activeTab === "groupby" && (
        <div className="space-y-6" id="groupby-viz-panel">
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex justify-between items-center flex-col sm:flex-row gap-4">
            <div className="text-left">
              <span className="text-xs font-bold text-indigo-700 block uppercase font-mono mb-1">
                Visualizing SQL Aggregation:
              </span>
              <code className="text-xs font-mono text-slate-600 block bg-white px-2 py-1 rounded border">
                SELECT category, COUNT(*), AVG(price) FROM products <span className="text-indigo-600 font-bold">GROUP BY category</span>
              </code>
            </div>
            <div className="flex gap-2">
              {groupByStage === "idle" ? (
                <button
                  onClick={simulateGroupBy}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                  id="groupby-trigger-btn"
                >
                  <Database className="w-3.5 h-3.5" />
                  Perform GROUP BY!
                </button>
              ) : (
                <button
                  onClick={resetGroupBy}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                  id="groupby-reset-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Database Rows
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input records lists */}
            <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold text-slate-500 font-mono uppercase block">Products Table</span>
              <div className="space-y-2">
                {productRows.map(row => {
                  // highlight category groups
                  let categoryColor = "border-slate-200 text-slate-800 bg-white";
                  if (groupByEnabled) {
                    if (row.category === "Electronics") categoryColor = "bg-rose-50 border-rose-200 text-rose-900";
                    if (row.category === "Accessories") categoryColor = "bg-sky-50 border-sky-200 text-sky-900";
                    if (row.category === "Office") categoryColor = "bg-amber-50 border-amber-200 text-amber-900";
                  }

                  return (
                    <motion.div
                      key={row.id}
                      animate={{
                        scale: groupByStage === "grouping" ? 1.03 : 1
                      }}
                      className={`p-3 rounded-lg border text-xs font-mono flex justify-between items-center shadow-xs transition-colors duration-300 ${categoryColor}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{row.name}</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans mt-0.5">
                          {row.category}
                        </span>
                      </div>
                      <span className="font-bold text-indigo-600">${row.price}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Aggregated categories result card */}
            <div className="border border-indigo-100 p-4 rounded-xl bg-indigo-50/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-700 font-mono uppercase block mb-3">
                  Aggregated Output Table
                </span>

                <AnimatePresence mode="popLayout">
                  {groupByStage === "idle" && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <HelpCircle className="w-8 h-8 text-indigo-300 stroke-[1.5]" />
                      <p className="text-xs mt-2">Activate the GROUP BY triggers to check aggregates.</p>
                    </div>
                  )}

                  {groupByStage === "grouping" && (
                    <div className="flex flex-col items-center justify-center py-16 text-indigo-600">
                      <RefreshCw className="w-8 h-8 animate-spin font-bold" />
                      <p className="text-xs font-mono mt-2">Sorting rows into buckets & compiling counts...</p>
                    </div>
                  )}

                  {groupByStage === "ready" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      {/* Electronics aggregate */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-white border border-rose-200 rounded-xl shadow-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                            Electronics
                          </span>
                          <span className="text-xs text-slate-500 font-mono text-rose-700">Count: 2 products</span>
                        </div>
                        <div className="mt-2 text-xs flex justify-between font-mono bg-slate-50 p-1.5 rounded text-slate-600">
                          <span>AVG(price)</span>
                          <span className="font-bold text-rose-600">$749.00</span>
                        </div>
                      </motion.div>

                      {/* Accessories aggregates */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-3 bg-white border border-sky-200 rounded-xl shadow-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                            Accessories
                          </span>
                          <span className="text-xs text-slate-500 font-mono text-sky-700">Count: 2 products</span>
                        </div>
                        <div className="mt-2 text-xs flex justify-between font-mono bg-slate-50 p-1.5 rounded text-slate-600">
                          <span>AVG(price)</span>
                          <span className="font-bold text-sky-600">$69.00</span>
                        </div>
                      </motion.div>

                      {/* Office elements aggregates */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-3 bg-white border border-amber-200 rounded-xl shadow-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                            Office
                          </span>
                          <span className="text-xs text-slate-500 font-mono text-amber-700">Count: 1 product</span>
                        </div>
                        <div className="mt-2 text-xs flex justify-between font-mono bg-slate-50 p-1.5 rounded text-slate-600">
                          <span>AVG(price)</span>
                          <span className="font-bold text-amber-600">$29.00</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {groupByStage === "ready" && (
                <div className="mt-4 pt-3 border-t border-indigo-100 bg-white/80 p-2.5 rounded-lg text-[11px] text-slate-700 font-mono">
                  ⭐️ **Aggregates Tip:** GROUP BY automatically identifies unique category keys and consolidates the associated sets into single representative records.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
