# Engineering Principles

How I build software. Agents: follow these unless the repo says otherwise.
Based on *The Pragmatic Programmer*; quotes are its tips.

## 1. DRY (Don't Repeat Yourself)

Every piece of knowledge should have one authoritative representation.

- In practice: Each fact (a rule, limit, or format) lives in one place; code, docs, and config point to it instead of restating it. Code that merely looks alike but encodes different facts is not duplication. Docs explain *why*; they don't copy facts the code already defines.

## 2. Orthogonality

Keep components independent so changing one doesn't unnecessarily affect others.

- In practice: "Eliminate effects between unrelated things." Design self-contained components with a single, well-defined purpose, and avoid global data and needless coupling.

## 3. Reversibility

Avoid design decisions that are difficult to undo.

- In practice: "There are no final decisions." Requirements, vendors, and architectures change, so keep them behind abstractions you can swap. "Forgo following fads."

## 4. Tracer Bullets

Build a small, working end-to-end implementation to validate your direction early.

- In practice: "Use tracer bullets to find the target." Connect every layer with a thin, real slice and grow it. Unlike a prototype, tracer code is kept: it is lean but complete production code.

## 5. Broken Windows Theory

Fix small problems before they normalize poor software quality.

- In practice: "Don't live with broken windows." Fix bad designs, wrong decisions, and poor code as soon as you find them. If there's no time to fix it properly, board it up: comment it out, mark it unimplemented, or stub it, so the damage can't spread.

## 6. Design by Contract

Define explicit expectations, guarantees, and invariants for software components.

- In practice: Specify preconditions, postconditions, and invariants for each routine. Be strict in what you accept and promise as little as possible. "Crash early": a broken contract should stop the program, not limp on.

## 7. Good-Enough Software

Balance quality, time, and actual user needs rather than pursuing perfection.

- In practice: "Make quality a requirements issue." Let users decide how good is good enough, ship early, and know when to stop: don't spoil a working program with overembellishment.

## 8. When a Problem Feels Hard

Stop and ask before pushing harder:

- Is there an easier way?
- Are you trying to solve the right problem, or have you been distracted by a peripheral technicality?
- Why is this thing a problem?
- What is it that's making it so hard to solve?
- Does it have to be done this way?
- Does it have to be done at all?
