# Bloom Coffee — Review Rubric (for engineers)

Use this when reviewing candidate submissions. Score each section; use **Notes** for specifics. At the end, use **Overall** to recommend: **Move to Phase 2** / **No** / **Discuss**.

---

## 1. Completeness — Did they ship all five stories?

| Story | All AC met? | Notes |
|-------|-------------|--------|
| 1 — Admin auth | ☐ Yes ☐ Partial ☐ No | |
| 2 — Drinks CRUD | ☐ Yes ☐ Partial ☐ No | |
| 3 — Add-ons CRUD | ☐ Yes ☐ Partial ☐ No | |
| 4 — Customer menu + running total + mobile | ☐ Yes ☐ Partial ☐ No | |
| 5 — Submit order, name, order ID, confirmation | ☐ Yes ☐ Partial ☐ No | |

**Partial** = most AC met, minor gaps. **No** = major AC missing or broken.

---

## 2. Correctness — Does it work?

| Check | Pass? | Notes |
|-------|--------|--------|
| Deployed app link works | ☐ Yes ☐ No | |
| Can run locally per their README | ☐ Yes ☐ No (blocker if we can't run it) | |
| Admin login works (credentials provided and valid) | ☐ Yes ☐ No | |
| Auth actually protects admin routes | ☐ Yes ☐ No | |
| Drinks CRUD persists; customer menu updates | ☐ Yes ☐ No | |
| Add-ons CRUD persists; customer can select add-ons | ☐ Yes ☐ No | |
| Running total correct (base + add-on prices) | ☐ Yes ☐ No | |
| Order submission shows order ID + name + summary | ☐ Yes ☐ No | |
| Customer flow usable on phone and desktop | ☐ Yes ☐ Partial ☐ No | |

---

## 3. Code quality — Would we want to maintain this?

| Criterion | Strong | Adequate | Weak | Notes |
|-----------|--------|----------|------|--------|
| Structure / organization | Clear, logical layout | Understandable | Hard to follow | |
| Readability | Easy to read, named well | OK | Unclear or messy | |
| Consistency | Consistent patterns, style | Mostly consistent | Inconsistent | |
| Complexity | Appropriate for scope | Some over/under-engineering | Way off | |

Not grading for perfect design — we're looking for "could we work in this codebase?"

---

## 4. Documentation and submission

| Check | Pass? | Notes |
|-------|--------|--------|
| README has run instructions (deps, env, how to start) | ☐ Yes ☐ No | |
| README has deploy URL and/or how they deployed | ☐ Yes ☐ No | |
| Admin credentials (or how to create admin) clearly provided | ☐ Yes ☐ No | |
| PR description includes deployed app link | ☐ Yes ☐ No | |

---

## 5. Communication — How clearly do they explain their work?

| Criterion | Strong | Adequate | Weak | Notes |
|-----------|--------|----------|------|--------|
| PR description | Clear link, credentials, tech stack; easy to review | Has essentials | Missing link, credentials, or hard to follow | |
| README / run instructions | Clear, copy-pasteable, no guesswork | Usable | Vague or incomplete | |
| Trade-offs and decisions | Explains key choices (auth, persistence, etc.) | Mentions something | No context | |

We're looking for "can they communicate what they built and why?" — not length.

---

## 6. Testing — Did they add automated tests?

| Criterion | Strong | Adequate | Weak | None | Notes |
|-----------|--------|----------|------|------|--------|
| Presence | Meaningful coverage (unit and/or integration or E2E) | Some tests for critical paths | Only a few or trivial tests | No tests | |
| Relevance | Tests cover business logic, totals, auth, or key flows | Hit important behavior | Mostly incidental | — | |
| Runnable | Tests run cleanly (e.g. in README or standard command) | Run with minimal setup | Broken or unclear how to run | — | |

Not requiring full coverage — we care that they thought about testing and added something useful.

---

## 7. Optional / other (don't penalize if missing)

- Sensible git history (meaningful commits)
- Other notes worth flagging for the team

---

## Overall recommendation

| | Use when |
|--|----------|
| **Move to Phase 2** | All stories complete (or one small gap), app runs, code is maintainable, communication clear, and testing considered. We want to pair and see how they think. |
| **No** | Major stories missing or broken, can't run the app, code is unreviewable, or communication is insufficient to evaluate. |
| **Discuss** | Mixed: e.g. complete but weak on tests or communication, or one story weak. Flag for team discussion. |

**Recommendation:** ☐ Move to Phase 2  ☐ No  ☐ Discuss  

**Reviewer notes (for hiring team):**

---

## Perfection Game — Feedback to candidate

Use this section to give the candidate clear, improvement-oriented feedback (from [Core Protocols](https://thecoreprotocols.org/protocols/perfectiongame)). You can share this with them (especially if they're not moving forward) so they get something constructive and respectful.

**Commitments:** Only positive comments: what you liked and what would make it a 10. No negative or critical phrasing. The 1–10 scale is "how much value can I add?" — a 10 means you can't add value; a 5 means you can say how to make it twice as good. Only withhold points if you can name specific improvements.

1. **To make it a 10, you would have to:**  
   _[Specific, actionable improvements — e.g. "Add a sentence in the README on how to create an admin user" or "Protect the admin API so unauthenticated requests return 401."]_

2. **What I liked about the submission was:**  
   _[List what was valuable or should be amplified — e.g. "Clear run instructions," "Running total logic was correct and easy to follow," "Mobile layout worked well."]_

3. **Rating (1–10, value I can add):** _____  
   _[10 = I can't add value; 5 = I can describe how to make it at least twice as good.]_

Optional: If multiple reviewers use Perfection Game, aggregate "what we liked" and "to make it a 10" before sending to the candidate.
