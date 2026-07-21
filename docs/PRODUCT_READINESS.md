# Product readiness

Updated: 2026-07-21

## Current assessment

`libreria-storytell` is a technical release candidate suitable for a serious
demo or internal pilot. It is not yet approved for a public production launch.

## Completed foundation

- Canonical quality metadata for 164 chapters: 82 explicitly approved
  pixel-perfect, 79 tier-B, and 3 unverified.
- Explicit data contracts and semantic regression coverage for the corrected
  renderers; CSV missingness and HTTP failures are handled explicitly.
- Latest-render gating and visible error handling for asynchronous scenes.
- Mobile layout regressions at 344 px for the charts corrected in this review.
- Data catalog, large-file policy, license, third-party notices, and CI checks.
- Scaffold and mirror operations preserve local work unless destructive flags
  are passed explicitly.

## Reproducible evidence

Last verified on 2026-07-21:

```bash
npm test                                      # 36/36
python3 -B scripts/sync_quality.py --check   # 164, no drift
python3 -B scripts/check-data-governance.py  # 30 collections; 6 large files
```

The semantic suite executes every corrected scene branch with its bundled CSV
and includes responsive assertions. This is not a substitute for visual QA in
a real browser.

## Open release gates

1. Rotate the credential identified in the companion data repository and
   decide how to sanitize its Git history. This was intentionally excluded
   from the current implementation.
2. Complete real-browser QA at desktop, tablet, and mobile sizes, including
   keyboard navigation, focus visibility, landmarks, contrast, zoom, reduced
   motion, loading, empty, and error states. Save screenshots and findings.
3. Run CI from clean clones and deploy a reproducible staging environment.
4. Add production observability: client errors, availability, performance
   budgets, and alert ownership.
5. Complete editorial/source review for catalog entries still marked unknown
   and record the final storage decision before any Git LFS migration.

Production readiness requires every gate above to have an owner, evidence, and
an explicit sign-off. Passing unit and HTTP tests alone does not grant that
status.
