import { MonthlyMilestone } from "../types";

export const SQLCurriculum: MonthlyMilestone[] = [
  {
    monthNumber: 1,
    title: "SQL Foundations & Core Retrieval",
    objective: "Master relational database concepts and basic queries: projections, filtering, sorting, logical operators, and multi-table operations through JOINs and aggregation.",
    portfolioProject: {
      id: "month-1-project",
      title: "E-Commerce Customer Performance & Sales Segmentation Review",
      description: "Perform deep data retrieval across user accounts, order metrics, and item product categories to reveal organic performance trends on quarterly store metrics.",
      monthNumber: 1,
      datasetId: "ecommerce",
      businessScenario: "The operations VP wants to segment registered users based on their spending, purchase category choices, and geographic hubs, while identifying unengaged customers.",
      guideQuestions: [
        "1. Write a query showing each customer's name, email, country, and total count of orders executed.",
        "2. Find products that have never been ordered to identify stagnant inventory.",
        "3. Rank countries according to total gross revenues generated."
      ],
      expectedDeliverables: [
        "Customer spend distribution table grouped by country.",
        "Inactive inventory query with product names.",
        "Fully written clean SQL files with inline analytical documentation."
      ]
    },
    weeks: [
      {
        weekNumber: 1,
        title: "Introduction & Basic Selection Filters",
        objective: "Understand schemas, executing simple column selects, logical filters and limit restrictions.",
        days: [
          {
            dayNumber: 1,
            title: "Relational Databases & Projections (SELECT)",
            focus: "Query composition, columns, aliases, and selecting distinct values.",
            readingMarkdown: `### 📖 Day 1: Projections & Relational Fundamentals
Welcome to your first step as an Analyst! SQL (Structured Query Language) is the universally-trusted language used to request data from relational databases.

#### What is a Table?
In relational databases, data is organized in **rows** and **columns** (like Excel spreadsheets, but much more powerful!).
- **Column (Attribute)**: A specific piece of information (e.g. \`first_name\`, \`country\`).
- **Row (Record)**: A unique item/entity that details these attributes.

#### Writing your first query: Projections
The \`SELECT\` statement is how we tell the system which columns we want to return.
\`\`\`sql
SELECT first_name, last_name, country
FROM customers;
\`\`\`
- \`SELECT\`: Specifies columns to retrieve.
- \`FROM\`: Specifies the target dataset table.

To retrieve all columns, we use the asterisk symbol \`*\`:
\`\`\`sql
SELECT * FROM customers;
\`\`\`

#### Renaming Output Columns (Aliases)
To make your columns cleaner for your dashboards, rename them using the \`AS\` keyword:
\`\`\`sql
SELECT product_name, price AS retail_price_usd
FROM products;
\`\`\`
`,
            videoTitle: "SQL Analyst Fundamentals: The Core Select Engine",
            videoDuration: "12 mins",
            videoTranscriptSummary: "Walks through columns and schemas using visual animations. Highlights distinguishing row sets, using standard aliases, and the mechanical execution of selecting columns.",
            exercise: {
              id: "day-1",
              title: "Fetch product inventory lists",
              description: "Select core columns from the products table.",
              instructions: "Write a SQL query that retrieves `product_name`, `price`, and `stock_quantity` for all products in the database.",
              datasetId: "ecommerce",
              placeholderQuery: "-- Write your query here\n",
              expectedQuery: "SELECT product_name, price, stock_quantity FROM products",
              hint: "Use SELECT followed by the 3 specified column names, separated by commas, and get them FROM products.",
              evaluationLogic: "price,stock_quantity"
            }
          },
          {
            dayNumber: 2,
            title: "Conditional Filtering (WHERE clause)",
            focus: "Row filters, math inequalities (<, >, =), and checking target ranges.",
            readingMarkdown: `### 📖 Day 2: Basic Filtering with WHERE
As a Data Analyst, you rarely want to retrieve all rows of a table. Instead, you'll filter data to isolate segments of interest.

The \`WHERE\` clause allows you to write conditional statements to pull only records that meet specific criteria.

#### Numerical Filters:
Retrieve all products costing more than $100:
\`\`\`sql
SELECT product_name, price
FROM products
WHERE price > 100.00;
\`\`\`

#### Text Filters:
Note that strings in SQL always use *single quotes* (\`'\`):
\`\`\`sql
SELECT first_name, country
FROM customers
WHERE country = 'United States';
\`\`\`

#### Valid operators:
- \`=\` Equals
- \`!=\` or \`<>\` Not Equals
- \`>\`, \`<\` Greater/Less Than
- \`>=\`, \`<=\` Greater/Less Than or Equal To
`,
            videoTitle: "Isolating Demographics: Query Row Filters",
            videoDuration: "14 mins",
            videoTranscriptSummary: "A deep dive into how computers scan rows of a table. Explores indexing, string comparisons, and applying physical math inequality bounds in databases.",
            exercise: {
              id: "day-2",
              title: "Isolate High-Value Orders",
              description: "Filter orders based on monetary total amounts.",
              instructions: "Write a SQL query that selects `order_id`, `customer_id`, and `total_amount` from the `orders` table where the `total_amount` is greater than or equal to 200.00.",
              datasetId: "ecommerce",
              placeholderQuery: "-- Filter high value transactions\n",
              expectedQuery: "SELECT order_id, customer_id, total_amount FROM orders WHERE total_amount >= 200.00",
              hint: "Utilize WHERE total_amount >= 200.00 in your statement.",
              evaluationLogic: "total_amount"
            }
          },
          {
            dayNumber: 3,
            title: "Combining Filters (AND, OR, IN)",
            focus: "Using multiple conditions and checking list inclusion.",
            readingMarkdown: `### 📖 Day 3: Logical Operators AND, OR, and IN

Often, you must filter rows based on multiple conditions concurrently. We use \`AND\`, \`OR\`, and \`IN\` to combine conditions.

#### AND Syntax
Both conditions must evaluate to true for a row to be returned:
\`\`\`sql
SELECT product_name, category, price
FROM products
WHERE category = 'Electronics' AND price < 300;
\`\`\`

#### OR Syntax
At least one condition must be true:
\`\`\`sql
SELECT product_name, category
FROM products
WHERE category = 'Electronics' OR category = 'Office Supplies';
\`\`\`

#### IN Syntax
For long list evaluations, instead of repeating many OR conditions, utilize IN:
\`\`\`sql
SELECT * FROM customers
WHERE country IN ('United Kingdom', 'Japan', 'Germany');
\`\`\`
`,
            videoTitle: "Composite Row Filters & Operator Precedence",
            videoDuration: "16 mins",
            videoTranscriptSummary: "Deconstructs compound constraints in database engines. Explains operator precedence (AND runs before OR unless parentheses are used) to prevent filtering errors.",
            exercise: {
              id: "day-3",
              title: "Segment Specific Country Logins",
              description: "Find customers signing up from high-priority expansion territories.",
              instructions: "Get `first_name`, `last_name`, and `country` for all customers whose `country` is either 'Germany' or 'United Kingdom'.",
              datasetId: "ecommerce",
              placeholderQuery: "-- Check country values\n",
              expectedQuery: "SELECT first_name, last_name, country FROM customers WHERE country IN ('Germany', 'United Kingdom')",
              hint: "Use 'country IN ('Germany', 'United Kingdom')' or 'country = 'Germany' OR country = 'United Kingdom''.",
              evaluationLogic: "first_name,country"
            }
          },
          {
            dayNumber: 4,
            title: "Advanced Sorting (ORDER BY & LIMIT)",
            focus: "Arranging outputs ascending or descending, and truncating reports.",
            readingMarkdown: `### 📖 Day 4: Sorting and Limiting Data
Making data easy to read is key for business stakeholders. We use \`ORDER BY\` and \`LIMIT\` to structure results.

#### Sorting (ORDER BY)
By default, databases return rows in arbitrary order. Use \`ORDER BY\` to pick sorting columns.
- \`ASC\` (Default): Ascending (A-Z, 0-9)
- \`DESC\`: Descending (Z-A, 9-0)

\`\`\`sql
SELECT product_name, price
FROM products
ORDER BY price DESC;
\`\`\`

#### Limiting Rows (LIMIT)
Use \`LIMIT\` to return only top records (perfect for finding top-sellers, top spenders, or sample tables).
\`\`\`sql
-- Find the top 3 cheapest accessories
SELECT product_name, price
FROM products
WHERE category = 'Accessories'
ORDER BY price ASC
LIMIT 3;
\`\`\`
`,
            videoTitle: "Sorting Arrays & Result truncations",
            videoDuration: "11 mins",
            videoTranscriptSummary: "How ORDER BY and LIMIT interact during database sorting operations. Discusses optimization and index benefits in sorting algorithms.",
            exercise: {
              id: "day-4",
              title: "Find Top Stocked Items",
              description: "Identify the top products with high stock volumes.",
              instructions: "Write a SQL query that retrieves `product_id`, `product_name`, and `stock_quantity` from `products`, sorted by `stock_quantity` in descending order, showing only the top 5 records.",
              datasetId: "ecommerce",
              placeholderQuery: "-- Top stock levels descending\n",
              expectedQuery: "SELECT product_id, product_name, stock_quantity FROM products ORDER BY stock_quantity DESC LIMIT 5",
              hint: "Match syntax ORDER BY stock_quantity DESC LIMIT 5.",
              evaluationLogic: "stock_quantity"
            }
          }
        ]
      },
      {
        weekNumber: 2,
        title: "Summations & Group Summaries",
        objective: "Understand mathematical aggregation functions, calculating bulk summary statistics, and writing GROUP BY partitions with filter bounds.",
        days: [
          {
            dayNumber: 5,
            title: "Intro to Aggregations (SUM, AVG, COUNT)",
            focus: "Using count tallies, finding average points, and summing values.",
            readingMarkdown: `### 📖 Day 5: SQL Aggregation Functions
Data Analysts summarize volumes of raw transactions into main key performance indicators (KPIs). We use **SQL Aggregations** like \`SUM\`, \`AVG\`, and \`COUNT\` for this.

#### SUM
Adds up numerical sequences:
\`\`\`sql
SELECT SUM(total_amount) AS company_revenue
FROM orders;
\`\`\`

#### AVG
Finds the average (mean):
\`\`\`sql
SELECT AVG(price) AS average_product_price
FROM products;
\`\`\`

#### COUNT
Counts records.
- \`COUNT(*)\` counts all rows, including null entries.
- \`COUNT(column_name)\` counts only rows where the column is NOT NULL.
- \`COUNT(DISTINCT column_name)\` counts unique instances!
\`\`\`sql
SELECT COUNT(DISTINCT country) AS customer_origins
FROM customers;
\`\`\`
`,
            videoTitle: "Mathematical Operations in Databases",
            videoDuration: "18 mins",
            videoTranscriptSummary: "Explains how aggregate operations scan columns. Discusses performance considerations and how the distinct keyword compiles set groupings.",
            exercise: {
              id: "day-5",
              title: "Average Pricing & Product Counts",
              description: "Summarize top-level metrics in active retail inventories.",
              instructions: "Write a query that displays the total count of products in the catalog as `total_products` and the average price of all products as `average_price`.",
              datasetId: "ecommerce",
              placeholderQuery: "-- Write product summaries\n",
              expectedQuery: "SELECT COUNT(*) AS total_products, AVG(price) AS average_price FROM products",
              hint: "Combine COUNT(*) and AVG(price), renaming them using specified titles.",
              evaluationLogic: "total_products,average_price"
            }
          },
          {
            dayNumber: 6,
            title: "Partitioning Metrics (GROUP BY)",
            focus: "Grouping keys and writing aggregated tables.",
            readingMarkdown: `### 📖 Day 6: Grouping Records with GROUP BY
Using aggregates on the entire table is great, but businesses need granular segment breakdowns (e.g., revenue *by country*, or average price *by product category*).

To aggregate data *by categories*, we employ \`GROUP BY\`.

#### Concept
When you use a non-aggregated column in your \`SELECT\` statement alongside aggregates, you **must** list it in the \`GROUP BY\` clause.

\`\`\`sql
SELECT category, COUNT(*) AS product_count, AVG(price) AS avg_price
FROM products
GROUP BY category;
\`\`\`

#### How the engine runs this:
1. It partitions rows by the \`category\` value into separate piles.
2. It counts rows and computes the average price for each category pile.
3. It outputs one final aggregated row per category.
`,
            videoTitle: "Grouping Categories with GROUP BY Explained",
            videoDuration: "15 mins",
            videoTranscriptSummary: "A colored visual flow showing how tables split into groups before mathematical functions consolidate them. Identifies the most common SQL syntax bugs.",
            exercise: {
              id: "day-6",
              title: "Count Customers in Countries",
              description: "Assess global physical customer bases.",
              instructions: "Write a query that retrieves the `country` and the total count of registered customers in that country as `customer_count` from `customers`, grouped by `country` and sorted by `customer_count` in descending order.",
              datasetId: "ecommerce",
              placeholderQuery: "-- Group customers\n",
              expectedQuery: "SELECT country, COUNT(*) AS customer_count FROM customers GROUP BY country ORDER BY customer_count DESC",
              hint: "Don't forget to write GROUP BY country and ORDER BY customer_count DESC.",
              evaluationLogic: "customer_count"
            }
          },
          {
            dayNumber: 7,
            title: "Advanced Group Filtering (HAVING clause)",
            focus: "Filtering on aggregated conditions, distinguishing WHERE vs HAVING.",
            readingMarkdown: `### 📖 Day 7: Filter Aggregated Groups with HAVING

Analysts often need to filter groups *after* aggregating. For example: "Find product categories that contain *more than 5 products*."

You **cannot** check aggregates in a \`WHERE\` clause because \`WHERE\` filters raw rows *before* grouping occurs! Instead, use \`HAVING\` which filters *after* grouping.

#### Execution Sequence:
1. \`FROM\`: Load the raw records.
2. \`WHERE\`: Filter individual rows.
3. \`GROUP BY\`: Partition remaining rows.
4. \`HAVING\`: Filter aggregated groups.
5. \`SELECT\`: Output the final columns.
6. \`ORDER BY\`: Sort results.

\`\`\`sql
SELECT category, AVG(price) AS mean_price
FROM products
GROUP BY category
HAVING AVG(price) > 50.00;
\`\`/
`,
            videoTitle: "WHERE vs HAVING: Double Row Filters",
            videoDuration: "17 mins",
            videoTranscriptSummary: "Walks through standard SQL query compilation cycles step-by-step. Highlights why querying aggregates inside WHERE produces syntax crashes, resolving them with HAVING.",
            exercise: {
              id: "day-7",
              title: "High Value Regional Hubs",
              description: "Isolate countries showing active high customer counts.",
              instructions: "Find countries that have more than 1 customer. Return the `country` and customer count as `customer_count`.",
              datasetId: "ecommerce",
              placeholderQuery: "-- Check group size \n",
              expectedQuery: "SELECT country, COUNT(*) AS customer_count FROM customers GROUP BY country HAVING COUNT(*) > 1",
              hint: "Write HAVING COUNT(*) > 1 after the GROUP BY country instruction.",
              evaluationLogic: "country,customer_count"
            }
          }
        ]
      },
      {
        weekNumber: 3,
        title: "Relational Queries & JOIN Masterclass",
        objective: "Combine data across multiple files/tables. Focus on INNER, LEFT, RIGHT JOIN mechanics, schemas and reference constraints.",
        days: [
          {
            dayNumber: 8,
            title: "INNER JOIN: Mapping Keys",
            focus: "Mapping customer ids, compiling unified profiles and tracking join matches.",
            readingMarkdown: `### 📖 Day 8: Combining Tables with INNER JOIN
In normalized relational databases, different kinds of data reside in different tables to reduce redundancy.
- Customer info lives in \`customers\`.
- Order info lives in \`orders\`.

To link them, you must establish an **INNER JOIN** match, which returns rows with matching keys in **both** tables.

#### Syntax & Mechanics
\`\`/sql
SELECT orders.order_id, customers.first_name, orders.total_amount
FROM orders
INNER JOIN customers ON orders.customer_id = customers.customer_id;
\`\`\`

- \`INNER JOIN\`: Targets the secondary table.
- \`ON\`: Configures the common foreign-primary key bridge (e.g. \`customer_id\`).
`,
            videoTitle: "Table Intersections: INNER JOIN",
            videoDuration: "20 mins",
            videoTranscriptSummary: "A complete animated analysis of INNER JOINs, showing database engines matching rows using an internal hash lookup or loop scan.",
            exercise: {
              id: "day-8",
              title: "Get Customer Order Transactions",
              description: "Map names to single orders, tracking transactions.",
              instructions: "Write a SQL query that retrieves `order_id`, `first_name`, `last_name`, and `total_amount` by matching `orders` with `customers` using the `customer_id` key.",
              datasetId: "ecommerce",
              placeholderQuery: "-- Write an INNER JOIN\n",
              expectedQuery: "SELECT orders.order_id, customers.first_name, customers.last_name, orders.total_amount FROM orders INNER JOIN customers ON orders.customer_id = customers.customer_id",
              hint: "Join orders and customers ON orders.customer_id = customers.customer_id.",
              evaluationLogic: "order_id,first_name,last_name,total_amount"
            }
          },
          {
            dayNumber: 9,
            title: "LEFT JOIN: Tracking Unmatched Records",
            focus: "Retaining all records from the left table and populating null values for missing matches.",
            readingMarkdown: `### 📖 Day 9: Left Outer Joins

A **LEFT JOIN** returns **all** rows from the left (first) table, and the matched rows from the right (second) table. If there is no match on the right, the result contains \`NULL\` values.

#### Why is this useful?
This is incredibly powerful for tracking unmatched cohorts. For example: "Find customers who have *never* placed an order."

\`\`\`sql
SELECT customers.customer_id, customers.first_name, orders.order_id
FROM customers
LEFT JOIN orders ON customers.customer_id = orders.customer_id;
\`\`\`
If a customer has never ordered, their \`order_id\` will show up as \`NULL\`.
`,
            videoTitle: "The Outer Left Join Masterclass",
            videoDuration: "17 mins",
            videoTranscriptSummary: "Demonstrates how Left Joins preserve left table identities. Shows how nulls populate tables and explains using 'IS NULL' to find missing events.",
            exercise: {
              id: "day-9",
              title: "Analyze Product Purchases",
              description: "Find products with or without order quantities.",
              instructions: "Retrieve `product_name` and the corresponding transaction quantity from the `products` table, left-joining on `order_items` via `product_id`.",
              datasetId: "ecommerce",
              placeholderQuery: "-- Write a LEFT JOIN\n",
              expectedQuery: "SELECT products.product_name, order_items.quantity FROM products LEFT JOIN order_items ON products.product_id = order_items.product_id",
              hint: "Use products LEFT JOIN order_items ON products.product_id = order_items.product_id.",
              evaluationLogic: "product_name,quantity"
            }
          }
        ]
      }
    ]
  },
  {
    monthNumber: 2,
    title: "SQL Intermediate Mechanics & Logic",
    objective: "Explore Subqueries, CTE expression nesting, text/date formatting, and complex logical conditioning with CASE WHEN statements.",
    portfolioProject: {
      id: "month-2-project",
      title: "SaaS Product Revenue & User Portal Activity Analysis",
      description: "Harness CTE hierarchies to aggregate customer active portal behaviors, payment schedules, and subscription plans.",
      monthNumber: 2,
      datasetId: "subscriptions",
      businessScenario: "The Product Lead needs to trace core usage trends (user active features and portal clicks) against real SaaS metrics to refine Pro and Free pricing boundaries.",
      guideQuestions: [
        "1. Write a query showing user profiles alongside total session minutes and paid invoices.",
        "2. Segment users into 'Power Space', 'Medium Space', or 'Inactive' based on their portal click volumes using CASE WHEN.",
        "3. Produce month-over-month paid subscription sales aggregates."
      ],
      expectedDeliverables: [
        "Consolidated user activity segmentation dashboards using SQL.",
        "SaaS metrics report isolating high-tier clients and inactive free cohorts.",
        "Documented code using advanced CTEs."
      ]
    },
    weeks: [
      {
        weekNumber: 5,
        title: "Subqueries & Common Table Expressions",
        objective: "Understand query nesting and creating clean, reusable virtual tables with CTEs.",
        days: [
          {
            dayNumber: 15,
            title: "Introduction to Common Table Expressions (CTEs)",
            focus: "Using CTE syntax (WITH clause) to build clean, readable step-by-step query pipelines.",
            readingMarkdown: `### 📖 Day 15: Introduction to CTEs (Common Table Expressions)
Data Analysts write queries containing dozens of logical steps. If you nest subqueries within subqueries, your code becomes unreadable, making it extremely difficult to debug!

**CTEs** solve this by letting you define temporary result sets (virtual tables) named cleanly in a \`WITH\` statement, which can then be queried just like a normal table.

#### CTE Syntax:
\`\`\`sql
WITH heavy_users AS (
  SELECT user_id, SUM(duration_minutes) AS total_minutes
  FROM sessions
  GROUP BY user_id
  HAVING SUM(duration_minutes) > 100
)
SELECT users.username, heavy_users.total_minutes
FROM users
INNER JOIN heavy_users ON users.user_id = heavy_users.user_id;
\`\`\`

#### Why use CTEs?
- **Readability**: Structures query steps top-to-bottom instead of inside-out.
- **Reusability**: You can reference the same CTE multiple times in the main query.
- **Maintainability**: Makes it simple to isolate a step and inspect intermediate results when things break.
`,
            videoTitle: "Structuring Analytical Queries with CTEs",
            videoDuration: "14 mins",
            videoTranscriptSummary: "How WITH works in memory. Explains why CTEs make code cleaner and easier to read compared to nested subqueries.",
            exercise: {
              id: "day-15",
              title: "SaaS Portal Click Counts",
              description: "Build a CTE that aggregates SaaS feature clicks and join user names.",
              instructions: "Create a CTE named `user_clicks` that calculates the total features clicked (`SUM(feature_clicks)`) as `clicks` by `user_id` from the `sessions` table. In the main query, select `username` from `users` and `clicks` from `user_clicks` using an `INNER JOIN`.",
              datasetId: "subscriptions",
              placeholderQuery: "WITH user_clicks AS (\n  -- Calculate aggregates here\n)\nSELECT ...\n",
              expectedQuery: "WITH user_clicks AS (SELECT user_id, SUM(feature_clicks) AS clicks FROM sessions GROUP BY user_id) SELECT users.username, user_clicks.clicks FROM users INNER JOIN user_clicks ON users.user_id = user_clicks.user_id",
              hint: "Define user_clicks using WITH user_clicks AS (SELECT user_id, SUM(feature_clicks) FROM sessions GROUP BY user_id), then run an INNER JOIN on user_id.",
              evaluationLogic: "clicks,username"
            }
          }
        ]
      }
    ]
  },
  {
    monthNumber: 3,
    title: "Advanced SQL Analytical Operations",
    objective: "Master analytical window frameworks, ordering partitions, executing rolling metrics, and optimizing data retrieval schemas.",
    portfolioProject: {
      id: "month-3-project",
      title: "Ride-Sharing Core Dispatch Performance Analysis",
      description: "Construct advanced Window query frameworks to examine dispatch queues, hourly vehicle earnings, and operator ratings.",
      monthNumber: 3,
      datasetId: "rides",
      businessScenario: "The expansion VP wants to locate peak ride zones, reward high-rated driver performance, and study passenger density spikes to dynamically optimize surge multipliers.",
      guideQuestions: [
        "1. Write a window query ranking trips by fare amount inside each driver's account (DENSE_RANK).",
        "2. Compute the cumulative running revenue of each driver over consecutive ride schedules.",
        "3. Pair adjacent trips using LAG to analyze dispatch idle minutes."
      ],
      expectedDeliverables: [
        "Multi-variable driver performance tables.",
        "Running revenue sheets detailing surge peaks.",
        "Performance optimization report evaluating indexed lookups."
      ]
    },
    weeks: [
      {
        weekNumber: 9,
        title: "Introduction to Windows Frameworks",
        objective: "Understand windowing mechanics, executing partition splits, and calculating positional indices (ROW_NUMBER, RANK, and DENSE_RANK).",
        days: [
          {
            dayNumber: 29,
            title: "Analytical rank functions (ROW_NUMBER)",
            focus: "Using OVER() partitions, generating row indexing, and pulling top-n items, essential for cohort modeling.",
            readingMarkdown: `### 📖 Day 29: Analytical Window Functions & ROW_NUMBER()

Data Analysts regularly need to calculate ranks or row indexes within specific buckets without compressing the database rows (unlike GROUP BY which consolidates rows).

**Window functions** perform calculations across a set of table rows that are related to the current row, preserving individual file details.

#### ROW_NUMBER() Syntax
Provides a unique sequential integer (starting at 1) to each row of a partition:
\`\`\`sql
SELECT trip_id, driver_id, fare_usd,
       ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY fare_usd DESC) AS fare_rank
FROM trips;
\`\`\`

#### Deconstructing OVER()
- \`PARTITION BY\`: Divides the rows into logical buckets (like GROUP BY, but rows are not collapsed).
- \`ORDER BY\`: Defines the sorting direction *within* each bucket before assigning row numbers.
`,
            videoTitle: "The Window Function Engine: ROW_NUMBER & RANK",
            videoDuration: "19 mins",
            videoTranscriptSummary: "A complete step-by-step visual display showing how the database partitions rows in memory, sorts each partition, and adds rank indexes dynamically.",
            exercise: {
              id: "day-29",
              title: "Rank driver trips by fare values",
              description: "Build an analytical partition ranking trips for each driver.",
              instructions: "Write a query that displays `trip_id`, `driver_id`, `fare_usd`, and assigns a row index as `ride_sequence` for each driver, partitioned by `driver_id` and ordered by `fare_usd` in descending direction from the table `trips`.",
              datasetId: "rides",
              placeholderQuery: "-- Write ranking window function\n",
              expectedQuery: "SELECT trip_id, driver_id, fare_usd, ROW_NUMBER() OVER(PARTITION BY driver_id ORDER BY fare_usd DESC) AS ride_sequence FROM trips",
              hint: "Use ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY fare_usd DESC) inside your query.",
              evaluationLogic: "ride_sequence"
            }
          }
        ]
      }
    ]
  },
  {
    monthNumber: 4,
    title: "FAANG Cases, Dashboards & Resume Readiness",
    objective: "Refine practical business intelligence analytical patterns. Build career-ready portfolios, review top interview cases, and conduct live mock interviews.",
    portfolioProject: {
      id: "month-4-project",
      title: "Data Analyst Portfolio: Business KPI Performance Dashboard",
      description: "Compile SQL queries across multi-year data histories, produce business dashboards, and present analytics reports as an end-of-course capstone.",
      monthNumber: 4,
      datasetId: "ecommerce",
      businessScenario: "As your final Capstone Project, synthesize everything you have learned! Build a clean corporate repository detailing high-value analytics cohorts, revenue pipelines, and operational optimization suggestions.",
      guideQuestions: [
        "1. Compile week-over-week revenue indicators using window metrics.",
        "2. Segment customers by purchase frequency using RFM analysis logic.",
        "3. Design an executive summary for executive presentation."
      ],
      expectedDeliverables: [
        "Complete structural analysis scripts (SQL).",
        "Executive business slides containing key findings and charts.",
        "Interactive analytics portfolio dashboard."
      ]
    },
    weeks: [
      {
        weekNumber: 13,
        title: "Specialized Analytical Pipelines & Interview Mastery",
        objective: "Handle real business queries: retention curves, product funnels, and FAANG case study mock interviews.",
        days: [
          {
            dayNumber: 120,
            title: "Career Job Readiness & Final Portfolio Polish",
            focus: "Synthesizing SQL query skills, refining your Analyst resume, and preparing with AI-Powered Mock Interviews.",
            readingMarkdown: `### 📖 Day 120: Graduation & Your SQL Career Roadmap
Congratulations! You've transformed yourself from a SQL beginner to a fully capable, job-ready Data Analyst. You now understand how to extract, aggregate, filter, join, optimize, and synthesize complex relational databases.

#### Structuring your Data Analyst Resume
- **Lead with Projects**: Recruiters care about what you can *do*. Highlight your 4 Months of Portfolio projects: "E-Commerce Customer Performance", "SaaS SaaS Product Cohorts", "Ride-Sharing Window Calculations", and your "Executive Capstone".
- **Describe Business Impact**: Don't just say, "Wrote SQL queries." Instead, write: *"Constructed multi-table SQL queries leveraging CTEs and Window Functions to segment 10,000+ users, identifying a 12% churn rate in the premium tier."*
- **List your Technical Stack**: SQL, PostgreSQL, SQLite, Tableau, Python, Excel.

#### Interview Day Tips
1. **Clarify assumptions**: Before writing any code, ask about edge cases (e.g. "Can a customer have multiple orders?", "How do we treat NULL amounts?").
2. **Talk through your logic**: Express your strategy out loud as you type. Talk about why you choose a CTE or a LEFT JOIN over a nested subquery.
3. **Analyze execution complexity**: Proactively state the performance cost of your queries.
`,
            videoTitle: "Graduation & Acing the Analyst Interview",
            videoDuration: "15 mins",
            videoTranscriptSummary: "A guide to standard tech company interview panels, common behavioral traps, how to approach live coding on direct whiteboard challenges, and writing elegant code.",
            exercise: {
              id: "day-120",
              title: "Final Capstone Revenue Audit",
              description: "Perform the final financial query review.",
              instructions: "Write a SQL query that retrieves all columns from the `payments` table sorted by `payment_date` ascending.",
              datasetId: "subscriptions",
              placeholderQuery: "-- Check SaaS payments data history\n",
              expectedQuery: "SELECT * FROM payments ORDER BY payment_date ASC",
              hint: "Select everything (*) FROM payments and order them ASC using payment_date.",
              evaluationLogic: "payment_date"
            }
          }
        ]
      }
    ]
  }
];
