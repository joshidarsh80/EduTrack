import { createCourse } from './courseService';
import { createLesson } from './lessonService';
import { CourseCategory, CourseDifficulty } from '../types';

export interface SampleCourseDefinition {
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  thumbnailUrl: string;
  learningObjectives: string;
  duration: string;
  lessons: {
    title: string;
    description: string;
    moduleTitle: string;
    videoUrl: string;
    content: string;
    durationMinutes: number;
  }[];
}

export const SAMPLE_COURSES: SampleCourseDefinition[] = [
  {
    title: 'Modern Web Engineering with React & TypeScript',
    description:
      'Master component-driven architecture, state management patterns, TypeScript type safety, and real-time backend integration to build production-ready applications.',
    category: 'Web Development',
    difficulty: 'Intermediate',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
    learningObjectives:
      '1. Build robust components with strict TypeScript types.\n2. Understand unidirectional data flow and custom hooks.\n3. Implement optimistic UI updates and resilient state caching.\n4. Deploy modern web applications with zero friction.',
    duration: '4h 15m',
    lessons: [
      {
        title: 'Modern React Architecture & Component Mental Model',
        description:
          'Deep dive into declarative rendering, virtual DOM reconciliation, and unidirectional state trees.',
        moduleTitle: 'Module 1: Foundations & Architecture',
        videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
        content: `### Architectural Concepts\n\nReact is fundamentally an engine that translates your state tree into a rendered view.\n\nKey takeaways:\n- Pure component functions without side-effects during render.\n- Immutable state transitions.\n- Colocation of state and behavior.`,
        durationMinutes: 18,
      },
      {
        title: 'TypeScript in React: Generics, Props & Events',
        description:
          'Learn how to type props, synthetic events, forwarded refs, and complex generic components without code smells.',
        moduleTitle: 'Module 1: Foundations & Architecture',
        videoUrl: 'https://www.youtube.com/watch?v=ydkQlJhell8',
        content: `### TypeScript Best Practices\n\nAlways define clear discriminating union types for state transitions.\n\n\`\`\`ts\ntype AsyncState<T> =\n  | { status: 'idle' }\n  | { status: 'loading' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; error: Error };\n\`\`\``,
        durationMinutes: 24,
      },
      {
        title: 'Custom Hooks & Reusable State Logic',
        description:
          'Extract complex logic into cleanly scoped custom hooks with encapsulated lifecycle management.',
        moduleTitle: 'Module 2: Advanced State & Data Flow',
        videoUrl: 'https://www.youtube.com/watch?v=6ThXsUwLWvc',
        content: `### Encapsulating State Logic\n\nCustom hooks allow you to package side effects and state transitions cleanly so your UI views remain declarative and lightweight.`,
        durationMinutes: 22,
      },
      {
        title: 'Performance Optimization & Memoization Strategies',
        description:
          'Learn when to reach for useMemo, useCallback, and React.memo without premature optimization.',
        moduleTitle: 'Module 2: Advanced State & Data Flow',
        videoUrl: 'https://www.youtube.com/watch?v=7YhdqIR2Yzo',
        content: `### Optimization Guidelines\n\nAvoid premature memoization. Profile with Chrome DevTools and React Profiler first, identifying actual re-render bottlenecks.`,
        durationMinutes: 20,
      },
    ],
  },
  {
    title: 'Computer Science: Algorithms & Data Structures',
    description:
      'A rigorous exploration of computational complexity, tree traversal, graph algorithms, and dynamic programming for senior software engineers.',
    category: 'Computer Science',
    difficulty: 'Advanced',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1516116211227-bbc67d1c68e1?auto=format&fit=crop&w=1200&q=80',
    learningObjectives:
      '1. Calculate exact Big-O asymptotic time and space bounds.\n2. Master tree balancing and binary search trees.\n3. Solve graph problems with Dijkstra, BFS, and DFS.\n4. Design optimal dynamic programming solutions.',
    duration: '5h 30m',
    lessons: [
      {
        title: 'Asymptotic Analysis & Big-O Notation',
        description: 'Mathematical foundations of algorithmic efficiency, worst-case and amortized bounds.',
        moduleTitle: 'Module 1: Computational Foundations',
        videoUrl: 'https://www.youtube.com/watch?v=__vX2sjlpXU',
        content: `### Asymptotic Complexity\n\nUnderstanding algorithmic efficiency:\n- O(1): Constant time\n- O(log n): Logarithmic search\n- O(n): Linear scan\n- O(n log n): Efficient comparison sorts\n- O(n²): Quadratic nested passes`,
        durationMinutes: 25,
      },
      {
        title: 'Binary Trees & Balanced Search Trees',
        description: 'Tree data structures, AVL rotations, and in-order / pre-order traversal routines.',
        moduleTitle: 'Module 2: Non-Linear Data Structures',
        videoUrl: 'https://www.youtube.com/watch?v=oSWTXtMglKE',
        content: `### Tree Traversal\n\nBinary trees form the backbone of database indexes (B-Trees) and hierarchy parsers.`,
        durationMinutes: 30,
      },
      {
        title: 'Graph Traversal: BFS, DFS & Shortest Path',
        description: 'Adjacency lists, topological sorting, and shortest path finding with Dijkstra.',
        moduleTitle: 'Module 2: Non-Linear Data Structures',
        videoUrl: 'https://www.youtube.com/watch?v=tWVWeAqZ0WU',
        content: `### Graph Theory\n\nRepresenting nodes and edges to model social networks, dependency trees, and route planning.`,
        durationMinutes: 35,
      },
    ],
  },
  {
    title: 'Relational Database Architecture & SQL Mastery',
    description:
      'Learn normalized database design, query optimization, ACID transactions, and indexing strategies for scalable distributed systems.',
    category: 'Database Management',
    difficulty: 'Intermediate',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
    learningObjectives:
      '1. Design schema according to 3rd Normal Form (3NF).\n2. Write complex multi-table joins, CTEs, and window functions.\n3. Analyze query execution plans using EXPLAIN ANALYZE.\n4. Implement robust database locking and isolation levels.',
    duration: '3h 45m',
    lessons: [
      {
        title: 'Relational Schema Design & Normalization (1NF to 3NF)',
        description: 'Principles of relational integrity, foreign keys, and anomaly prevention.',
        moduleTitle: 'Module 1: Schema Architecture',
        videoUrl: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
        content: `### Normalization Guidelines\n\n- 1NF: Eliminate repeating groups\n- 2NF: Remove partial dependencies\n- 3NF: Remove transitive dependencies`,
        durationMinutes: 28,
      },
      {
        title: 'High Performance SQL Joins & Window Functions',
        description: 'Inner, Left, Cross joins, PARTITION BY, and running aggregate analytics.',
        moduleTitle: 'Module 2: Querying & Analytics',
        videoUrl: 'https://www.youtube.com/watch?v=HXV3zeRRBAQ',
        content: `### Window Functions\n\nAnalyze trends across partitions without collapsing row granularity: \`ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC)\`.`,
        durationMinutes: 32,
      },
    ],
  },
];

export async function seedSampleCurriculum(instructorId: string, instructorName: string, instructorEmail: string) {
  for (const sample of SAMPLE_COURSES) {
    const course = await createCourse({
      title: sample.title,
      description: sample.description,
      category: sample.category,
      difficulty: sample.difficulty,
      thumbnailUrl: sample.thumbnailUrl,
      learningObjectives: sample.learningObjectives,
      duration: sample.duration,
      price: 0,
      isPublished: true,
      instructorId,
      instructorName,
      instructorEmail,
    });

    let order = 1;
    for (const l of sample.lessons) {
      await createLesson({
        courseId: course.id,
        instructorId,
        title: l.title,
        description: l.description,
        moduleTitle: l.moduleTitle,
        order: order++,
        videoUrl: l.videoUrl,
        content: l.content,
        durationMinutes: l.durationMinutes,
        isPublished: true,
      });
    }
  }
}
