# Engineering Principles

How I build software. Agents: follow these unless the repo says otherwise.

## 1. DRY (Don't Repeat Yourself)

- Each fact (a rule, limit, or format) lives in one place; code, docs, and config point to it instead of restating it.
- Code that merely looks alike but encodes different facts is not duplication.
- Docs explain *why*; they don't copy facts the code already defines.

## 2. Orthogonality

- Give each component one well-defined purpose; changing it shouldn't ripple into unrelated ones.
- Avoid global data and needless coupling.

## 3. Reversibility

- Keep vendors, frameworks, and volatile decisions behind a thin seam you can swap.
- Don't adopt a tool because it's fashionable.

## 4. Tracer Bullets

- Start with a thin, real slice through every layer, then grow it.
- Tracer code is kept: lean but complete production code, not a throwaway prototype.

## 5. Broken Windows Theory

- Inside the task scope, fix bad designs and poor code when you find them. No time to fix properly? Board it up: comment it out, mark it unimplemented, or stub it.
- Outside the task scope, flag it; don't fix it unasked.

## 6. Design by Contract

- State preconditions, postconditions, and invariants for each routine.
- Be strict in what you accept; promise as little as possible.
- Crash early: a broken contract stops the program; never silently fall back or limp on.

## 7. Good-Enough Software

- Ask where the quality bar is instead of guessing; ship early.
- Know when to stop: don't spoil a working program with overembellishment.

## 8. When a Problem Feels Hard

Stop and ask before pushing harder:

- Is there an easier way?
- Are you trying to solve the right problem, or have you been distracted by a peripheral technicality?
- Why is this thing a problem?
- What is it that's making it so hard to solve?
- Does it have to be done this way?
- Does it have to be done at all?
