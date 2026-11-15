# Plan — OCDA-P1

## Scope
- Reuse original ClusterOpt HTML/CSS without redesign.
- Build isolated LinkCore units and runtime registration.
- Make Language UI and Highlighter UI interactive for testing.

## Reference
- Source: xcxc84584-prog/ClusterOpt, v0.0.69.
- GitHub Pages static ES modules; no secrets or absolute paths.

## Load
- In-memory logs: O(number of events); tokenizer: O(visible text length).
- Current demo has no gigabyte-file guarantees.

## Known risks
- Original markup contains controls outside this patch's scope.
- CSS copied from upstream, pending visual regression test.
