<!--
Sync Impact Report:
- Version Change: Initial → 1.0.0
- Initial Creation Date: 2026-02-11
- Principles Created:
  1. Hexagonal Architecture Discipline
  2. Test-Driven Development (TDD)
  3. User Experience Consistency
  4. Performance & Scalability Standards
- Sections Created:
  - Core Principles
  - Quality Standards
  - Development Workflow
  - Governance
- Templates Status:
  ✅ plan-template.md - Reviewed, constitution check placeholder ready
  ✅ spec-template.md - Reviewed, aligns with testing requirements
  ✅ tasks-template.md - Reviewed, supports test-first workflow
  ⚠ No command files exist yet (.specify/templates/commands/)
- Follow-up TODOs: None
-->

# PAPBattleTracker Constitution

## Core Principles

### I. Hexagonal Architecture Discipline

**Declaration**: All code MUST follow hexagonal (ports and adapters) architecture with strict dependency rules.

**Rules**:
- Domain layer has ZERO dependencies on infrastructure or frameworks
- Dependencies flow inward: Infrastructure → Application → Domain
- All external interactions through ports (interfaces defined in domain/core)
- Adapters implement ports, never the reverse
- Business logic resides exclusively in domain and application layers

**Rationale**: Hexagonal architecture ensures testability, maintainability, and technology independence. Domain logic must survive framework changes.

**Applies to**: All backends (Kotlin) and frontend (Angular). Reference implementations (Next.js) are exempt as they serve learning purposes only.

---

### II. Test-Driven Development (TDD) - NON-NEGOTIABLE

**Declaration**: Tests MUST be written before implementation. Red-Green-Refactor cycle is mandatory.

**Rules**:
- Write failing test first (RED)
- Implement minimal code to pass (GREEN)
- Refactor while keeping tests green (REFACTOR)
- Test coverage requirements:
  - Domain logic: 100% (use cases, entities, business rules)
  - Application services: ≥90%
  - Adapters: ≥80%
  - Infrastructure configuration: ≥60%
- Integration tests required for:
  - All REST endpoints
  - Database interactions
  - Authentication/authorization flows
  - Cross-component interactions

**Rationale**: TDD ensures correctness, reduces debugging time, and serves as living documentation. Tests guide design and prevent regression.

**Enforcement**: Pull requests without tests for new functionality will be rejected. Tests must exist in the commit history BEFORE implementation code.

---

### III. User Experience Consistency

**Declaration**: All user-facing features MUST provide consistent, predictable interactions across the application.

**Rules**:
- Visual Consistency:
  - Use project-defined design system/component library exclusively
  - No ad-hoc styling that deviates from established patterns
  - Consistent spacing, typography, and color usage
- Behavioral Consistency:
  - Similar actions produce similar results across features
  - Error messages follow standardized format and tone
  - Loading states and feedback mechanisms uniform throughout
- Accessibility Standards (WCAG 2.1 AA):
  - Keyboard navigation for all interactive elements
  - Screen reader compatibility
  - Color contrast ratios ≥4.5:1 for normal text
  - Focus indicators visible and consistent
- Responsive Design:
  - Mobile-first approach
  - Test on viewports: 320px (mobile), 768px (tablet), 1920px (desktop)
  - Touch targets ≥44x44px
- Cross-Backend Consistency:
  - Kotlin and Go backends MUST provide identical API contracts
  - Response formats, status codes, error structures must match exactly
  - Frontend should work with either backend without code changes

**Rationale**: Consistency reduces cognitive load, improves usability, and accelerates development through reusable patterns.

**Enforcement**: UI changes require screenshots/videos in PRs. Backend API changes require contract tests proving compatibility.

---

### IV. Performance & Scalability Standards

**Declaration**: All features MUST meet defined performance thresholds and scale gracefully under load.

**Performance Targets**:

Backend (Kotlin):
- API Response Time:
  - p50: ≤100ms
  - p95: ≤300ms
  - p99: ≤500ms
- Authentication Operations:
  - JWT validation: ≤10ms
  - Login/Register: ≤200ms (including password hashing)
- Database Queries:
  - Simple reads: ≤50ms
  - Complex aggregations: ≤200ms
- Throughput:
  - Concurrent users: ≥1,000
  - Requests/second: ≥500 (per instance)
- Memory:
  - Baseline: ≤256MB (idle)
  - Under load: ≤512MB (1000 concurrent users)

Frontend (Angular):
- Initial Load:
  - First Contentful Paint (FCP): ≤1.8s
  - Largest Contentful Paint (LCP): ≤2.5s
  - Time to Interactive (TTI): ≤3.8s
- Runtime:
  - Frame rate: ≥60 FPS during interactions
  - Input latency: ≤100ms
  - Smooth scrolling (no jank)
- Bundle Size:
  - Initial bundle: ≤200KB (gzipped)
  - Lazy-loaded routes: ≤100KB each (gzipped)
- API Interactions:
  - Debounce user input: 300ms minimum
  - Optimistic UI updates where appropriate
  - Graceful degradation on slow networks

**Optimization Requirements**:
- Lazy loading for routes and heavy components
- Virtual scrolling for lists >100 items
- Pagination for API responses >50 items
- Request caching where appropriate (with TTL)
- Database indexing for frequently queried fields
- Event sourcing replay must complete in <5s for 10,000 events

