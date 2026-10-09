---
name: feedback-to-issue
description: Turn user feedback (a bug report, feature request or complaint from NOMAD users) into a GitHub issue with a short code-backed analysis and a proposed solution. Use whenever the user pastes or mentions user feedback and wants it analysed, triaged or filed as an issue, even if they only say "look at this feedback" or "turn this into an issue". The issue is always shown to the user for review before it is posted.
---

# Feedback to GitHub issue

Takes raw user feedback, finds out what it means in the code, and files a short, accurate issue. The analysis must be backed by the code, because the issue is read by maintainers who will act on it without re-investigating.

## 1. Get the feedback

If the feedback was not included in the request, ask for it (paste, file path, or existing issue/PR link). Do not guess at what it says.

## 2. Investigate

Users describe symptoms, not causes, and often propose a fix that is not the real gap. So find out:

- What the feature does today (route, controller, redux action, UI component, socket events). Use an Explore agent when the area is unfamiliar; read the key lines yourself before quoting them.
- Whether the backend and the UI agree. For permission requests, check the middleware (`auth`, `auth-admin`) and the frontend access-level checks separately; they often differ, which makes the fix smaller than it looks.
- Which repo owns the problem: `nomad-nmr/nomad-server` (REST API + front end) or `nomad-nmr/nomad-spect-client` (spectrometer PC). Spec: `SPEC.MD`.
- Existing tests that would need extending.

## 3. Settle scope with the user

If there is a real choice (e.g. grant one control or several, fix now or follow up), ask before drafting. The user's choices define the issue: leave out options they rejected. Do not include "optional follow-ups" they did not ask for.

Anything unrelated that you noticed on the way (a separate bug) does not go in the issue. Mention it in chat in one line instead.

## 4. Draft the issue

Keep it short. Use this structure:

```
**Title:** short, imperative, names the outcome

## User feedback
> verbatim quote
(one line of clarified intent from the user, if given)

## Analysis
- 2-4 bullets. Each states a fact with a file path (`path/to/file.js:line`).

## Proposed solution
- Concrete changes by file, including the tests to add and SPEC.md sections to update.
```

Write in plain, factual language. No hedging, no fluff, no long code snippets.

## 5. Show the draft and wait. Never post without approval

Save the body to a file in the scratchpad directory and print the full title and body in the reply. Ask the user to confirm or edit. The user always reviews and may adjust the issue before it goes to GitHub, so do not run `gh issue create` until they explicitly approve the current version. Apply any requested edits, show the updated draft again, and wait for approval again. Approval of an earlier version does not cover a changed one.

## 6. Create the issue

After explicit approval:

```bash
gh issue create --repo nomad-nmr/nomad-server --title "<title>" --body-file <scratchpad>/issue.md
```

Use `nomad-nmr/nomad-spect-client` if that is the owning repo. Add no labels unless asked. Reply with the issue URL and nothing else beyond any side-note from step 3.
