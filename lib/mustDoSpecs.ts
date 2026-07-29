/**
 * Daily Must-Do Problem Specs for "Day Doesn't End Until You Do This".
 * Each day contains 2 crystal-clear step-by-step specifications:
 * 1. leetcodeSpec: High-Yield LeetCode Problem Statement (Inputs, Outputs, Constraints, Step-by-Step execution protocol).
 * 2. systemSpec: Production Systems Engineering Challenge (API Contract, Latency Targets, Step-by-Step implementation checklist).
 */

export interface StepSpec {
  stepNum: number;
  title: string;
  detail: string;
}

export interface LeetCodeProblemSpec {
  problemNumber: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  statement: string;
  inputExample: string;
  outputExample: string;
  constraints: string[];
  steps: StepSpec[];
  codeHint: string;
}

export interface SystemChallengeSpec {
  title: string;
  statement: string;
  inputContract: string;
  outputContract: string;
  latencyTarget: string;
  steps: StepSpec[];
  codeHint: string;
}

export interface DailyMustDoSpec {
  dayId: string;
  dayTitle: string;
  leetcodeSpec: LeetCodeProblemSpec;
  systemSpec: SystemChallengeSpec;
}

export const MUST_DO_SPECS: Record<string, DailyMustDoSpec> = {
  "day-1": {
    dayId: "day-1",
    dayTitle: "Day 1: Django ORM Optimization & Array Pointers",
    leetcodeSpec: {
      problemNumber: 1,
      title: "Two Sum & 3Sum Sweep",
      difficulty: "Medium",
      statement: "Given an integer array nums and a target integer target, return indices of the two numbers such that they add up to target. Then extend to 3Sum: find all unique triplets in the array which gives the sum of zero.",
      inputExample: "nums = [-1, 0, 1, 2, -1, -4], target = 0",
      outputExample: "[[-1, -1, 2], [-1, 0, 1]]",
      constraints: ["Time Complexity: O(N²) for 3Sum (O(N) for Two Sum)", "Space Complexity: O(1) auxiliary space", "No duplicate triplets in output"],
      steps: [
        { stepNum: 1, title: "Sort Array", detail: "Sort nums in ascending order to enable two-pointer left/right convergence." },
        { stepNum: 2, title: "Outer Loop & Skip Duplicates", detail: "Iterate i from 0 to N-2. If i > 0 and nums[i] == nums[i-1], skip to prevent duplicate triplets." },
        { stepNum: 3, title: "Two Pointer Sweep", detail: "Set left = i + 1, right = N - 1. While left < right, calculate sum = nums[i] + nums[left] + nums[right]." },
        { stepNum: 4, title: "Adjust Pointers & Prune", detail: "If sum == 0, record triplet and increment left / decrement right while skipping equal adjacent values." }
      ],
      codeHint: "function threeSum(nums: number[]): number[][]"
    },
    systemSpec: {
      title: "Django ORM N+1 Query Elimination & F() Atomic Updates",
      statement: "Audit a customer order view executing 120 SQL queries. Refactor queries using select_related for CustomerProfile (OneToOne) and prefetch_related for OrderItems (ManyToMany). Implement F() expression for atomic inventory deductions.",
      inputContract: "GET /api/customers/?vip=true",
      outputContract: "{ customers: [...], total_queries: 2, execution_ms: 14 }",
      latencyTarget: "SQL Query Count <= 2, Response Time < 20ms",
      steps: [
        { stepNum: 1, title: "Identify N+1 Queries", detail: "Run django-debug-toolbar or inspect DB log queries to count baseline SQL queries (120 queries)." },
        { stepNum: 2, title: "Apply select_related", detail: "Add .select_related('profile') to fetch OneToOne CustomerProfile in single INNER JOIN." },
        { stepNum: 3, title: "Apply prefetch_related", detail: "Add .prefetch_related('orders__items') to fetch ManyToMany items in 1 secondary query." },
        { stepNum: 4, title: "Atomic Decrement", detail: "Replace Python stock math with Product.objects.filter(id=id).update(stock=F('stock') - 1)." }
      ],
      codeHint: "Customer.objects.select_related('profile').prefetch_related('orders__items')"
    }
  },

  "day-2": {
    dayId: "day-2",
    dayTitle: "Day 2: PostgreSQL Composite Indexing & Rotated Binary Search",
    leetcodeSpec: {
      problemNumber: 33,
      title: "Search in Rotated Sorted Array",
      difficulty: "Medium",
      statement: "Given an integer array nums sorted in ascending order (with distinct values) that is rotated at an unknown pivot index, and a target value, return the index of target if it is in nums, or -1 if it is not in nums.",
      inputExample: "nums = [4,5,6,7,0,1,2], target = 0",
      outputExample: "4",
      constraints: ["Time Complexity: O(log N)", "Space Complexity: O(1)", "Single pass binary search without finding pivot first"],
      steps: [
        { stepNum: 1, title: "Calculate Midpoint", detail: "Set left = 0, right = N - 1. Mid = left + (right - left) // 2." },
        { stepNum: 2, title: "Identify Sorted Half", detail: "Check if left half is sorted (nums[left] <= nums[mid]). If true, left half is strictly increasing." },
        { stepNum: 3, title: "Check Target Bounds", detail: "If left half is sorted and target is between nums[left] and nums[mid], move right = mid - 1; else left = mid + 1." },
        { stepNum: 4, title: "Repeat for Right Half", detail: "Otherwise right half must be sorted. Adjust pointers accordingly until left > right." }
      ],
      codeHint: "function search(nums: number[], target: number): number"
    },
    systemSpec: {
      title: "PostgreSQL B-Tree Composite Indexing & EXPLAIN ANALYZE",
      statement: "Optimize slow PostgreSQL search query executing Seq Scan over 500,000 payment records. Create optimal B-Tree composite index following Leftmost Prefix Rule and verify plan in EXPLAIN ANALYZE.",
      inputContract: "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM payments WHERE user_id = 49201 AND status = 'COMPLETED'",
      outputContract: "Index Scan using idx_payments_user_status (actual time=0.031..0.034 ms)",
      latencyTarget: "Query execution time < 2ms (Buffers shared hit <= 5)",
      steps: [
        { stepNum: 1, title: "Run Baseline EXPLAIN", detail: "Execute EXPLAIN ANALYZE to confirm Seq Scan cost and timing (> 180ms)." },
        { stepNum: 2, title: "Design Composite Index", detail: "Identify most selective column (user_id) and place first: CREATE INDEX idx_payments_user_status ON payments (user_id, status)." },
        { stepNum: 3, title: "Verify Index Scan", detail: "Re-run EXPLAIN ANALYZE to verify Index Scan execution." },
        { stepNum: 4, title: "Check Buffer Hits", detail: "Verify shared hit buffer pages and confirm zero disk page reads." }
      ],
      codeHint: "CREATE INDEX idx_payments_user_status ON payments (user_id, status);"
    }
  },

  "day-3": {
    dayId: "day-3",
    dayTitle: "Day 3: Redis Sliding Window & Sliding Window Strings",
    leetcodeSpec: {
      problemNumber: 3,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      statement: "Given a string s, find the length of the longest substring without repeating characters.",
      inputExample: "s = \"abcabcbb\"",
      outputExample: "3 (Substring: \"abc\")",
      constraints: ["Time Complexity: O(N)", "Space Complexity: O(min(N, M)) where M is alphabet size", "Single pass left/right window pointers"],
      steps: [
        { stepNum: 1, title: "Initialize Window State", detail: "Maintain charMap = Map<char, last_seen_index> and left = 0, maxLen = 0." },
        { stepNum: 2, title: "Expand Right Pointer", detail: "Iterate right from 0 to s.length - 1. Fetch char = s[right]." },
        { stepNum: 3, title: "Shrink Window on Duplicate", detail: "If char in charMap and charMap.get(char) >= left, update left = charMap.get(char) + 1." },
        { stepNum: 4, title: "Record Max Length", detail: "Set charMap.set(char, right) and maxLen = Math.max(maxLen, right - left + 1)." }
      ],
      codeHint: "function lengthOfLongestSubstring(s: string): number"
    },
    systemSpec: {
      title: "Redis Sliding Window Rate Limiter Middleware",
      statement: "Build a production-grade Redis rate limiting middleware using Sorted Sets (ZSET) to prevent boundary burst exploits on public API endpoints.",
      inputContract: "GET /api/v1/resource (Headers: X-Forwarded-For: 192.168.1.1)",
      outputContract: "HTTP 200 (Headers: X-RateLimit-Remaining: 99) OR HTTP 429 Too Many Requests",
      latencyTarget: "Redis Pipeline Execution < 3ms",
      steps: [
        { stepNum: 1, title: "Define Key & Timestamps", detail: "Construct key = rate_limit:{ip}, now = Date.now(), windowStart = now - 60000." },
        { stepNum: 2, title: "Build Atomic Pipeline", detail: "Create redis.pipeline() with ZREMRANGEBYSCORE, ZADD, ZCARD, and EXPIRE." },
        { stepNum: 3, title: "Execute Pipeline", detail: "Execute pipeline.exec() and parse ZCARD result count." },
        { stepNum: 4, title: "Enforce Threshold", detail: "If count > limit return HTTP 429; else set remaining header and call next()." }
      ],
      codeHint: "pipeline.zremrangebyscore(key, 0, windowStart).zadd(key, now, member).zcard(key)"
    }
  },

  "day-4": {
    dayId: "day-4",
    dayTitle: "Day 4: Celery Async Reliability & Graph Traversal",
    leetcodeSpec: {
      problemNumber: 200,
      title: "Number of Islands",
      difficulty: "Medium",
      statement: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
      inputExample: "grid = [[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]",
      outputExample: "2",
      constraints: ["Time Complexity: O(M * N)", "Space Complexity: O(M * N) for recursion stack", "Mutate grid or track visited array"],
      steps: [
        { stepNum: 1, title: "Iterate Grid Cells", detail: "Loop r from 0 to M-1, c from 0 to N-1." },
        { stepNum: 2, title: "Trigger DFS on Land", detail: "If grid[r][c] == '1', increment islandCount by 1 and call dfs(r, c)." },
        { stepNum: 3, title: "DFS Sink Boundary", detail: "Inside dfs(r, c), return if out of bounds or grid[r][c] == '0'." },
        { stepNum: 4, title: "Mark Visited & Expand", detail: "Set grid[r][c] = '0' (sink land) and recursively call dfs in 4 directions (up, down, left, right)." }
      ],
      codeHint: "function numIslands(grid: string[][]): number"
    },
    systemSpec: {
      title: "Celery Worker Acks Late & Idempotent Retry Task",
      statement: "Configure an asynchronous background worker pipeline for processing payouts with CELERY_TASK_ACKS_LATE=True and DB row locking to guarantee task idempotency across worker crashes.",
      inputContract: "process_payout_task.delay(payout_id=98402)",
      outputContract: "Task Result: { status: 'COMPLETED', retries: 0 }",
      latencyTarget: "Async trigger < 15ms, Worker task completion < 1200ms",
      steps: [
        { stepNum: 1, title: "Set Task Decorator", detail: "Use @shared_task(bind=True, max_retries=3, acks_late=True)." },
        { stepNum: 2, title: "Row Locking Idempotency", detail: "Execute select_for_update() inside transaction.atomic() to check payout status." },
        { stepNum: 3, title: "Execute External API", detail: "Call bank transfer API inside try/except block." },
        { stepNum: 4, title: "Exponential Retry Backoff", detail: "On network exception call self.retry(exc=e, countdown=2**self.request.retries)." }
      ],
      codeHint: "PaymentTask.objects.select_for_update().get(id=payout_id)"
    }
  }
};
