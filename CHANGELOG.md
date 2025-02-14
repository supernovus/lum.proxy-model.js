# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-02-13
### Added
- A bunch more options for more flexibility.
- Ability to easily set default options in sub-classes.
- Documentation for most things.
### Changed
- `this.options` is now a _copy_ of the options passed to
  the constructor, along with any default options.
- `this.options.self` will now be explicitly set to non-writable.
- `this.data` may be optionally assigned using a _descriptor_.
- The `options.self` property key is now reserved by default,
  and a property with that key will not be allowd in `this.data`.
  This behaviour may be changed by setting `options.selfMask`.
- The `this.metaOptions` if defined will now be processed _before_
  looking for known hooks to generate Proxy handler functions for.
- `this.metaOptions.list` in addition to being set as an `object` to be
  used as a property definition map, may also now be a `function` that
  may be used to generate and return the definition map dynamically.
- `this.metaOptions.overwrite` in addition to a `boolean` value indicating
  if meta-option properties can overwrite existing ones, may also be set
  as a `function` that will be passed the property name, and must return
  a boolean value indicating if we can overwrite that property.
- Properties added via `this.metaOptions` are now assigned using `def()`
  instead of direct assignment. A few side-effects of that change:
  - The option value may be assigned using a _descriptor_ object.
  - If the real value has `value`, `get`, or `set`, properties, you'll
    need to wrap it in a `{value: theRealValue}` descriptor.
  - The default descriptor rules used by `def()` include
    `{configurable: true}`, so the property will be non-writable,
    but still able to be re-configured later.
- In the previous version the `get` and `set` hooks would emit
  corresponding events, but none of the other default hooks did.
  That has been fixed, all default hooks now emit an event with
  the same name as the hook itself. I still need to document the
  event objects.
- The `@lumjs/proxy-model.VALUES` object is now frozen to make it
  more like a real set of _constants_. The `PROXY_HOOKS` constant
  inside it is also frozen.
- Moved the `META_PROPS` constant used by the `metaOptions` feature
  into the `VALUES` constant set so it's more easily accessed
  from outside code.
### Fixed
- The `PROXY_HOOKS` constant was missing `deleteProperty` even though
  we had a default implementation. Whoops!

## [1.1.0] - 2024-12-17
### Changed
- Tweaked a few settings in the model.
- I actually made these changes almost a month ago, but forgot to commit.

## [1.0.0] - 2024-11-20
### Added
- Initial release.

[Unreleased]: https://github.com/supernovus/lum.proxy-model.js/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/supernovus/lum.proxy-model.js/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/supernovus/lum.proxy-model.js/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/supernovus/lum.proxy-model.js/releases/tag/v1.0.0

