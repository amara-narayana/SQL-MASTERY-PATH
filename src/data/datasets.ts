import { Dataset } from "../types";

export const Datasets: Record<string, Dataset> = {
  ecommerce: {
    id: "ecommerce",
    name: "E-Commerce Business Operations",
    description: "A rich transactional dataset of a mock global retail shop. Excellent for SQL operations like filtering, JOINs, group sales aggregation, and customer segmentations.",
    tables: {
      customers: {
        tableName: "customers",
        description: "Registered customers of the store, containing demographic and signup logs.",
        schema: [
          { name: "customer_id", type: "INTEGER", description: "Unique identifier for each customer", isPrimaryKey: true },
          { name: "first_name", type: "VARCHAR", description: "Customer's first name" },
          { name: "last_name", type: "VARCHAR", description: "Customer's last name" },
          { name: "email", type: "VARCHAR", description: "Email address used to signup" },
          { name: "country", type: "VARCHAR", description: "Country of residence" },
          { name: "signup_date", type: "DATE", description: "Date customer signed up (YYYY-MM-DD)" }
        ],
        rows: [
          { customer_id: 101, first_name: "Sarah", last_name: "Connor", email: "sarahc@gmail.com", country: "United States", signup_date: "2026-01-15" },
          { customer_id: 102, first_name: "Alex", last_name: "Mercer", email: "mercer.a@yahoo.com", country: "United Kingdom", signup_date: "2026-01-20" },
          { customer_id: 103, first_name: "Yuki", last_name: "Tanaka", email: "yuki.t@gmail.com", country: "Japan", signup_date: "2026-02-02" },
          { customer_id: 104, first_name: "Elena", last_name: "Rostova", email: "elena_r@mail.ru", country: "Germany", signup_date: "2026-02-14" },
          { customer_id: 105, first_name: "Mateo", last_name: "Gomez", email: "mateo_gomez@hotmail.com", country: "Spain", signup_date: "2026-02-28" },
          { customer_id: 106, first_name: "Ji-Woo", last_name: "Park", email: "jiwoo.park@naver.com", country: "South Korea", signup_date: "2026-03-01" },
          { customer_id: 107, first_name: "Sophia", last_name: "Martinez", email: "sophia.m@gmail.com", country: "United States", signup_date: "2026-03-10" },
          { customer_id: 108, first_name: "Oliver", last_name: "Smith", email: "oliver.smith@gmail.com", country: "United Kingdom", signup_date: "2026-03-15" },
          { customer_id: 109, first_name: "Hans", last_name: "Muller", email: "hans.m@googlemail.com", country: "Germany", signup_date: "2026-03-20" },
          { customer_id: 110, first_name: "Chloe", last_name: "Dupont", email: "chloe.dupont@orange.fr", country: "France", signup_date: "2026-03-24" }
        ]
      },
      products: {
        tableName: "products",
        description: "Products catalog containing names, prices, categories, and inventory counts.",
        schema: [
          { name: "product_id", type: "INTEGER", description: "Unique identifier for each product", isPrimaryKey: true },
          { name: "product_name", type: "VARCHAR", description: "Product catalog name" },
          { name: "category", type: "VARCHAR", description: "Department/Category" },
          { name: "price", type: "DECIMAL", description: "Retail price of the product in USD" },
          { name: "stock_quantity", type: "INTEGER", description: "Currently available inventory" }
        ],
        rows: [
          { product_id: 201, product_name: "UltraBook Pro 15", category: "Electronics", price: 1299.99, stock_quantity: 45 },
          { product_id: 202, product_name: "Noise-Cancelling Headphones", category: "Electronics", price: 199.99, stock_quantity: 120 },
          { product_id: 203, product_name: "Ergonomic Mechanical Keyboard", category: "Accessories", price: 89.99, stock_quantity: 85 },
          { product_id: 204, product_name: "Leather Daily Planner", category: "Office Supplies", price: 29.99, stock_quantity: 200 },
          { product_id: 205, product_name: "Wireless Vertical Mouse", category: "Accessories", price: 49.99, stock_quantity: 150 },
          { product_id: 206, product_name: "Active Fit Smart Watch", category: "Electronics", price: 249.99, stock_quantity: 65 },
          { product_id: 207, product_name: "Hydro vacuum flask 1L", category: "Home & Kitchen", price: 39.99, stock_quantity: 300 },
          { product_id: 208, product_name: "Bamboo Desk Organizer", category: "Office Supplies", price: 19.99, stock_quantity: 95 }
        ]
      },
      orders: {
        tableName: "orders",
        description: "Customer purchasing transactions, listing total metrics and statuses.",
        schema: [
          { name: "order_id", type: "INTEGER", description: "Unique order number", isPrimaryKey: true },
          { name: "customer_id", type: "INTEGER", description: "Customer executing the order", isForeignKey: true },
          { name: "order_date", type: "DATE", description: "Date of transaction (YYYY-MM-DD)" },
          { name: "total_amount", type: "DECIMAL", description: "Gross transaction price paid" },
          { name: "status", type: "VARCHAR", description: "Order progress: 'Delivered', 'Processing', 'Cancelled'" }
        ],
        rows: [
          { order_id: 5001, customer_id: 101, order_date: "2026-02-01", total_amount: 1389.98, status: "Delivered" },
          { order_id: 5002, customer_id: 103, order_date: "2026-02-05", total_amount: 199.99, status: "Delivered" },
          { order_id: 5003, customer_id: 102, order_date: "2026-02-12", total_amount: 89.99, status: "Delivered" },
          { order_id: 5004, customer_id: 104, order_date: "2026-02-20", total_amount: 1549.98, status: "Processing" },
          { order_id: 5005, customer_id: 101, order_date: "2026-02-25", total_amount: 49.99, status: "Delivered" },
          { order_id: 5006, customer_id: 107, order_date: "2026-03-12", total_amount: 289.98, status: "Delivered" },
          { order_id: 5007, customer_id: 108, order_date: "2026-03-16", total_amount: 19.99, status: "Cancelled" },
          { order_id: 5008, customer_id: 105, order_date: "2026-03-18", total_amount: 249.99, status: "Processing" },
          { order_id: 5009, customer_id: 103, order_date: "2026-03-21", total_amount: 89.99, status: "Delivered" },
          { order_id: 5010, customer_id: 110, order_date: "2026-03-25", total_amount: 1299.99, status: "Delivered" }
        ]
      },
      order_items: {
        tableName: "order_items",
        description: "Granular breakdown of order lines mapping product quantities inside orders.",
        schema: [
          { name: "item_id", type: "INTEGER", description: "Row item number", isPrimaryKey: true },
          { name: "order_id", type: "INTEGER", description: "Reference to primary orderID", isForeignKey: true },
          { name: "product_id", type: "INTEGER", description: "Product reference purchased", isForeignKey: true },
          { name: "quantity", type: "INTEGER", description: "Total count purchased" },
          { name: "unit_price", type: "DECIMAL", description: "Actual unit price at purchase" }
        ],
        rows: [
          { item_id: 1, order_id: 5001, product_id: 201, quantity: 1, unit_price: 1299.99 },
          { item_id: 2, order_id: 5001, product_id: 203, quantity: 1, unit_price: 89.99 },
          { item_id: 3, order_id: 5002, product_id: 202, quantity: 1, unit_price: 199.99 },
          { item_id: 4, order_id: 5003, product_id: 203, quantity: 1, unit_price: 89.99 },
          { item_id: 5, order_id: 5004, product_id: 201, quantity: 1, unit_price: 1299.99 },
          { item_id: 6, order_id: 5004, product_id: 206, quantity: 2, unit_price: 125.00 },
          { item_id: 7, order_id: 5005, product_id: 205, quantity: 1, unit_price: 49.99 },
          { item_id: 8, order_id: 5006, product_id: 206, quantity: 1, unit_price: 249.99 },
          { item_id: 9, order_id: 5006, product_id: 207, quantity: 1, unit_price: 39.99 },
          { item_id: 10, order_id: 5007, product_id: 208, quantity: 1, unit_price: 19.99 },
          { item_id: 11, order_id: 5008, product_id: 206, quantity: 1, unit_price: 249.99 },
          { item_id: 12, order_id: 5009, product_id: 203, quantity: 1, unit_price: 89.99 },
          { item_id: 13, order_id: 5010, product_id: 201, quantity: 1, unit_price: 1299.99 }
        ]
      }
    }
  },
  subscriptions: {
    id: "subscriptions",
    name: "SaaS Product Metrics Hub",
    description: "Contains subscription activity logs, active user sessions, tiers, and invoice payments. Perfect for testing Cohorts, Churn rates, Subqueries, and complex CTEs.",
    tables: {
      users: {
        tableName: "users",
        description: "Registered SaaS subscribers.",
        schema: [
          { name: "user_id", type: "INTEGER", description: "Subscribing user key", isPrimaryKey: true },
          { name: "username", type: "VARCHAR", description: "Unique username" },
          { name: "tier", type: "VARCHAR", description: "Current plan tier: 'Free', 'Pro', 'Enterprise'" },
          { name: "status", type: "VARCHAR", description: "Status: 'Active', 'Churned', 'Suspended'" },
          { name: "monthly_rate", type: "INTEGER", description: "SaaS charges paid per month" }
        ],
        rows: [
          { user_id: 301, username: "alphacoder", tier: "Pro", status: "Active", monthly_rate: 49 },
          { user_id: 302, username: "dev_mary", tier: "Free", status: "Active", monthly_rate: 0 },
          { user_id: 303, username: "cloud_ninja", tier: "Enterprise", status: "Active", monthly_rate: 299 },
          { user_id: 304, username: "byte_brian", tier: "Pro", status: "Churned", monthly_rate: 49 },
          { user_id: 305, username: "pixel_pete", tier: "Pro", status: "Active", monthly_rate: 49 },
          { user_id: 306, username: "security_sage", tier: "Enterprise", status: "Churned", monthly_rate: 299 },
          { user_id: 307, username: "design_queen", tier: "Free", status: "Active", monthly_rate: 0 },
          { user_id: 308, username: "stack_stan", tier: "Pro", status: "Active", monthly_rate: 49 }
        ]
      },
      sessions: {
        tableName: "sessions",
        description: "User portal sessions showing screen session details.",
        schema: [
          { name: "session_id", type: "INTEGER", description: "Unique session tracker", isPrimaryKey: true },
          { name: "user_id", type: "INTEGER", description: "User ID", isForeignKey: true },
          { name: "session_date", type: "DATE", description: "Date of web session" },
          { name: "feature_clicks", type: "INTEGER", description: "Number of core clicks made" },
          { name: "duration_minutes", type: "INTEGER", description: "Time spent online in minutes" }
        ],
        rows: [
          { session_id: 8001, user_id: 301, session_date: "2026-04-01", feature_clicks: 18, duration_minutes: 42 },
          { session_id: 8002, user_id: 303, session_date: "2026-04-01", feature_clicks: 45, duration_minutes: 120 },
          { session_id: 8003, user_id: 302, session_date: "2026-04-02", feature_clicks: 3, duration_minutes: 12 },
          { session_id: 8004, user_id: 304, session_date: "2026-04-03", feature_clicks: 14, duration_minutes: 30 },
          { session_id: 8005, user_id: 301, session_date: "2026-04-04", feature_clicks: 9, duration_minutes: 15 },
          { session_id: 8006, user_id: 305, session_date: "2026-04-05", feature_clicks: 22, duration_minutes: 55 },
          { session_id: 8007, user_id: 308, session_date: "2026-04-05", feature_clicks: 30, duration_minutes: 80 },
          { session_id: 8008, user_id: 303, session_date: "2026-04-06", feature_clicks: 50, duration_minutes: 145 },
          { session_id: 8009, user_id: 302, session_date: "2026-04-06", feature_clicks: 1, duration_minutes: 5 },
          { session_id: 8010, user_id: 305, session_date: "2026-04-07", feature_clicks: 12, duration_minutes: 25 }
        ]
      },
      payments: {
        tableName: "payments",
        description: "Record of recurring monthly charges collected.",
        schema: [
          { name: "payment_id", type: "INTEGER", description: "Unique payment identifier", isPrimaryKey: true },
          { name: "user_id", type: "INTEGER", description: "Paying client ID", isForeignKey: true },
          { name: "payment_date", type: "DATE", description: "Collected date" },
          { name: "amount", type: "DECIMAL", description: "Price paid" }
        ],
        rows: [
          { payment_id: 991, user_id: 301, payment_date: "2026-02-01", amount: 49.00 },
          { payment_id: 992, user_id: 303, payment_date: "2026-02-01", amount: 299.00 },
          { payment_id: 993, user_id: 304, payment_date: "2026-02-05", amount: 49.00 },
          { payment_id: 994, user_id: 305, payment_date: "2026-02-10", amount: 49.00 },
          { payment_id: 995, user_id: 301, payment_date: "2026-03-01", amount: 49.00 },
          { payment_id: 996, user_id: 303, payment_date: "2026-03-01", amount: 299.00 },
          { payment_id: 997, user_id: 305, payment_date: "2026-03-10", amount: 49.00 },
          { payment_id: 998, user_id: 308, payment_date: "2026-03-15", amount: 49.00 },
          { payment_id: 999, user_id: 301, payment_date: "2026-04-01", amount: 49.00 }
        ]
      }
    }
  },
  rides: {
    id: "rides",
    name: "Ride-Sharing Live Dispatch",
    description: "Geared towards Month 3 content: performance analytics, cumulative totals, Window Functions (ROW_NUMBER, LAG, LEAD), and hourly surge intervals.",
    tables: {
      trips: {
        tableName: "trips",
        description: "Recorded passenger trips across active metropolitan zones.",
        schema: [
          { name: "trip_id", type: "INTEGER", description: "Unique trip reference", isPrimaryKey: true },
          { name: "driver_id", type: "INTEGER", description: "Assigned driver code", isForeignKey: true },
          { name: "trip_date", type: "DATE", description: "Date of execution" },
          { name: "hour", type: "INTEGER", description: "Hour of day (0-23)" },
          { name: "fare_usd", type: "DECIMAL", description: "Total core fare paid" },
          { name: "distance_miles", type: "DECIMAL", description: "Total distance driven" },
          { name: "surge_multiplier", type: "DECIMAL", description: "Multiplier rate" }
        ],
        rows: [
          { trip_id: 10001, driver_id: 901, trip_date: "2026-05-10", hour: 8, fare_usd: 15.50, distance_miles: 3.2, surge_multiplier: 1.0 },
          { trip_id: 10002, driver_id: 902, trip_date: "2026-05-10", hour: 8, fare_usd: 24.00, distance_miles: 5.1, surge_multiplier: 1.2 },
          { trip_id: 10003, driver_id: 901, trip_date: "2026-05-10", hour: 9, fare_usd: 8.00, distance_miles: 1.5, surge_multiplier: 1.0 },
          { trip_id: 10004, driver_id: 903, trip_date: "2026-05-10", hour: 17, fare_usd: 45.00, distance_miles: 10.4, surge_multiplier: 1.5 },
          { trip_id: 10005, driver_id: 902, trip_date: "2026-05-10", hour: 18, fare_usd: 18.00, distance_miles: 2.8, surge_multiplier: 1.1 },
          { trip_id: 10006, driver_id: 901, trip_date: "2026-05-11", hour: 8, fare_usd: 35.00, distance_miles: 8.0, surge_multiplier: 1.3 },
          { trip_id: 10007, driver_id: 903, trip_date: "2026-05-11", hour: 9, fare_usd: 12.50, distance_miles: 2.1, surge_multiplier: 1.0 },
          { trip_id: 10008, driver_id: 902, trip_date: "2026-05-11", hour: 12, fare_usd: 22.00, distance_miles: 4.8, surge_multiplier: 1.0 },
          { trip_id: 10009, driver_id: 901, trip_date: "2026-05-11", hour: 13, fare_usd: 28.50, distance_miles: 6.2, surge_multiplier: 1.0 },
          { trip_id: 10010, driver_id: 903, trip_date: "2026-05-11", hour: 19, fare_usd: 54.00, distance_miles: 12.0, surge_multiplier: 1.8 }
        ]
      },
      drivers: {
        tableName: "drivers",
        description: "Registered vehicle fleet operators.",
        schema: [
          { name: "driver_id", type: "INTEGER", description: "System operator code", isPrimaryKey: true },
          { name: "driver_name", type: "VARCHAR", description: "Driver text name" },
          { name: "rating", type: "DECIMAL", description: "Average rating (1.0 to 5.0)" },
          { name: "city_zone", type: "VARCHAR", description: "City operational sector" }
        ],
        rows: [
          { driver_id: 901, driver_name: "Marcus Aurelius", rating: 4.85, city_zone: "Downtown" },
          { driver_id: 902, driver_name: "Seneca", rating: 4.91, city_zone: "Westside" },
          { driver_id: 903, driver_name: "Zeno of Elea", rating: 4.20, city_zone: "Business District" }
        ]
      }
    }
  }
};
