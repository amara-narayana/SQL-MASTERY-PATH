export interface DailyLesson {
  dayNumber: number;
  title: string;
  focus: string;
  readingMarkdown: string;
  videoTitle: string;
  videoDuration: string;
  videoTranscriptSummary: string;
  exercise: PracticeExercise;
}

export interface WeeklyMilestone {
  weekNumber: number;
  title: string;
  objective: string;
  days: DailyLesson[];
  weeklyProjectDescription?: string;
}

export interface MonthlyMilestone {
  monthNumber: number;
  title: string;
  objective: string;
  weeks: WeeklyMilestone[];
  portfolioProject: PortfolioProject;
}

export interface PracticeExercise {
  id: string; // e.g. "day-1-select"
  title: string;
  description: string;
  instructions: string;
  datasetId: string; // e.g. "ecommerce"
  expectedQuery: string;
  placeholderQuery: string;
  hint: string;
  evaluationLogic: string; // js logic or specific key to check results
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  monthNumber: number;
  datasetId: string;
  businessScenario: string;
  guideQuestions: string[];
  expectedDeliverables: string[];
}

export interface SchemaColumn {
  name: string;
  type: string;
  description: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface MockTable {
  tableName: string;
  description: string;
  schema: SchemaColumn[];
  rows: Record<string, any>[];
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  tables: Record<string, MockTable>;
}

export interface UserProgress {
  completedDays: number[]; // e.g., [1, 2, 5]
  completedExercises: Record<string, boolean>; // id -> completed
  completedProjects: Record<string, boolean>; // project-id -> completed
  savedQueries: Record<string, string>; // exercise-id -> user query
  interviewHistory: {
    sessionId: string;
    date: string;
    score: number;
    feedback: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}
