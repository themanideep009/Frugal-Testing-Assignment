# Q23. Video Evaluation Presentation (Video CV Script)

**Target Duration:** 2 minutes 30 seconds (2 to 3 minutes strict window)  
**Host Platform:** Google Drive shareable video URL  

---

## Presentation Script & Delivery Outline

### 00:00 - 00:35 | Introduction & Prompt 1: Redefining the Role of an AI-Native Software Engineer
> *"Hello setup team and reviewers! My name is [Your Name], and I am thrilled to present my video evaluation for the AI-Native Software Engineer Intern position at Frugal Testing and BuildNexTech."*
> 
> *"In an era where modern generative AI tools like Claude, Cursor, and ChatGPT can generate boilerplate code layouts and test automation scripts instantaneously, the fundamental role of a software engineer has shifted from syntax writing to system architecture, boundary engineering, and zero-trust verification. Being an AI-Native Software Engineer does not mean blindly trusting AI outputs. It means acting as an orchestrator—engineering high-fidelity Chain-of-Thought system prompts, designing strict sandboxes, and building deterministic linter and contract layers that hold generative systems accountable against production race conditions, memory leaks, and dynamic DOM state drifts."*

---

### 00:35 - 01:15 | Prompt 2: Technical Project & Unhandled System Failure Experience
> *"In a recent project involving high-concurrency microservice event pipelines, I encountered a critical unhandled V8 memory leak under load. While standard end-to-end functional UI tests passed smoothly in isolated environments, concurrent stress testing saturated socket descriptor buffers, queuing over 50,000 microtasks on the Node.js event loop. This starved the main execution thread, preventing garbage collection sweeps and resulting in an abrupt heap out of memory crash."*
> 
> *"To resolve this, I isolated the service using process stack tracing with `jstack` and Chrome DevTools Protocol telemetry. I refactored the async promise loop, replaced unbounded queues with backpressure-aware streams, and implemented HikariPool database connection monitoring to eliminate thread exhaustion entirely."*

---

### 01:15 - 01:50 | Prompt 3: Balancing GenAI Speed without Introducing Vulnerabilities
> *"To accelerate development velocity without introducing security vulnerabilities, context fragmentation, or unverified code dependencies, I follow a strict three-tier verification policy:*
> 1. **Zero-Trust Input Constraints:** I structure generative queries using Few-Shot prompt templates that force models to produce parameterized queries and strongly typed JSON schemas, eliminating SQL injection vectors.
> 2. **Static AST Linter Gates:** Every piece of AI-generated code passes through automated linter tools and static analysis gates before entering git commits.
> 3. **Non-Generative Assertion Layers:** I write manual, deterministic unit and contract tests to validate business logic boundaries, ensuring AI models never codify flawed runtime behavior as passing baselines."*

---

### 01:50 - 02:30 | Prompt 4: Engineering Solutions from Scratch Without GenAI Tools
> *"If generative AI tools were completely unavailable, my fundamental engineering process remains grounded in first-principles problem solving:*
> - **System Decomposition:** I break down ambiguous technical problems by mapping data flows, state machines, and sequence diagrams on paper before touching the keyboard.
> - **Root-Cause Telemetry Inspection:** Rather than guessing failure causes, I rely on low-level OS telemetry, stack traces, and OpenTelemetry trace spans to isolate exact bottlenecks—whether it’s a database row-lock contention or a race condition in a canvas rendering loop.
> - **Iterative Verification:** I build modular unit test harnesses that exercise boundary values and verify system resilience incrementally."*

---

### 02:30 - 02:45 | Closing & Video Submission Link Placeholder
> *"Thank you for reviewing my technical submission. I am deeply aligned with Frugal Testing's mission of building cutting-edge, resilient quality infrastructure, and I look forward to contributing to the team!"*

---

### PDF Insertion Placeholder for Q23:
**Google Drive Presentation Video CV Link:** `[Insert your public shareable Google Drive link here]`  
*(Ensure permissions are set to "Anyone with the link can view")*
