# AI PROJECT INTELLIGENCE ASSISTANT

## Purpose

The assistant is the "wow" interaction layer.

It should let users ask questions instead of manually navigating dashboards.

## Example questions

### Policymaker
- Which projects have the highest predicted cost-overrun risk?
- Which sectors have the highest future-risk exposure?
- Which projects require immediate intervention?
- Compare this project with similar projects.
- Why is Project X high risk?
- What should be prioritized?

### Manager
- Which of my projects have severe delay risk?
- Why is Project X high risk?
- What are the top risk drivers?
- What interventions are currently open?
- Which warnings need action?

### Field Officer
- What are the current risks for my assigned project?
- What intervention do I need to verify?
- What issues were recently reported?

### Contractor
- What tasks are due this month?
- What is my target achievement?
- Which milestones are pending?
- What issues are open on my assigned project?

## Retrieval-first architecture

User query
→ role scope
→ intent detection
→ database retrieval
→ prediction retrieval
→ SHAP/recommendation retrieval
→ answer

Use LLM only to summarize/rephrase retrieved facts.

## Important

Do not allow an LLM to invent:
- risk values
- probabilities
- SHAP drivers
- model metrics
- project status
- government integrations
- recommendations unrelated to the deterministic prescription mapping.

## LLM fallback

Preferred:
Ollama/local model.

If unavailable:
use deterministic templates.

Example:

Question:
"Why is project P001 high risk?"

Answer generated from stored model output:

Future Risk Probability: 82%
Level: High

Top drivers:
1. Physical progress
2. Remaining planned duration
3. Genuine overdue status

Recommendations:
- prioritize incomplete critical activities;
- prepare recovery schedule;
- create overdue recovery plan.

## Data boundaries

Assistant must never query outside user authorization.

## UI

Use:
- suggested questions
- conversation history for current session
- project links
- source chips such as "Project Data", "Risk Model", "SHAP"
- concise answers
- expandable reasoning/details

Do not expose chain-of-thought.

Show concise evidence/reasons instead.
