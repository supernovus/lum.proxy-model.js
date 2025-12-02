# lum.proxy-model.js

A base class for creating data models that use a Proxy to
handle conversion of data to and from its serialized format,
as well as offering observable-like events that can watch
for changes to the data.

## NOTE: Major overhaul (`v2.0`) planned!

The current version has some convoluted cruft in it and needs an overhaul!
Version 2.0 of this will at the very least:

- Split the MongoDB Extended JSON converters into a standalone package.
- Finish the new model (`lib/newmodel`), and make it the new default.
- Turn the original model into a wrapper around the new model.
  - Maybe split it into its own standalone package as well.
- Add better documentation.
- Add tests!

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.proxy-model.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/proxy-model)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)

---

[@lumjs/mongo-utils]: https://github.com/supernovus/lum.mongo-utils.js
[@lumjs/simple-data]: https://github.com/supernovus/lum.simple-data.js

