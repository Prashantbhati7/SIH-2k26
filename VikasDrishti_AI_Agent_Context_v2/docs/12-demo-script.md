# SIH JUDGE DEMO SCRIPT

## Goal

Demonstrate the complete intelligence loop rather than clicking through unrelated screens.

## Demo project

Create one seeded demo project with:
- enough monthly history;
- risk prediction;
- cost prediction;
- delay prediction;
- SHAP drivers;
- warning;
- prescription;
- intervention;
- field update;
- contractor task.

Do not fake ML output if real model inference is available.

## Step 1 — Minister

Login.

Show:
National Infrastructure Intelligence.

Say:
"Instead of only showing project status, VikasDrishti identifies where intervention may be required."

Open Risk Map.

Select high-risk project.

## Step 2 — Project profile

Show:
- current cost
- revised cost
- expenditure
- physical progress
- delay
- cost forecast
- delay forecast
- future risk probability

## Step 3 — Explain

Open:
"Why is this project at risk?"

Show actual top 5 SHAP drivers.

Key message:
"The model does not simply label the project risky; it exposes the factors influencing the prediction."

## Step 4 — Warn

Open Early Warning.

Show:
- prediction
- probability
- supporting driver
- severity
- action

## Step 5 — Prescribe

Open recommendations.

Show:
- driver
- recommendation
- priority
- responsible role

Create intervention.

## Step 6 — Manager

Login as manager.

Show:
assigned intervention.

Acknowledge and move it to in progress.

## Step 7 — Benchmark

Compare:
- project
- sector
- ministry
- similar projects

Do not make unsupported causal claims.

## Step 8 — Field officer

Login.

Open assigned project.

Submit:
- progress
- issue
- evidence
- remarks.

## Step 9 — Contractor

Login.

Show:
- monthly target
- achievement
- tasks
- milestone

Update a task.

## Step 10 — Close loop

Return to manager.

Show:
field/contractor activity in timeline.

Explain:
"Execution data is now retained as enriched data for future model improvement."

## Step 11 — Model Lab

Show actual:
- features
- models
- metrics
- split methodology
- limitations

## Step 12 — CUF vs Enriched

Show:
CUF current model
→ pilot enriched data
→ future retraining

Do not show fabricated future metrics.

## Step 13 — AI Assistant

Ask:
"Which projects have the highest predicted cost-overrun risk?"

Then:
"Why is this project high risk?"

Then:
"What should we do?"

The assistant should answer from actual database/model outputs.

## Demo principle

Spend most time on:

Project
→ Predict
→ Explain
→ Warn
→ Prescribe
→ Act
→ Verify

Do not spend most of the demo on landing-page animation.
