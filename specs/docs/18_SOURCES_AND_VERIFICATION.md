# Sources and verification record

Prepared and checked on 2026-09-27. Links may move; recheck implementation-specific APIs and versions before use. These sources support technical practices and algorithm foundations. The detailed game design, thresholds, layouts, milestones, and tuning values are original project proposals, not claims made by these sources.

## Agent workflow and browser engineering

| ID | Primary source | Used for |
|---|---|---|
| S01 | [OpenAI: AGENTS.md instructions](https://developers.openai.com/codex/guides/agents-md) | Repository instructions and explicit context discovery. The page redirected to the official ChatGPT Learn documentation; concise root instructions plus linked task documents avoid loading the whole pack. |
| S02 | [OpenAI: Iterating development workflows with Codex](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex) | Separating goals, plans, bounded implementation tasks, and verification evidence. |
| S03 | [OpenAI: Run long horizon tasks with Codex](https://developers.openai.com/blog/run-long-horizon-tasks-with-codex) | Durable project state and milestone verification. The described experiment is not a guarantee for this game. |
| S04 | [Phaser stable release](https://phaser.io/download/stable) | On the check date, redirected to Phaser 4.2.1, released July 9, 2026. Reconfirm version/API compatibility at implementation. |
| S05 | [Phaser scenes](https://docs.phaser.io/phaser/concepts/scenes) | Scene/lifecycle organization; use version-matching documentation for exact APIs. |
| S06 | [Vite static deployment](https://vite.dev/guide/static-deploy) | Build output, Pages deployment, and project base paths. |
| S07 | [Playwright best practices](https://playwright.dev/docs/best-practices) | User-visible tests, isolated state, role locators, and retrying assertions. |
| S08 | [MDN: Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) | Worker boundaries and message-based communication. |
| S09 | [MDN: Structured clone](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) | Cloneable data and limitations on functions/DOM/class behavior. |
| S10 | [MDN: Autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) | User-activation-aware audio and failure handling. |
| S11 | [MDN: Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) | Browser storage is limited and not guaranteed permanent. |
| S12 | [MDN: IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Asynchronous client-side structured storage and transactions. |
| S13 | [GitHub: What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) | Static hosting model. |
| S14 | [TensorFlow.js: Platform and environment](https://www.tensorflow.org/js/guide/platform_environment) | Backend differences, disposal, and the need to verify supported kernels. The guide contains older performance examples; none are used as present-day benchmarks here. |
| S15 | [TypeScript checkJs option](https://www.typescriptlang.org/tsconfig/checkJs.html) | Checking JavaScript source without requiring TypeScript application files. |
| S21 | [W3C WAI: WCAG overview](https://www.w3.org/WAI/standards-guidelines/wcag/) | Accessibility principles and testable requirements; no compliance certification is claimed. |
| S22 | [Vitest getting started](https://vitest.dev/guide/) | JavaScript unit/integration testing toolchain. |
| S23 | [GitHub: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use) | Least-privilege workflows and reviewed pinned action versions. |

## RL foundations

| ID | Primary source | Scope / limitation |
|---|---|---|
| S16 | [Gymnasium: Handling time limits](https://gymnasium.farama.org/tutorials/gymnasium_basics/handling_time_limits/) | Distinguishes task termination from external truncation, remaining-time observations, and bootstrapping. |
| S17 | [Sutton and Barto, Reinforcement Learning: An Introduction, second edition - MIT Press](https://mitpress.mit.edu/9780262039246/reinforcement-learning/) | Canonical bibliographic reference for tabular prediction/control, DP, traces, approximation, and planning. Publisher metadata was accessible; the full book was not fetched or page-verified in this preparation. Numerical contracts are explicitly specified in this pack and need implementation tests. |
| S18 | [OpenAI Spinning Up: Vanilla Policy Gradient](https://spinningup.openai.com/en/latest/algorithms/vpg.html) | On-policy action-probability learning, value baselines, discrete/continuous action support. Use conceptual equations, not its legacy TensorFlow API examples. |
| S19 | [Mnih et al., Human-level control through deep reinforcement learning, Nature (2015)](https://www.nature.com/articles/nature14236) | Primary DQN reference for action values, replay, and target-network stabilization. This project deliberately uses a much smaller environment/model. |
| S20 | [Ross, Gordon and Bagnell, AISTATS (2011)](https://proceedings.mlr.press/v15/ross11a.html) | Dataset aggregation/learner-induced state distributions. Selected human corrections are labeled DAgger-inspired, not a reproduction of all theoretical assumptions. |

## What was not verified

The actual course PDFs were not retrieved for slide-by-slide inspection. The supplied course page again returned no extractable content through the web reader. This pack relies on the accepted conversation outline for the eleven topic groups and mission story. No slide page references are fabricated.

The author-hosted textbook page timed out; only the publisher's bibliographic page is used above. No working application was built, no package combination installed, no graphics/audio generated, no learning experiment run, and no student playtest conducted while generating this documentation pack.

## How to update this record

Add date, exact URL/version, the claim checked, and actual result. A source that describes a capability does not prove this implementation uses it correctly. Record local tests separately. Never turn an unperformed verification into a positive result by copying language from documentation.
