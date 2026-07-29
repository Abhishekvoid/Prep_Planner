/**
 * High-ROI 0-to-1 Curriculum mapped DIRECTLY to the 10-Day Prep Plan (seed.ts).
 * 
 * Every topic maps to a specific day & track from the user's active 10-day prep plan:
 * - Day 1: Django ORM + Query Optimization
 * - Day 2: PostgreSQL — Indexes, EXPLAIN ANALYZE, & Transactions
 * - Day 3: Redis — Caching, Rate Limiting, & Patterns
 * - Day 4: Celery — Async Tasks, Queues, & Reliability
 * - Day 5: Payment System Design & Fault Tolerance
 * - Day 6: RAG Project Architecture & Vector Search
 * - Day 7: Notification System Design & Fan-Out
 * - Day 8: Monitoring, Production Debugging, & LLM Gateway
 * - Day 9: Mock Interview & Gap Analysis
 * - Day 10: Action & Cold Outreach Execution
 */

export interface FDETopic {
  id: string;
  dayIndex: number;
  title: string;
  category: "Django & ORM" | "Postgres & DB" | "Redis & Caching" | "Celery & Async" | "System Design" | "RAG & AI Systems" | "Monitoring & Observability" | "DSA & Algorithms";
  readTimeMin: number;
  concept: string;
  codeLanguage: string;
  codeSnippet: string;
  interviewGotchas: string[];
  nextTopicId?: string;
}

