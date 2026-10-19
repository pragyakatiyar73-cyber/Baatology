// ============================================================
// Baatology – Comprehensive Engineering Syllabus & Interview Notes Engine
// Real Academic Subjects: DSA, DBMS, Operating Systems, Web Tech & System Design
// ============================================================

export const SYLLABUS_SUBJECTS = [
  { id: 'all', label: 'All Subjects' },
  { id: 'dsa', label: 'DSA & Algorithms' },
  { id: 'dbms', label: 'DBMS & SQL' },
  { id: 'os', label: 'Operating Systems' },
  { id: 'system_design', label: 'Web Tech & System Design' },
];

export const SYLLABUS_NOTES = [
  // ── DSA ──
  {
    id: 'dsa-1',
    subject: 'dsa',
    subjectLabel: 'DSA',
    topic: 'Dynamic Programming vs Divide & Conquer',
    summary: 'DP solves subproblems with overlapping properties and optimal substructure by memoizing state, whereas Divide & Conquer solves non-overlapping independent subproblems (e.g. Merge Sort).',
    keyPoints: [
      'Memoization (Top-down) vs Tabulation (Bottom-up).',
      'Space optimization: reduce O(N) auxiliary space to O(1) when state depends only on previous 1-2 elements.',
      'Classic examples: Longest Common Subsequence (LCS), 0/1 Knapsack, Coin Change.',
    ],
    gdTalkingPoint: 'In real-world engineering, DP models caching strategies and resource optimization algorithms under strict latency constraints.',
  },
  {
    id: 'dsa-2',
    subject: 'dsa',
    subjectLabel: 'DSA',
    topic: 'Graph Traversal: BFS vs DFS & Cycle Detection',
    summary: 'BFS uses a queue for shortest path in unweighted graphs (O(V+E)). DFS uses recursion/stack for pathfinding and topological sorting in DAGs.',
    keyPoints: [
      'Cycle detection in directed graphs requires 3-color state (unvisited, visiting, visited).',
      'Topological sort: Kahn algorithm (indegree queue) or DFS with post-order reversal.',
      'Dijkstra uses min-heap priority queue; fails with negative weight edges.',
    ],
    gdTalkingPoint: 'Social networks like LinkedIn use bidirectional BFS for degree of separation, while build systems use topological sorting for dependency resolution.',
  },
  {
    id: 'dsa-3',
    subject: 'dsa',
    subjectLabel: 'DSA',
    topic: 'Two Pointers & Sliding Window Patterns',
    summary: 'Technique to reduce O(N^2) brute-force nested loops into linear O(N) by maintaining left and right pointers or window boundaries.',
    keyPoints: [
      'Two pointers on sorted arrays: search pairs, trapping rain water, 3-Sum.',
      'Sliding window: contiguous subarray problems, max sum subarray of size K, longest substring with distinct characters.',
      'Fast and slow pointer (Floyd cycle detection) for linked list loop detection in O(N) time and O(1) space.',
    ],
    gdTalkingPoint: 'Sliding window is heavily utilized in network congestion control (TCP sliding window) and rate limiters.',
  },

  // ── DBMS ──
  {
    id: 'dbms-1',
    subject: 'dbms',
    subjectLabel: 'DBMS',
    topic: 'ACID Properties & Transaction Isolation Levels',
    summary: 'Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent independence), Durability (survives crashes via WAL).',
    keyPoints: [
      'Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.',
      'Read phenomena: Dirty Reads, Non-repeatable Reads, Phantom Reads.',
      'Two-Phase Locking (2PL) and Multi-Version Concurrency Control (MVCC) ensure high concurrency.',
    ],
    gdTalkingPoint: 'Financial systems prioritize strict Serializability, whereas high-volume social feeds use Read Committed or eventual consistency for throughput.',
  },
  {
    id: 'dbms-2',
    subject: 'dbms',
    subjectLabel: 'DBMS',
    topic: 'B-Trees vs B+ Trees & Database Indexing',
    summary: 'B+ Trees store all actual data records in leaf nodes connected as a doubly linked list, keeping internal nodes slim for high branching factor and fast range scans.',
    keyPoints: [
      'Clustered Index: defines physical order of data on disk (only 1 per table, usually Primary Key).',
      'Non-Clustered (Secondary) Index: stores pointers back to the clustered index or physical RID.',
      'Composite index leftmost prefix rule: (A, B, C) can index queries on A and (A, B), but not B alone.',
    ],
    gdTalkingPoint: 'Understanding B+ tree depth explains why database queries degrade from O(log N) memory lookups to slow random I/O disk seeks.',
  },
  {
    id: 'dbms-3',
    subject: 'dbms',
    subjectLabel: 'DBMS',
    topic: 'SQL vs NoSQL & CAP Theorem Trade-Offs',
    summary: 'Relational databases enforce strict schemas and relational joins. NoSQL (Document, Key-Value, Column, Graph) trades ACID consistency for horizontal scale.',
    keyPoints: [
      'CAP Theorem: In a distributed system with Network Partitions (P), you must choose either Consistency (C) or Availability (A).',
      'BASE model: Basically Available, Soft state, Eventual consistency.',
      'Normalization (1NF, 2NF, 3NF, BCNF) eliminates update, insert, and delete anomalies.',
    ],
    gdTalkingPoint: 'Modern architectures adopt polyglot persistence: PostgreSQL for ledger transactions and Redis/MongoDB for session states.',
  },

  // ── OPERATING SYSTEMS ──
  {
    id: 'os-1',
    subject: 'os',
    subjectLabel: 'Operating Systems',
    topic: 'Processes vs Threads & IPC Mechanisms',
    summary: 'A process is an executing program instance with isolated memory space. Threads share the parent process code, heap, and file descriptors but have their own registers and stack.',
    keyPoints: [
      'Context switching overhead is higher for processes due to TLB (Translation Lookaside Buffer) flushes.',
      'IPC methods: Pipes, Named Pipes (FIFOs), Shared Memory (fastest), Message Queues, Sockets.',
      'Thread synchronization primitives: Mutex (locking), Semaphore (counting/signaling), Spinlocks.',
    ],
    gdTalkingPoint: 'Node.js event loop uses single-threaded non-blocking I/O with worker threads, whereas Go routines use M:N user-space multiplexing.',
  },
  {
    id: 'os-2',
    subject: 'os',
    subjectLabel: 'Operating Systems',
    topic: 'Virtual Memory, Paging & Page Fault Handling',
    summary: 'Virtual memory isolates process address spaces and allows programs larger than physical RAM via hardware MMU page tables.',
    keyPoints: [
      'Paging divides virtual memory into fixed blocks (Pages) mapped to physical frames.',
      'Page fault: triggered when a page is not present in physical RAM; OS fetches it from swap disk.',
      'Page replacement algorithms: FIFO, LRU, Optimal (Belady anomaly happens in FIFO).',
      'Thrashing: system spends more CPU time swapping pages in/out than executing instructions.',
    ],
    gdTalkingPoint: 'Cloud containers like Docker share the host kernel while utilizing Linux cgroups and namespaces to isolate virtual memory allocations.',
  },
  {
    id: 'os-3',
    subject: 'os',
    subjectLabel: 'Operating Systems',
    topic: 'Deadlock Conditions & Prevention (Banker Algorithm)',
    summary: 'Deadlock is a state where processes are permanently blocked waiting for resources held by each other.',
    keyPoints: [
      'Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.',
      'Deadlock prevention: break at least one of the 4 Coffman conditions (e.g. impose total ordering on resources).',
      'Deadlock avoidance: Banker Algorithm checks safe state before granting resource allocation.',
    ],
    gdTalkingPoint: 'Distributed deadlocks in microservice transactions are avoided by implementing timeouts, idempotent retries, and saga patterns.',
  },

  // ── SYSTEM DESIGN & WEB TECH ──
  {
    id: 'sys-1',
    subject: 'system_design',
    subjectLabel: 'System Design',
    topic: 'Microservices Architecture vs Monoliths',
    summary: 'Monoliths deploy all components as a unified codebase. Microservices decouple domains into independent deployable services communicating via HTTP/gRPC or message brokers.',
    keyPoints: [
      'Service discovery, API Gateway, Circuit Breaker (Netflix Hystrix pattern).',
      'Database-per-service pattern prevents tight schema coupling.',
      'Distributed tracing (OpenTelemetry, Jaeger) is essential to debug request latency across hops.',
    ],
    gdTalkingPoint: 'Early startups thrive on modular monoliths to maintain speed of iteration before paying the operational tax of microservices.',
  },
  {
    id: 'sys-2',
    subject: 'system_design',
    subjectLabel: 'System Design',
    topic: 'Horizontal Scaling, Load Balancing & CDN Caching',
    summary: 'Vertical scaling increases server hardware specs; horizontal scaling adds more commodity servers behind load balancers (Layer 4 TCP vs Layer 7 HTTP).',
    keyPoints: [
      'Load balancing algorithms: Round Robin, Least Connections, Weighted IP Hash, Consistent Hashing.',
      'Caching layers: Browser cache, CDN (edge locations for static assets), Redis/Memcached (in-memory).',
      'Cache invalidation strategies: Cache-aside, Write-through, Write-behind.',
    ],
    gdTalkingPoint: 'Consistent hashing minimizes key redistribution when cache servers are added or removed dynamically.',
  },
  {
    id: 'sys-3',
    subject: 'system_design',
    subjectLabel: 'System Design',
    topic: 'REST vs GraphQL vs WebSockets & gRPC',
    summary: 'REST uses standard HTTP methods for resource CRUD. GraphQL enables clients to query exact fields. WebSockets provide persistent bi-directional duplex channels.',
    keyPoints: [
      'REST can suffer from over-fetching or under-fetching.',
      'GraphQL introduces query complexity and server-side N+1 query challenges.',
      'gRPC uses HTTP/2 multiplexing and Protocol Buffers for high-throughput microservice-to-microservice calls.',
    ],
    gdTalkingPoint: 'Real-time collaborative applications use WebSockets or WebRTC, while external public APIs prefer standard versioned REST/JSON.',
  },
];
