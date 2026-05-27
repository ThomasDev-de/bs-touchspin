# Changelog

All notable changes to this project will be documented in this file.

## 1.0.5 - 2026-05-27

- Added a robust initialization guard to prevent `bsTouchspin` from being initialized twice on the same input element.
- Extended initialization checks to include existing plugin data and existing TouchSpin wrapper markup.
- Ensured `destroy` cleanup also removes the internal initialization marker for safe re-initialization.
