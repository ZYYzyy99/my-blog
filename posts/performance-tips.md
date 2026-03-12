# Frontend Performance Tips I Reuse

Small, repeatable optimizations usually beat one big rewrite.

## 1. Keep network payloads small

- Compress images.
- Avoid shipping huge libraries for tiny use cases.
- Cache static assets aggressively.

## 2. Render less on first paint

Only show what users need above the fold. Defer non-critical widgets.

## 3. Prevent layout shift

Reserve image dimensions and avoid injecting large content before metadata loads.

## 4. Watch interaction latency

Use browser devtools to inspect long tasks and expensive event handlers.

```js
// Example: split expensive work to keep UI responsive.
requestIdleCallback(() => {
  // non-critical computation
});
```

## Final note

Measure before and after each change. Performance work is easier when changes are tied to metrics.
