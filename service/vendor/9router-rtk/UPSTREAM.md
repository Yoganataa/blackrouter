# Vendored 9Router RTK

This directory contains upstream RTK JavaScript modules copied from `decolua/9router`.

- Upstream repository: https://github.com/decolua/9router
- Pinned upstream revision: `f39d8f07481ae8518e93175f0ecaaafa61573c6c`
- Upstream source directory: `open-sse/rtk/`
- License: MIT; see `LICENSE`.

## Source map

| Vendored path | Upstream path | Upstream blob SHA |
|---|---|---|
| `index.js` | `open-sse/rtk/index.js` | `b8488baa3190829d27ede2833b0cc8574ca7e81c` |
| `autodetect.js` | `open-sse/rtk/autodetect.js` | `81992034350f6f95c1a08708073dd2077903f77d` |
| `applyFilter.js` | `open-sse/rtk/applyFilter.js` | `9de34ac8aae08fe1bd584bad3729cd8500a67ab7` |
| `constants.js` | `open-sse/rtk/constants.js` | `a766342c32f774378d7c197e62c32bcd20acaeb8` |
| `filters/gitDiff.js` | `open-sse/rtk/filters/gitDiff.js` | `eaf8227bf28ca4a87483d309369c8a42153a1ba8` |
| `filters/gitStatus.js` | `open-sse/rtk/filters/gitStatus.js` | `3784d86c089e0a82fbeb3b22101c6152a4bb7049` |
| `filters/gitLog.js` | `open-sse/rtk/filters/gitLog.js` | `9769c6de8a237e01cc0452c965e8401b95a13283` |
| `filters/buildOutput.js` | `open-sse/rtk/filters/buildOutput.js` | `4d3dde91c853e8190624a4ca86c2330c0d3a4bb7` |
| `filters/grep.js` | `open-sse/rtk/filters/grep.js` | `2016688771b1c8f4c9f6503a8bcfd9fa4e1118c2` |
| `filters/find.js` | `open-sse/rtk/filters/find.js` | `4b64169bc6ebe98fc584ae17fd119e2f8ffb94a1` |
| `filters/tree.js` | `open-sse/rtk/filters/tree.js` | `f0222d17c785a76370cf8053381306275ae9c411` |
| `filters/ls.js` | `open-sse/rtk/filters/ls.js` | `d53927da5195bac756d3fea54fbcf2cf37b14aac` |
| `filters/searchList.js` | `open-sse/rtk/filters/searchList.js` | `4e18449b763e0ca5ed94c3d2d31093c70d2d9b2c` |
| `filters/readNumbered.js` | `open-sse/rtk/filters/readNumbered.js` | `8621059b6d79ab4ab502053bcdf417e22a04a23c` |
| `filters/dedupLog.js` | `open-sse/rtk/filters/dedupLog.js` | `f971c160402b11fc5be2497c7c479e3868afdf01` |
| `filters/smartTruncate.js` | `open-sse/rtk/filters/smartTruncate.js` | `f8e30870cb15da81732c9f7262e22db1d03168ba` |

## Compatibility boundary

`service/rtk.ts` is the BlackRouter compatibility facade. Keep adaptation there; do not edit the vendored filter implementation to fit OpenChamber. This allows later updates to replace these files from a selected 9Router commit and review upstream diffs file-by-file.

The checked-in runtime bundle `service/main.js` must be regenerated from source with `bun run build` after the facade is switched. Do not hand-edit that generated bundle as the source of truth.

## Update procedure

1. Select and record the next upstream commit SHA.
2. Compare the listed upstream files with this directory and preserve the source map.
3. Update `service/rtk.ts` only if the upstream exported interface changed.
4. Run `bun test`, `bun run type-check`, and `bun run build`; verify the built service bundle is committed.
