# Engineering Principles (agent rules)

Short, actionable form of engineering-principles.md (the full essay). Change both together.
Follow these unless the repo says otherwise.

1. One source of truth per fact (rule, limit, format). Reference it; don't restate it. Look-alike code encoding different facts is not duplication.
2. Docs and comments explain why, not what the code already says.
3. Keep components single-purpose and decoupled. No global state, no needless coupling.
4. Put vendors, frameworks, and volatile decisions behind a thin seam so they can be swapped.
5. Start with a thin end-to-end slice through every layer, then grow it. Tracer code is production code, not a throwaway prototype.
6. Validate inputs strictly at boundaries. Fail loudly on broken contracts; never silently fall back or limp on.
7. Promise little: narrow interfaces, minimal return guarantees.
8. Broken windows: fix them if inside the task scope; otherwise flag them to me, don't fix unasked.
9. Stop at good enough. Ask me where the quality bar is instead of gold-plating.
10. Stuck? Stop and ask before pushing harder: right problem? easier way? does it need doing at all?