export const FDE_CURRICULUM: Record<string, FDETopic> = {
  // DAY 1
  "day-1-django-orm": {
    id: "day-1-django-orm",
    dayIndex: 1,
    title: "Django ORM + Query Optimization (select_related & prefetch_related)",
    category: "Django & ORM",
    readTimeMin: 12,
    concept: `### Day 1: 0-to-1 Django ORM Query Optimization

**0 (Beginner Foundation):**
Django ORM lazily evaluates queries. When accessing related foreign key fields inside a loop, Python executes 1 query for the initial list + 1 query *per item*, causing the **N+1 Query Problem**.

**1 (Interview-Ready Mastery):**
- **select_related()**: Uses SQL \`INNER JOIN\` / \`LEFT OUTER JOIN\`. Use for Single-Value relationships (\`ForeignKey\`, \`OneToOne\`). Executes in **1 single SQL query**.
- **prefetch_related()**: Performs separate SQL queries and joins relationships in Python memory. Use for Multi-Value relationships (\`ManyToManyField\`, reverse \`ForeignKey\`).
- **annotate() vs aggregate()**: \`annotate()\` computes per-row summaries (adds a column); \`aggregate()\` calculates a single summary dictionary across the entire table.
- **F() & Q() expressions**: \`F()\` updates DB fields directly without pulling to Python (prevents race conditions). \`Q()\` enables complex \`OR\`/\`AND\`/\`NOT\` query logic.`,
    codeLanguage: "python",
    codeSnippet: `from django.db.models import Count, F, Q
from myapp.models import Customer, Order

# 1. Optimal Query combining select_related, prefetch_related, annotate & Q
customers = Customer.objects.filter(
    Q(country="US") | Q(is_vip=True)
).select_related(
    "profile"  # OneToOne -> INNER JOIN
).prefetch_related(
    "orders__items"  # ManyToMany -> Separate IN query
).annotate(
    total_orders=Count("orders", filter=Q(orders__status="completed"))
)

# 2. Atomic Stock Decrement using F() expression (No Race Condition)
Order.objects.filter(id=order_id).update(
    stock_count=F("stock_count") - 1
)`,
    interviewGotchas: [
      "Q: What is N+1? How do you detect and fix it? (A: N+1 executes 1 + N queries. Detect via django-debug-toolbar or nplusone; fix with select_related / prefetch_related).",
      "Gotcha: Using select_related on ManyToMany multiplies returned database rows exponentially. Always use prefetch_related for M2M.",
      "Latency Target: Reduce page queries from 120 queries (800ms) down to 2 queries (14ms)."
    ],
    nextTopicId: "day-2-postgres-indexing"
  },

  // DAY 2
  "day-2-postgres-indexing": {
    id: "day-2-postgres-indexing",
    dayIndex: 2,
    title: "PostgreSQL — Indexes, EXPLAIN ANALYZE, & Transactions",
    category: "Postgres & DB",
    readTimeMin: 12,
    concept: `### Day 2: 0-to-1 PostgreSQL Query Planning & ACID

**0 (Beginner Foundation):**
Postgres stores data on disk blocks. Without an index, finding a row requires a **Seq Scan** (reading every disk page sequentially).

**1 (Interview-Ready Mastery):**
- **B-Tree Indexes**: Default index type in Postgres. Ideal for equality (\`=\`) and range (\`<\`, \`>\`, \`BETWEEN\`) queries.
- **Composite Index Order**: Leftmost Prefix Rule — column order matters! Place the **most selective column first** (\`CREATE INDEX idx_user_status ON payments (user_id, status)\`).
- **EXPLAIN vs EXPLAIN ANALYZE**: \`EXPLAIN\` estimates cost using DB statistics; \`EXPLAIN ANALYZE\` **executes** the query and returns exact timing (in ms), actual row counts, and buffer hits.
- **ACID & Deadlocks**: Atomicity, Consistency, Isolation, Durability. Deadlocks happen when Transaction A locks Row 1 then requests Row 2, while Transaction B locks Row 2 then requests Row 1. Postgres detects deadlocks via \`deadlock_timeout\` and aborts one transaction.`,
    codeLanguage: "sql",
    codeSnippet: `-- 1. Create a Composite B-Tree Index on Payments table
CREATE INDEX idx_payments_user_status 
ON payments (user_id, status);

-- 2. Execute Query Plan Analysis with actual execution buffer stats
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM payments 
WHERE user_id = 49201 AND status = 'COMPLETED';

/* 
Expected Output:
Index Scan using idx_payments_user_status on payments  (cost=0.42..8.44 rows=1 width=128) (actual time=0.031..0.034 rows=1 loops=1)
  Buffers: shared hit=3
Execution Time: 0.052 ms
*/`,
    interviewGotchas: [
      "Q: Why might Postgres ignore a B-Tree index and run a Seq Scan instead? (A: If the table is small or if the query returns >20% of total rows, Seq Scan is faster than random index disk reads).",
      "Q: What property prevents dirty reads? (A: Read Committed isolation level).",
      "Latency Target: Query execution time under 2ms using composite index scan."
    ],
    nextTopicId: "day-3-redis-caching-ratelimit"
  },

  // DAY 3
  "day-3-redis-caching-ratelimit": {
    id: "day-3-redis-caching-ratelimit",
    dayIndex: 3,
    title: "Redis — Caching Patterns & Sliding Window Rate Limiting",
    category: "Redis & Caching",
    readTimeMin: 12,
    concept: `### Day 3: 0-to-1 Redis In-Memory Architecture

**0 (Beginner Foundation):**
Redis is an in-memory key-value data store operating in sub-millisecond latency (< 1ms).

**1 (Interview-Ready Mastery):**
- **Cache-Aside Pattern**: Check Redis first. On **Hit**, return cached JSON. On **Miss**, query Postgres DB, populate Redis with TTL (\`SETEX\`), and return.
- **Cache Stampede (Thundering Herd)**: When a popular key expires, 10,000 concurrent requests miss simultaneously and overwhelm PostgreSQL. Fix using probabilistic early expiration or distributed locks (\`SETNX\`).
- **Sliding Window Rate Limiter**: Fixed window counters have a **boundary burst flaw** (allows double limit at window boundaries). Solve using Redis **Sorted Sets (ZSET)**: \`ZREMRANGEBYSCORE\` + \`ZADD\` + \`ZCARD\` inside an atomic pipeline.`,
    codeLanguage: "typescript",
    codeSnippet: `import Redis from 'ioredis';
const redis = new Redis();

// Production Sliding Window Rate Limiter Middleware
export async function checkRateLimit(userId: string, limit = 100, windowSec = 60) {
  const key = \`rate_limit:\${userId}\`;
  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, now, now + '-' + Math.random());
  pipeline.zcard(key);
  pipeline.expire(key, windowSec);

  const results = await pipeline.exec();
  const count = (results?.[2][1] as number) || 0;

  return { allowed: count <= limit, count, limit };
}`,
    interviewGotchas: [
      "Q: Cache-Aside vs Write-Through — when to choose which? (Cache-Aside is resilient to cache crashes; Write-Through maintains strict consistency for high-write data).",
      "Gotcha: Ensure Redis maxmemory policy is set to volatile-lru or allkeys-lru to prevent OOM memory crashes.",
      "Latency Target: Cache hit response < 2ms vs DB fallback 120ms."
    ],
    nextTopicId: "day-4-celery-async-reliability"
  },

  // DAY 4
  "day-4-celery-async-reliability": {
    id: "day-4-celery-async-reliability",
    dayIndex: 4,
    title: "Celery — Async Task Queues & Worker Failure Handling",
    category: "Celery & Async",
    readTimeMin: 12,
    concept: `### Day 4: 0-to-1 Asynchronous Background Processing

**0 (Beginner Foundation):**
Executing slow operations (sending emails, video encoding, OCR parsing) inside an HTTP view blocks the web server thread and times out requests.

**1 (Interview-Ready Mastery):**
- **Celery Architecture**: Producer (Django view) → Broker (Redis/RabbitMQ queue) → Worker (Celery daemon) → Result Backend (Redis).
- **Worker Crash Recovery**: Set \`CELERY_TASK_ACKS_LATE=True\` so tasks are acknowledged *only after completion*. If a worker dies mid-task, the broker re-queues the message.
- **Task Idempotency**: Since network retries can execute a task twice, enforce idempotency by storing a state flag in PostgreSQL before executing side effects.
- **Prefetch Tuning**: Set \`CELERY_WORKER_PREFETCH_MULTIPLIER=1\` for long-running tasks so fast workers don't hoard tasks while slow workers starve.`,
    codeLanguage: "python",
    codeSnippet: `from celery import shared_task
from django.db import transaction
from myapp.models import PaymentTask

@shared_task(bind=True, max_retries=3, acks_late=True)
def process_payout_task(self, payout_id):
    try:
        with transaction.atomic():
            # 1. Lock payment row to enforce task idempotency
            payout = PaymentTask.objects.select_for_update().get(id=payout_id)
            if payout.status == "COMPLETED":
                return "ALREADY_PROCESSED"
            
            payout.status = "PROCESSING"
            payout.save()

        # 2. Execute external API call
        execute_bank_transfer(payout)
        
        payout.status = "COMPLETED"
        payout.save()
    except Exception as exc:
        # Exponential backoff retry: 2s, 4s, 8s
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)`,
    interviewGotchas: [
      "Q: What if Django triggers a Celery task before the DB transaction commits? (A: Celery worker fires immediately, tries to fetch DB row, fails with ObjectDoesNotExist. Fix: Use transaction.on_commit(lambda: task.delay())).",
      "Q: What is a Dead Letter Queue (DLQ)? (A: A secondary queue where tasks failing max_retries are routed for debugging).",
      "Latency Target: Instant HTTP response (15ms) while background task runs asynchronously."
    ],
    nextTopicId: "day-5-payment-system-design"
  },

  // DAY 5
  "day-5-payment-system-design": {
    id: "day-5-payment-system-design",
    dayIndex: 5,
    title: "Payment System Design — Fault Tolerance & Idempotency",
    category: "System Design",
    readTimeMin: 15,
    concept: `### Day 5: 0-to-1 High-Availability Payment Architecture

**0 (Beginner Foundation):**
Designing a payment processing gateway (Razorpay / Stripe style) where money is charged and double-spending must be impossible.

**1 (Interview-Ready Mastery):**
- **Idempotency Key**: Client sends a unique \`Idempotency-Key: UUID\` in request headers. The API checks Redis/DB before charging. If key exists, return the cached payment result without charging twice.
- **Gateway Timeout Handling**: If the payment gateway times out, the charge *may or may not* have succeeded. Do not retry blindly! Poll gateway status API or rely on Webhook Reconciliation.
- **Transactional Outbox Pattern**: Write DB updates and message queue events in a **single atomic DB transaction** to prevent state inconsistency if the broker crashes.
- **Optimistic Locking**: Use a \`version\` column in DB to prevent concurrent balance updates (\`UPDATE account SET balance = balance - 100, version = version + 1 WHERE id = 1 AND version = 2\`).`,
    codeLanguage: "python",
    codeSnippet: `from django.db import transaction
from myapp.models import Payment, OutboxEvent

def process_payment_with_outbox(user_id, amount, idempotency_key):
    with transaction.atomic():
        # 1. Check idempotency
        existing = Payment.objects.filter(idempotency_key=idempotency_key).first()
        if existing:
            return existing.as_json()

        # 2. Record payment in DB
        payment = Payment.objects.create(
            user_id=user_id,
            amount=amount,
            idempotency_key=idempotency_key,
            status="PENDING"
        )

        # 3. Transactional Outbox: Write event payload to DB in SAME transaction
        OutboxEvent.objects.create(
            event_type="PAYMENT_CREATED",
            payload={"payment_id": payment.id, "amount": str(amount)}
        )

    return payment.as_json()`,
    interviewGotchas: [
      "Q: What if the payment gateway charges the customer card, but your DB write fails? (A: Reconcile via Gateway Webhooks + nightly automated bank settlement reconciliation ledger).",
      "Gotcha: Webhook delivery is At-Least-Once — webhooks can arrive multiple times or out of order. Verify signature and check idempotency key.",
      "Interview Focus: Walk through all 4 failure modes (Gateway timeout, Webhook failure, DB crash, Network partition)."
    ],
    nextTopicId: "day-6-rag-architecture"
  },

  // DAY 6
  "day-6-rag-architecture": {
    id: "day-6-rag-architecture",
    dayIndex: 6,
    title: "RAG Project — Vector Retrieval, Cross-Encoder Reranking & Evals",
    category: "RAG & AI Systems",
    readTimeMin: 15,
    concept: `### Day 6: 0-to-1 Production RAG & AI Systems Architecture

**0 (Beginner Foundation):**
Retrieval-Augmented Generation (RAG) injects relevant document chunks into an LLM context prompt to prevent hallucinations.

**1 (Interview-Ready Mastery):**
- **Qdrant vs pgvector**: Qdrant is a dedicated vector DB written in Rust with HNSW indexing, filtering, and payload payload payloads; pgvector is suitable for low-scale MVP integrations.
- **Cross-Encoder Reranking**: Bi-encoders (e.g. OpenAI embeddings) perform fast first-pass vector search (Top 50 candidates). Cross-Encoders (\`ms-marco-MiniLM-L-6-v2\`) compute joint Query + Text attention for precise second-pass ranking (Top 5).
- **Ragas Evaluation Metrics**: Quantify RAG performance using Faithfulness (no hallucinated claims), Answer Relevance, and Context Precision.
- **Intent Routing**: Classify user query upfront — bypass RAG entirely for conversational queries ("Hi", "Thanks") to reduce cost and latency.`,
    codeLanguage: "python",
    codeSnippet: `from sentence_transformers import CrossEncoder
import qdrant_client

def production_rag_pipeline(query_text: str):
    # 1. Dense Vector Search (First Pass: Top 50)
    qdrant = qdrant_client.QdrantClient(host="localhost", port=6333)
    query_vector = embed_model.encode(query_text)
    hits = qdrant.search(collection_name="docs", query_vector=query_vector, limit=50)

    # 2. Cross-Encoder Precision Reranking (Second Pass: Top 5)
    reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
    pairs = [[query_text, hit.payload['text']] for hit in hits]
    scores = reranker.predict(pairs)

    # Rank and slice top 5 contexts
    ranked = sorted(zip(scores, hits), key=lambda x: x[0], reverse=True)
    top_contexts = [hit.payload['text'] for score, hit in ranked[:5]]

    # 3. LLM Prompt Synthesis
    prompt = f"Contexts:\\n" + "\\n---\\n".join(top_contexts) + f"\\n\\nQuestion: {query_text}"
    return call_llm(prompt)`,
    interviewGotchas: [
      "Q: Why did you pick Qdrant over Pinecone/pgvector? (A: Qdrant is open-source, self-hostable via Docker, supports memory-mapped HNSW vectors, and has zero per-query cloud cost).",
      "Latency Target: Retrieval 25ms + Rerank 110ms + LLM First Token 400ms = Total 535ms.",
      "Gotcha: Semantic chunking vs fixed-token chunking — semantic chunking splits at paragraph/heading boundaries to preserve complete ideas."
    ],
    nextTopicId: "day-7-notification-system"
  },

  // DAY 7
  "day-7-notification-system": {
    id: "day-7-notification-system",
    dayIndex: 7,
    title: "System Design — Scalable Multi-Channel Notification Platform",
    category: "System Design",
    readTimeMin: 12,
    concept: `### Day 7: 0-to-1 Notification Platform Architecture

**0 (Beginner Foundation):**
Designing a system to deliver 10 Million notifications/day across Email, SMS, and Push notifications.

**1 (Interview-Ready Mastery):**
- **Fan-Out Queue Pattern**: Single user event ("Order Shipped") is published to an Exchange, which fans out to separate dedicated queues: Email Queue, SMS Queue, Push Queue.
- **Provider Failover**: If primary SMS provider (Twilio) fails or rate-limits, automatically catch error and failover to secondary provider (AWS SNS / MessageBird).
- **Read Replica Isolation**: User notification preferences (e.g. "Do not disturb between 10pm-8am") are queried from PostgreSQL Read Replicas to avoid overloading primary DB.
- **Delivery State Tracking**: State machine tracks status: \`QUEUED\` → \`SENT\` → \`DELIVERED\` / \`BOUNCED\` with idempotency check per notification ID.`,
    codeLanguage: "typescript",
    codeSnippet: `// Multi-Provider Failover Worker
export async function sendSMSNotification(userId: string, message: string) {
  try {
    // 1. Primary Provider Attempt
    return await twilioClient.messages.create({ body: message, to: userPhone });
  } catch (primaryErr) {
    console.warn("Primary SMS Provider (Twilio) failed. Executing Failover to SNS...");
    // 2. Automated Secondary Provider Failover
    return await awsSNSClient.publish({ Message: message, PhoneNumber: userPhone });
  }
}`,
    interviewGotchas: [
      "Q: How do you prevent spamming users if 50 events trigger simultaneously? (A: Apply rate-limiting buffer per user ID — max 2 notifications per minute).",
      "Gotcha: Decouple template rendering from worker execution by caching pre-rendered templates in Redis."
    ],
    nextTopicId: "day-8-monitoring-debugging"
  },

  // DAY 8
  "day-8-monitoring-debugging": {
    id: "day-8-monitoring-debugging",
    dayIndex: 8,
    title: "Monitoring, Production Debugging, & LLM Gateway",
    category: "Monitoring & Observability",
    readTimeMin: 12,
    concept: `### Day 8: 0-to-1 Observability & Production Runbook

**0 (Beginner Foundation):**
When a system goes down in production, diagnosing root cause systematically without guessing.

**1 (Interview-Ready Mastery):**
- **Prometheus Metrics Types**:
  - **Counter**: Monotonically increasing number (e.g. \`http_requests_total\`).
  - **Gauge**: Number that goes up and down (e.g. \`celery_queue_depth\`, active DB connections).
  - **Histogram**: Measures distribution of values in buckets (e.g. p50, p95, p99 latency).
- **p99 Latency vs Mean**: p99 exposes tail latency (the slowest 1% of users under load). Mean latency hides catastrophic outages.
- **Debug Order Runbook**: 1. High-level Error Rate → 2. p99 Latency → 3. Queue Depth → 4. Database Connection Pool & Slow Query Log → 5. Server Memory/CPU.
- **LLM Gateway & Semantic Cache**: Check Redis for semantically identical queries (Cosine similarity > 0.92) before calling OpenAI API. Route to fallback model (GPT-4o → GPT-4o-mini) on API timeout.`,
    codeLanguage: "typescript",
    codeSnippet: `import { Counter, Histogram } from 'prom-client';

// 1. Prometheus Metrics
export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'status']
});

export const httpDurationHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});`,
    interviewGotchas: [
      "Q: Production is down. Walk me through your debug runbook step-by-step. (Answer using the 5-step order above).",
      "Q: How do you implement a Semantic Cache for LLMs? (Embed query → search vector DB/Redis → if similarity >= 0.92 return cached text without LLM API call)."
    ],
    nextTopicId: "day-1-django-orm"
  }
};