**Monitoring**:
- Performance benchmarks run in CI/CD
- Regressions >20% fail the build
- Production monitoring with alerting on threshold violations

**Rationale**: Performance is a feature. Slow applications frustrate users and limit scalability. Proactive monitoring prevents degradation.

**Enforcement**: Performance tests in CI. PRs that degrade performance without justification will be rejected.

---

## Quality Standards

### Code Quality

**Mandatory Practices**:
- Static Analysis:
  - Kotlin: Detekt (with default rules + custom project rules)
  - Angular: ESLint (with Angular + TypeScript recommended rules)
- Code Formatting:
  - Kotlin: ktlint
  - Go: gofmt + goimports
  - Angular: Prettier
  - All formatting enforced in pre-commit hooks
- Complexity Limits:
  - Cyclomatic complexity: ≤10 per function
  - File length: ≤300 lines (excluding tests)
  - Function length: ≤50 lines
  - Function parameters: ≤5
- Naming Conventions:
  - Descriptive names (no abbreviations except industry-standard: HTTP, JWT, API)
  - Boolean variables: is/has/can prefix
  - Functions: verb + noun (e.g., `getUserById`, `validateCredentials`)

### Documentation Requirements

**Mandatory Documentation**:
- Public APIs: JSDoc/KDoc/GoDoc for all public functions and types
- Complex Algorithms: Explain the "why", not the "what"
- Architecture Decisions: ADRs (Architecture Decision Records) for significant choices
- README.md: Quick start, development setup, testing instructions
- CLAUDE.md files: Context-specific guidance for each module

**Documentation Standards**:
- Examples for non-obvious usage
- Parameter constraints and validation rules
- Error conditions and exception types
- Performance characteristics (e.g., O(n) complexity)

### Security Standards

**Required Security Practices**:
- Authentication:
  - JWT tokens with secure, rotating secrets
  - Token expiration: ≤24 hours
  - Refresh token rotation on use
- Password Security:
  - BCrypt hashing (work factor ≥12)
  - Minimum length: 8 characters
  - No password in logs, error messages, or URLs
- Input Validation:
  - Validate all user input at entry points
  - Sanitize data before storage
  - Parameterized queries only (no string concatenation)
- Error Handling:
  - No sensitive data in error responses
  - Generic messages to users, detailed logs internally
  - Proper HTTP status codes
- Dependency Security:
  - Regular dependency updates (monthly)
  - Automated vulnerability scanning in CI
  - No dependencies with known HIGH/CRITICAL vulnerabilities

---

## Development Workflow

### Branch Strategy

- `main`: Production-ready code (protected)
- Feature branches: `feature/###-short-description`
- Hotfix branches: `hotfix/###-short-description`
- Branch naming matches issue/story number

### Commit Standards

- Conventional Commits format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`
- Atomic commits (one logical change per commit)
- Tests in same commit as implementation (but after, preserving TDD history)

### Pull Request Requirements

**Before Submitting PR**:
- All tests pass locally
- Code formatted with project tools
- No linter warnings or errors
- Performance benchmarks run (if applicable)
- Self-review completed

**PR Content**:
- Title: Conventional Commits format
- Description: Problem + solution + testing notes
- Screenshots/videos for UI changes
- Breaking changes highlighted
- Related issue/story linked

**Review Criteria**:
- Constitution compliance (all principles)
- Test coverage meets thresholds
- Performance within targets
- Code quality meets standards
- Documentation updated
- No unresolved review comments

### CI/CD Pipeline

**Build Gates** (must pass):
1. Compilation/build
2. Unit tests (with coverage report)
3. Integration tests
4. Linting and formatting checks
5. Security vulnerability scan
6. Performance benchmarks
7. Contract tests (for API changes)

**Deployment Gates**:
- All build gates passed
- Code review approved (≥1 reviewer)
- Constitution compliance verified
- Production monitoring ready

---

## Governance

### Authority & Compliance

This constitution supersedes all other development practices, guidelines, and conventions. When conflicts arise, constitution principles take precedence.

**Compliance Enforcement**:
- All pull requests MUST verify compliance with every applicable principle
- Complexity that violates principles MUST be justified with:
  1. Specific technical limitation preventing compliance
  2. Concrete alternatives considered and rejected
  3. Plan to resolve violation in future
- Constitution violations without justification will be rejected in code review

### Amendment Process

**Proposing Amendments**:
1. Document proposed change with rationale
2. Identify affected code/teams
3. Provide migration plan for existing code
4. Seek approval from project maintainers

**Version Semantics**:
- MAJOR: Backward-incompatible principle removals or redefinitions
- MINOR: New principles added or material expansions
- PATCH: Clarifications, wording improvements, non-semantic refinements

### Living Documentation

**Runtime Guidance**:
- `CLAUDE.md` files provide day-to-day development guidance
- Constitution defines non-negotiable rules
- CLAUDE.md files must align with constitution but may provide additional context

**Review Cycle**:
- Constitution reviewed quarterly
- Outdated principles updated or removed
- New practices codified after proven successful

---

**Version**: 1.0.0 | **Ratified**: 2026-02-11 | **Last Amended**: 2026-02-11