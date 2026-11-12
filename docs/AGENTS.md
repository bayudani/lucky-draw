# Agent Instructions

## Project Context

Build a single-device event lucky draw web application for 10 sessions.
Total participant estimate: 175. Participants are entered per session in
batches; all names must be visible before drawing. Each session produces
exactly one winner.

## Read First

Before modifying code, read: 1. `PRD.md` 2. `DESIGN.md` 3.
`ARCHITECTURE.md` 4. `TASKS.md`

## Non-negotiable Decisions

-   Stack: React + Vite + TypeScript.
-   Styling: Tailwind CSS.
-   Animation: Framer Motion.
-   Icons: Lucide React.
-   Random winner selection: Web Crypto API with unbiased integer
    selection.
-   Persistence: LocalStorage with versioned key and JSON
    backup/restore.
-   Deployment target: Vercel/static hosting.
-   No backend and no database for MVP.
-   Landscape desktop/projector is the primary layout.
-   10 sessions, one winner per session.
-   Default maximum participants per session: 30; keep configurable.
-   Show all participants before enabling Spin.

## Business Rules Not Yet Confirmed

-   Whether a participant/winner may appear in multiple sessions is not
    confirmed.
-   Default `globalUniqueWinners` to `false`; do not silently enforce
    global uniqueness.
-   Total 175 is an estimate/information from the event organizer, not a
    requirement that every session have equal participants.
-   Assume one draw per session unless product owner changes the
    requirement.

## Implementation Rules

-   Keep business logic out of presentation components.
-   Use typed models and small, testable utility functions.
-   Do not use `Math.random()` to select the actual winner.
-   Choose the winner once, then animate toward that chosen result.
-   Lock the Spin action while drawing.
-   Persist the completed winner immediately.
-   Never allow accidental re-spin of a completed session.
-   Reset requires explicit confirmation.
-   Validate imported JSON before replacing current state.
-   Avoid unnecessary dependencies and overengineering.
-   Do not add authentication, API routes, database, or admin panel.
-   Do not invent event branding, event name, or participant data.

## Required Verification

Before reporting completion: 1. Run the production build. 2. Test empty
session. 3. Test session with one participant. 4. Test maximum 30
participants. 5. Test duplicate/blank names. 6. Test double-click
prevention. 7. Refresh after participant input. 8. Refresh after winner
reveal. 9. Verify completed session cannot be spun again. 10. Test JSON
export/import.

If time is limited, prioritize a correct, stable draw flow over
decorative effects.

## Final Handoff Format

Report: - Features implemented. - Important files created/changed. -
Commands run and whether build passed. - Manual tests performed. -
Deployment URL (only if actually deployed). - Known limitations and
unresolved business decisions.
