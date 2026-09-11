# ACCEPTANCE TESTS

## Authentication

- [ ] Four demo roles can log in.
- [ ] Wrong credentials fail.
- [ ] Protected routes require authentication.
- [ ] Logout works.

## RBAC

- [ ] Policymaker sees portfolio.
- [ ] Manager sees authorized projects.
- [ ] Field officer sees assigned projects only.
- [ ] Contractor sees assigned projects only.
- [ ] Contractor cannot access policymaker endpoints.
- [ ] Backend enforces scope.

## Data

- [ ] Actual dataset can be imported when available.
- [ ] Project snapshots are separated by project.
- [ ] Latest snapshot query works.
- [ ] KPIs come from DB.
- [ ] Human-readable category mappings work.
- [ ] Data validation catches invalid records.

## ML

- [ ] Cost model uses exactly 13 features.
- [ ] Delay model uses exactly 13 features.
- [ ] Risk model uses exactly 13 features.
- [ ] Latest project snapshot is used.
- [ ] Cost class probabilities display.
- [ ] Delay class probabilities display.
- [ ] Risk probability displays.
- [ ] Risk thresholds match notebook.
- [ ] Model version is stored.

## SHAP

- [ ] Top 5 drivers are available.
- [ ] Drivers are sorted by absolute SHAP impact.
- [ ] Positive/negative direction displays.
- [ ] Human-readable explanation displays.
- [ ] Prescription maps to driver.

## Warning

- [ ] Warning contains basis.
- [ ] Warning contains severity.
- [ ] Warning contains project.
- [ ] Warning contains supporting driver.
- [ ] Warning lifecycle works.

## Intervention

- [ ] Recommendation can be assigned.
- [ ] Assigned user can see it.
- [ ] Status changes persist.
- [ ] Escalation works.
- [ ] Resolution works.
- [ ] Audit log records changes.

## Field

- [ ] Field officer can submit progress.
- [ ] Field officer can report issue.
- [ ] Evidence can be attached.
- [ ] Verification status persists.

## Contractor

- [ ] Contractor sees assigned tasks.
- [ ] Contractor can update achievement.
- [ ] Monthly target displays.
- [ ] Milestone status updates.

## Assistant

- [ ] Assistant respects RBAC.
- [ ] Assistant can answer project questions from DB.
- [ ] Assistant can explain model output.
- [ ] Assistant does not invent model values.
- [ ] Ollama failure does not break app.

## Model Lab

- [ ] Actual notebook metrics are displayed accurately.
- [ ] GroupShuffleSplit is described accurately.
- [ ] Limitations are visible.
- [ ] CUF+Enriched future performance is not fabricated.

## Map

- [ ] Projects appear using available geospatial data.
- [ ] Missing coordinates do not get fabricated.
- [ ] Filters work.
- [ ] Marker click opens project.

## Reports

- [ ] Project report includes model outputs.
- [ ] SHAP drivers included.
- [ ] warnings included.
- [ ] recommendations included.
- [ ] report clearly identifies prototype/demo status.

## UI

- [ ] Desktop responsive.
- [ ] Field/contractor mobile workflows usable.
- [ ] Loading states.
- [ ] Empty states.
- [ ] Error states.
- [ ] Accessible labels.
- [ ] No major console errors.

## Final end-to-end acceptance

This must work:

Login
→ project
→ prediction
→ explanation
→ warning
→ prescription
→ intervention
→ manager assignment
→ field update
→ contractor update
→ timeline
→ assistant
→ model lab.
