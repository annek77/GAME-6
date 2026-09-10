# Pool of Experts

A serious game about hiring bias, for the course **Web Experiences for the
Digital Humanities**. Runs fully offline on GitHub Pages — no backend, no AI.

## The flow (v2 — pressure, no AI assistant)

1. **You decide** — hand-pick a 10-person jury from the full pool. Criterion
   chips let you "check" how each candidate scores; the game mirrors back what
   you emphasised.
2. **The real call** — the City opens the official public call. Applicants come
   in **one at a time** (Invite / Reserve / Reject), the field is skewed ~80/20
   male, there's a **deadline**, and you can **extend** the call — at the cost of
   weeks of delay. A **quota reminder** notes the 50/50 target and that the skew
   is structural, not your fault.
3. **The pool** — your invited jury fills the prepared 5+5 stations. Overflow and
   empty seats make the imbalance (and any delay) visible.
4. **What happened** — a verdict on the jury you built, the real Austrian numbers,
   and a reflection. Framing throughout: the problem is the structure, not you.

The earlier "AI assistant that scales your bias" mechanic was removed; the
pressure mechanics (applications, deadline, extensions, quota warning) replace it.

## Files

```
index.html   structure + all CSS
game.js       state machine: hand-pick → applications → reveal → outro
data.js       26 architect profiles (6 women / 20 men) + criterion signals + Vienna emails
assets/       pixel sprites (single_female.png, single_male.png)
```

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Publish on GitHub Pages

Push to a repo → Settings → Pages → Deploy from branch `main`, folder `/root`.

## Known design decisions / still open

- **6 women / 20 men pool** and the **~80/20 applicant field** are intentional —
  they mirror the real pipeline.
- **Verdict is based on your final invited jury**, framed around structure (the
  thin field + deadline pressure), not personal blame.
- **Criterion chips are kept** from the earlier version (they're good and on-brand),
  but no longer feed an AI — they just mirror what you looked at.
- **Profiles still need an audit** before a final build: equal length, matched
  seniority, signals set deliberately. Current signal values are a first pass.
- **Austrian figures need a real source** before publishing.
- woman/man are simplified analytical categories, stated at the end — not a claim
  that gender is binary.

## Ideas for a next version

- A drawn pool backdrop (tiles, water, lifeguard chair) behind the stations —
  biggest visual upgrade; see the handover doc.
- More sprite variants so 10+ figures don't look cloned; make the "swimwear"
  metaphor visually explicit.
- A real Vienna-style crest icon (currently a CSS placeholder).
- Small pixel icons for the four criteria.
