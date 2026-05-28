# Changelog

All notable changes to this project will be documented in this file.

## 1.0.6 - 2026-05-28

- Fixed method argument forwarding for multi-element jQuery selections (for example `.bsTouchspin('val', 10)` now applies correctly to each matched input).
- Fixed custom formatter rendering so formatter functions now render their return value in the formatted view.
- Added instance option `currency` (default `EUR`) and updated currency formatting to use the configured code instead of a hardcoded value.
- Improved `destroy` cleanup by restoring original `disabled` and `readonly` states in addition to class/type/style.
- Updated README documentation for full public API coverage: methods (`val`, `setPrefix`, `setPostfix`, `destroy`), event payloads, global API helpers, formatter signature, and `currency` option.
- Corrected README notes for option precedence (`step`, `min`, `max` input attributes) and clarified `inputMinWidth` behavior.

## 1.0.5 - 2026-05-27

- Added a robust initialization guard to prevent `bsTouchspin` from being initialized twice on the same input element.
- Extended initialization checks to include existing plugin data and existing TouchSpin wrapper markup.
- Ensured `destroy` cleanup also removes the internal initialization marker for safe re-initialization.
