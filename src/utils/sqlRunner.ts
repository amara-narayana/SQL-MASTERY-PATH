import { Dataset, MockTable } from "../types";

export interface SQLResult {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  errorMessage?: string;
  queryPlan?: string[];
}

/**
 * A highly capable client-side light-weight SQL interpreter in TypeScript.
 * Synthesizes, joins, filters, aggregates, groups, and sorts on JSON datasets.
 */
export function runClientSQL(query: string, dataset: Dataset): SQLResult {
  try {
    // 1. Clean query
    let sql = query
      .replace(/--.*$/gm, "") // remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, "") // remove block comments
      .replace(/\s+/g, " ") // normalize whitespaces
      .trim();

    if (!sql) {
      return { success: false, columns: [], rows: [], errorMessage: "Query is empty." };
    }

    // Check semicolon at the end
    if (sql.endsWith(";")) {
      sql = sql.slice(0, -1).trim();
    }

    const queryPlanStr: string[] = ["Parsing Query Structure"];

    // 2. Parse basic clauses using regex / keywords
    // To be robust, let's look for main clauses: SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT
    const selectMatch = sql.match(/^SELECT\s+(.*?)\s+FROM\s+(.*)/i);
    if (!selectMatch) {
      return {
        success: false,
        columns: [],
        rows: [],
        errorMessage: "Only SELECT queries are supported in this database emulator."
      };
    }

    const selectClause = selectMatch[1].trim();
    let restOfQuery = selectMatch[2].trim();

    // Extract clauses by reverse precedence or simple splitting
    let fromClause = "";
    let whereClause = "";
    let groupByClause = "";
    let havingClause = "";
    let orderByClause = "";
    let limitClause = "";
    const joinClauses: { type: "INNER" | "LEFT"; table: string; onLeft: string; onRight: string }[] = [];

    // Parse clauses from rest of query
    // Let's split using custom check
    // We want to extract FROM table and optional JOINS
    // A query typically is: FROM table [joins] [WHERE] [GROUP BY] [HAVING] [ORDER BY] [LIMIT]
    
    // Check LIMIT
    const limitMatch = restOfQuery.match(/\s+LIMIT\s+(\d+)\s*$/i);
    if (limitMatch) {
      limitClause = limitMatch[1].trim();
      restOfQuery = restOfQuery.substring(0, limitMatch.index).trim();
    }

    // Check ORDER BY
    const orderByMatch = restOfQuery.match(/\s+ORDER\s+BY\s+(.*?)\s*$/i);
    if (orderByMatch) {
      orderByClause = orderByMatch[1].trim();
      restOfQuery = restOfQuery.substring(0, orderByMatch.index).trim();
    }

    // Check HAVING
    const havingMatch = restOfQuery.match(/\s+HAVING\s+(.*?)\s*$/i);
    if (havingMatch) {
      havingClause = havingMatch[1].trim();
      restOfQuery = restOfQuery.substring(0, havingMatch.index).trim();
    }

    // Check GROUP BY
    const groupByMatch = restOfQuery.match(/\s+GROUP\s+BY\s+(.*?)\s*$/i);
    if (groupByMatch) {
      groupByClause = groupByMatch[1].trim();
      restOfQuery = restOfQuery.substring(0, groupByMatch.index).trim();
    }

    // Check WHERE
    const whereMatch = restOfQuery.match(/\s+WHERE\s+(.*?)\s*$/i);
    if (whereMatch) {
      whereClause = whereMatch[1].trim();
      restOfQuery = restOfQuery.substring(0, whereMatch.index).trim();
    }

    // Now restOfQuery contains the table name and JOINs
    // Example: "customers LEFT JOIN orders ON customers.customer_id = orders.customer_id"
    // Let's parse joins
    let joinRest = restOfQuery;
    const fromTableMatch = joinRest.match(/^([a-zA-Z0-9_-]+)(?:\s+as\s+[a-zA-Z0-9_-]+)?/i);
    if (!fromTableMatch) {
      return { success: false, columns: [], rows: [], errorMessage: "Cannot parse FROM table." };
    }
    const mainTableName = fromTableMatch[1].trim();
    fromClause = mainTableName;

    // Remove first table from joinRest to parse joints
    joinRest = joinRest.substring(fromTableMatch[0].length).trim();

    // Loop to match continuous joins: e.g. "LEFT JOIN order_items ON ... INNER JOIN products ON ..."
    const joinRegex = /(INNER|LEFT|RIGHT|FULL)?\s*JOIN\s+([a-zA-Z0-9_-]+)\s+ON\s+([a-zA-Z0-9_.-]+)\s*=\s*([a-zA-Z0-9_.-]+)/gi;
    let match;
    while ((match = joinRegex.exec(joinRest)) !== null) {
      const typeStr = match[1] ? match[1].toUpperCase() : "INNER";
      const targetTable = match[2].trim();
      const leftKey = match[3].trim();
      const rightKey = match[4].trim();
      joinClauses.push({
        type: typeStr === "LEFT" ? "LEFT" : "INNER",
        table: targetTable,
        onLeft: leftKey,
        onRight: rightKey
      });
    }

    queryPlanStr.push(`Selected Primary Table: ${mainTableName}`);
    if (joinClauses.length > 0) {
      queryPlanStr.push(`Detected Joins: ${joinClauses.map(j => `${j.type} JOIN ${j.table}`).join(", ")}`);
    }

    // 3. Load Main Table
    const rootTable = dataset.tables[mainTableName];
    if (!rootTable) {
      return { success: false, columns: [], rows: [], errorMessage: `Table '${mainTableName}' not found in dataset.` };
    }

    // Clone rows to prevent mutation
    let intermediateRows = rootTable.rows.map(r => {
      // Add table namespace prefix to help joins, e.g. customers.customer_id
      const namedRow: Record<string, any> = {};
      for (const key of Object.keys(r)) {
        namedRow[`${mainTableName}.${key}`] = r[key];
        namedRow[key] = r[key]; // also keep generic un-namespaced parameter for ease of single queries
      }
      return namedRow;
    });

    queryPlanStr.push(`Loaded ${intermediateRows.length} lines from table ${mainTableName}`);

    // 4. Resolve Joins
    for (const join of joinClauses) {
      const joinTable = dataset.tables[join.table];
      if (!joinTable) {
        return { success: false, columns: [], rows: [], errorMessage: `Joined table '${join.table}' not found.` };
      }
      queryPlanStr.push(`Executing ${join.type} JOIN on ${join.table} matching ON ${join.onLeft} = ${join.onRight}`);

      const joinedResultRows: Record<string, any>[] = [];

      // Helper to strip namespace
      const stripNs = (k: string) => k.includes(".") ? k.split(".")[1] : k;

      for (const leftRow of intermediateRows) {
        let leftVal = leftRow[join.onLeft];
        if (leftVal === undefined) {
          // try alternative match on stripped key or check name compatibility
          const stripped = stripNs(join.onLeft);
          leftVal = leftRow[stripped] !== undefined ? leftRow[stripped] : leftRow[`${mainTableName}.${stripped}`];
        }

        let matchFound = false;
        for (const rightRow of joinTable.rows) {
          const rightCleanKey = stripNs(join.onRight);
          const rightVal = rightRow[rightCleanKey];

          if (leftVal !== undefined && rightVal !== undefined && String(leftVal) === String(rightVal)) {
            matchFound = true;
            // Merge rows
            const combinedRow = { ...leftRow };
            for (const key of Object.keys(rightRow)) {
              combinedRow[`${join.table}.${key}`] = rightRow[key];
              combinedRow[key] = rightRow[key]; // expose standard key too
            }
            joinedResultRows.push(combinedRow);
          }
        }

        if (!matchFound && join.type === "LEFT") {
          // Pad with NULLs for right side
          const combinedRow = { ...leftRow };
          for (const col of joinTable.schema) {
            combinedRow[`${join.table}.${col.name}`] = null;
            combinedRow[col.name] = null;
          }
          joinedResultRows.push(combinedRow);
        }
      }
      intermediateRows = joinedResultRows;
    }

    // 5. Apply WHERE filters
    if (whereClause) {
      queryPlanStr.push(`Applying WHERE filters: ${whereClause}`);
      // Simple parse of WHERE clauses: e.g. "total_amount >= 200.00" or "country IN ('Germany', 'United Kingdom')"
      // Handle IN queries
      const inMatch = whereClause.match(/([a-zA-Z0-9_.-]+)\s+IN\s*\((.*?)\)/i);
      const isNullMatch = whereClause.match(/([a-zA-Z0-9_.-]+)\s+IS\s+NULL/i);
      const likeMatch = whereClause.match(/([a-zA-Z0-9_.-]+)\s+LIKE\s+['"](.*?)['"]/i);
      const opMatch = whereClause.match(/([a-zA-Z0-9_.-]+)\s*([>=<!]+)\s*(.*)/);

      if (inMatch) {
        const column = inMatch[1].trim();
        const rawValues = inMatch[2].trim();
        const valuesSet = rawValues.split(",").map(v => v.trim().replace(/['"]/g, ""));
        intermediateRows = intermediateRows.filter(row => {
          const rowVal = String(row[column] !== undefined ? row[column] : row[column.split(".")[1]]);
          return valuesSet.includes(rowVal);
        });
      } else if (isNullMatch) {
        const column = isNullMatch[1].trim();
        intermediateRows = intermediateRows.filter(row => {
          const colKey = row[column] !== undefined ? column : column.split(".")[1];
          return row[colKey] === null || row[colKey] === undefined;
        });
      } else if (likeMatch) {
        const column = likeMatch[1].trim();
        const searchPattern = likeMatch[2].replace(/%/g, ".*"); // convert SQL like % to regex wildcard
        const regex = new RegExp(`^${searchPattern}$`, "i");
        intermediateRows = intermediateRows.filter(row => {
          const colKey = row[column] !== undefined ? column : column.split(".")[1];
          return regex.test(String(row[colKey] || ""));
        });
      } else if (opMatch) {
        const column = opMatch[1].trim();
        const op = opMatch[2].trim();
        const rawVal = opMatch[3].trim().replace(/['"]/g, "");

        intermediateRows = intermediateRows.filter(row => {
          const colKey = row[column] !== undefined ? column : (column.includes(".") ? column.split(".")[1] : column);
          const rowVal = row[colKey];

          if (rowVal === undefined || rowVal === null) return false;

          const isNum = !isNaN(Number(rowVal)) && !isNaN(Number(rawVal));
          const left = isNum ? Number(rowVal) : String(rowVal).toLowerCase();
          const right = isNum ? Number(rawVal) : String(rawVal).toLowerCase();

          switch (op) {
            case "=": return left === right;
            case "!=":
            case "<>": return left !== right;
            case ">": return left > right;
            case "<": return left < right;
            case ">=": return left >= right;
            case "<=": return left <= right;
            default: return false;
          }
        });
      }
      queryPlanStr.push(`Rows remaining after WHERE filter: ${intermediateRows.length}`);
    }

    // 6. Handle GROUP BY aggregations
    // Check if we have aggregations in SELECT: e.g. "COUNT(*)", "AVG(price)", "SUM(total_amount)"
    const hasAggsInSelect = /COUNT|SUM|AVG|MIN|MAX/i.test(selectClause);

    if (groupByClause || hasAggsInSelect) {
      queryPlanStr.push(groupByClause ? `Partitioning groups by: ${groupByClause}` : `Performing global single-group aggregation`);

      // Parse aggregations in the SELECT clause
      // Matches e.g. "COUNT(*) as total_products", "AVG(price) AS average_price", "SUM(total_amount)"
      const aggRegex = /(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*([\w*_.-]+)?\s*\)(?:\s+as\s+(\w+))?/gi;
      const selectAggs: { func: string; col: string; alias: string }[] = [];
      let m;
      while ((m = aggRegex.exec(selectClause)) !== null) {
        const func = m[1].toUpperCase();
        const col = m[2] ? m[2].trim() : "*";
        const alias = m[3] ? m[3].trim() : `${func}__${col.replace(/[*.]/g, "_")}`;
        selectAggs.push({ func, col, alias });
      }

      // Group rows
      const groupedData: Record<string, Record<string, any>[]> = {};
      const selectParts = selectClause.split(",").map(s => s.trim());
      const selectedNonAggCols = selectParts
        .filter(p => !/(COUNT|SUM|AVG|MIN|MAX)/i.test(p))
        .map(p => {
          const matchAlias = p.match(/(.*?)\s+as\s+(\w+)/i);
          return matchAlias ? matchAlias[1].trim() : p.trim();
        });

      if (groupByClause) {
        for (const row of intermediateRows) {
          // get group key
          const gKey = String(row[groupByClause] !== undefined ? row[groupByClause] : row[groupByClause.split(".")[1]] || "NULL");
          if (!groupedData[gKey]) {
            groupedData[gKey] = [];
          }
          groupedData[gKey].push(row);
        }
      } else {
        // Global group
        groupedData["GLOBAL"] = intermediateRows;
      }

      // Process aggregates per group
      const aggregatedRows: Record<string, any>[] = [];
      for (const gKey of Object.keys(groupedData)) {
        const groupRows = groupedData[gKey];
        const resultRow: Record<string, any> = {};

        // Include grouping values or non-agg columns
        if (groupByClause) {
          resultRow[groupByClause] = groupRows[0][groupByClause];
          const stripped = groupByClause.split(".")[1];
          if (stripped) resultRow[stripped] = groupRows[0][stripped];
        }

        // Apply aggregations
        for (const agg of selectAggs) {
          const isStar = agg.col === "*";
          const colKey = !isStar ? (groupRows[0][agg.col] !== undefined ? agg.col : agg.col.split(".")[1]) : "";

          // Get raw list of values
          const values = groupRows
            .map(r => (isStar ? 1 : r[colKey]))
            .filter(v => v !== null && v !== undefined);

          let finalVal: any = null;
          if (agg.func === "COUNT") {
            finalVal = values.length;
          } else if (values.length > 0) {
            const numVals = values.map(Number).filter(v => !isNaN(v));
            if (agg.func === "SUM") {
              finalVal = numVals.reduce((acc, v) => acc + v, 0);
            } else if (agg.func === "AVG") {
              finalVal = numVals.reduce((acc, v) => acc + v, 0) / (numVals.length || 1);
            } else if (agg.func === "MIN") {
              finalVal = Math.min(...numVals);
            } else if (agg.func === "MAX") {
              finalVal = Math.max(...numVals);
            }
          }

          // Round output values if float
          if (typeof finalVal === "number" && !Number.isInteger(finalVal)) {
            finalVal = parseFloat(finalVal.toFixed(2));
          }

          resultRow[agg.alias] = finalVal;
          // also allow querying with bare aggregate string
          resultRow[`${agg.func}(${agg.col})`] = finalVal;
        }
        aggregatedRows.push(resultRow);
      }
      intermediateRows = aggregatedRows;
    }

    // 7. Apply HAVING filters if present
    if (havingClause && intermediateRows.length > 0) {
      queryPlanStr.push(`Applying HAVING filters: ${havingClause}`);
      // Simple parse of HAVING aggregates: e.g. "COUNT(*) > 1" or "customer_count > 1"
      const matchHavingOp = havingClause.match(/([a-zA-Z0-9_().*]+)\s*([>=<!]+)\s*(.*)/);
      if (matchHavingOp) {
        const key = matchHavingOp[1].trim();
        const op = matchHavingOp[2].trim();
        const value = Number(matchHavingOp[3].trim());

        // map alias if standard count is written
        intermediateRows = intermediateRows.filter(row => {
          let rowVal = row[key];
          if (rowVal === undefined) {
            // try exact math key matching
            const altKey = Object.keys(row).find(k => k.replace(/\s+/g, "") === key.replace(/\s+/g, ""));
            rowVal = altKey ? row[altKey] : undefined;
          }

          if (rowVal === undefined) return true; // keep if cannot evaluate rather than crash

          const l = Number(rowVal);
          switch (op) {
            case "=": return l === value;
            case ">": return l > value;
            case "<": return l < value;
            case ">=": return l >= value;
            case "<=": return l <= value;
            case "!=": return l !== value;
            default: return true;
          }
        });
      }
    }

    // 8. Order By
    if (orderByClause && intermediateRows.length > 0) {
      queryPlanStr.push(`Sorting rows according to query preferences: ${orderByClause}`);
      const sortParts = orderByClause.split(",");
      const sorts = sortParts.map(sp => {
        const cleanPart = sp.trim();
        const isDesc = /\s+DESC$/i.test(cleanPart);
        const col = cleanPart.replace(/\s+(ASC|DESC)$/i, "").trim();
        return { col, direction: isDesc ? -1 : 1 };
      });

      intermediateRows.sort((a, b) => {
        for (const sort of sorts) {
          const colKey = a[sort.col] !== undefined ? sort.col : sort.col.split(".")[1];
          if (!colKey) continue;
          let aVal = a[colKey];
          let bVal = b[colKey];

          if (aVal === undefined || aVal === null) return 1;
          if (bVal === undefined || bVal === null) return -1;

          if (aVal !== bVal) {
            const isNum = typeof aVal === "number" && typeof bVal === "number";
            if (isNum) {
              return (aVal - bVal) * sort.direction;
            }
            return String(aVal).localeCompare(String(bVal)) * sort.direction;
          }
        }
        return 0;
      });
    }

    // 9. LIMIT results
    if (limitClause) {
      const parsedLimit = parseInt(limitClause, 10);
      if (!isNaN(parsedLimit)) {
        queryPlanStr.push(`Truncating response lines to meet LIMIT bounds: ${parsedLimit}`);
        intermediateRows = intermediateRows.slice(0, parsedLimit);
      }
    }

    // 10. Extract final columns project list
    const finalColumns: string[] = [];
    const selectParts = selectClause.split(",").map(s => s.trim());

    if (selectParts[0] === "*") {
      // Return columns from schema of all matched/joined tables
      const mainSchema = rootTable.schema.map(c => c.name);
      finalColumns.push(...mainSchema);
      for (const j of joinClauses) {
        const jTable = dataset.tables[j.table];
        if (jTable) {
          finalColumns.push(...jTable.schema.map(c => c.name));
        }
      }
    } else {
      // Loop select tokens to discover requested rows and aliases
      for (const part of selectParts) {
        // Matched aliases e.g. "orders.order_id AS id" or "COUNT(*) as user_count"
        const aliasMatch = part.match(/(.*?)\s+AS\s+(\w+)/i);
        if (aliasMatch) {
          finalColumns.push(aliasMatch[2].trim());
        } else {
          // No alias: keep bare col name or aggregation representation
          // Extract stripped column keys
          const cleanCol = part.trim();
          if (cleanCol.includes(".")) {
            // customers.first_name -> first_name if single, else customer.first_name
            finalColumns.push(cleanCol);
          } else {
            finalColumns.push(cleanCol);
          }
        }
      }
    }

    // Clean rows according to projectColumns
    const projectedRows = intermediateRows.map(row => {
      const cleanRow: Record<string, any> = {};
      for (const col of finalColumns) {
        let val = row[col];
        if (val === undefined) {
          // check namespaces
          const colStripped = col.includes(".") ? col.split(".")[1] : col;
          val = row[colStripped] !== undefined ? row[colStripped] : (Object.keys(row).find(k => k.endsWith(`.${col}`)) ? row[Object.keys(row).find(k => k.endsWith(`.${col}`))!] : null);
        }
        cleanRow[col] = val;
      }
      return cleanRow;
    });

    queryPlanStr.push(`Execution completed successfully. Output size: ${projectedRows.length} rows`);

    return {
      success: true,
      columns: finalColumns,
      rows: projectedRows,
      queryPlan: queryPlanStr
    };
  } catch (error: any) {
    return {
      success: false,
      columns: [],
      rows: [],
      errorMessage: `Database Engine Crash: ${error.message || error}`
    };
  }
}
export function checkExerciseCompleted(
  userQuery: string,
  userResult: SQLResult,
  expectedQuery: string,
  dataset: Dataset,
  checkType: string
): boolean {
  if (!userResult.success || userResult.rows.length === 0) return false;

  // Run expected query to align results
  const expectedResult = runClientSQL(expectedQuery, dataset);
  if (!expectedResult.success) return false;

  // Perform quick structural alignment checks
  // 1. Result lengths must align
  if (userResult.rows.length !== expectedResult.rows.length) return false;

  // 2. Perform sequence validation of major checking metrics
  const checkKeys = checkType.split(",");
  for (const key of checkKeys) {
    if (!userResult.columns.some(c => c.toLowerCase().includes(key.toLowerCase()))) {
      // Maybe aliased columns inside results
      const hasCloseMatch = Object.keys(userResult.rows[0]).some(k => k.toLowerCase().includes(key.toLowerCase()));
      if (!hasCloseMatch) return false;
    }
  }

  // 3. Perfect! If query parsing executes we can check totals
  return true;
}
export function formatQuery(query: string): string {
  // basic pretty indentation formatter
  return query
    .replace(/\s*SELECT\s*/i, "SELECT\n  ")
    .replace(/\s*FROM\s*/i, "\nFROM\n  ")
    .replace(/\s*INNER\s+JOIN\s*/i, "\nINNER JOIN\n  ")
    .replace(/\s*LEFT\s+JOIN\s*/i, "\nLEFT JOIN\n  ")
    .replace(/\s*WHERE\s*/i, "\nWHERE\n  ")
    .replace(/\s*GROUP\s+BY\s*/i, "\nGROUP BY\n  ")
    .replace(/\s*HAVING\s*/i, "\nHAVING\n  ")
    .replace(/\s*ORDER\s+BY\s*/i, "\nORDER BY\n  ")
    .replace(/\s*LIMIT\s*/i, "\nLIMIT\n  ");
}
export function generateSampleCSV(columns: string[], rows: Record<string, any>[]): string {
  const header = columns.join(",");
  const csvRows = rows.map(r => columns.map(col => {
    const val = r[col];
    if (val === null || val === undefined) return "";
    const str = String(val);
    return str.includes(",") ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(","));
  return [header, ...csvRows].join("\n");
}
