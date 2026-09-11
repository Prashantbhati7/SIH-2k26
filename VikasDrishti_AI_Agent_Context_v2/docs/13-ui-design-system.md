# UI DESIGN SYSTEM

## Product character

Government-grade infrastructure command center.

Desired:
- credible
- analytical
- modern
- restrained
- information-dense
- accessible

Avoid:
- crypto aesthetic
- gaming aesthetic
- generic startup SaaS
- excessive glassmorphism
- giant gradients
- excessive rounded containers
- unnecessary 3D

## Layout

Desktop-first:
- persistent sidebar
- top command/search bar
- main content
- contextual actions

Mobile:
optimize field and contractor workflows.

## Color semantics

Use neutral base surfaces.

Risk semantics:
- green: low
- amber/yellow: medium
- orange/red: high/critical

Do not rely on color alone; include labels/icons.

## Typography

Strong page titles.
Clear section headers.
Compact metric labels.
Readable table text.

## Cards

Use cards for:
- KPIs
- model outputs
- warnings
- recommendations

Avoid putting every small piece of information into a card.

## Tables

Support:
- search
- filter
- sort
- pagination
- column visibility if practical
- row click

## Charts

Use Recharts.

Required:
- risk distribution
- cost prediction distribution
- delay prediction distribution
- progress trend
- expenditure trend
- risk by sector
- risk by ministry
- risk by state
- benchmark comparison
- contractor target vs achievement

Every chart needs:
- tooltip
- legend where useful
- empty state
- readable labels

## Risk score

Use a large but restrained visualization.

Example:
FUTURE RISK
82%
HIGH

Subtext:
"Model Risk Probability"

## SHAP

Use horizontal bars.

Each row:
feature
impact
direction

Allow click/hover for:
feature value
explanation
recommendation

## Warnings

Use a left severity indicator and clear label.

Warning card:
severity
title
project
basis
probability
driver
recommended action
status

## Timeline

Use a chronological activity feed:
- snapshot
- revision
- warning
- intervention
- field update
- contractor update

## Micro-interactions

Subtle only:
- page transitions
- number count-up
- chart reveal
- status changes
- toast

Never animate data in a way that could imply false live updates.

## Loading

Use skeletons.

## Empty states

Examples:
"No active warnings for this scope."

"No field updates have been submitted."

"No benchmark available due to insufficient comparable projects."

## Error states

Explain:
- what failed
- retry
- whether stale data is available

## Labels

Use:
- Demo Data
- Prototype
- Next-Snapshot Forecast
- Planned Integration
- Pilot

Where applicable.
