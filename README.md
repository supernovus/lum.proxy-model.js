# lum.proxy-model.js

A base class for creating data models that use a Proxy to
handle conversion of data to and from its serialized format,
as well as offering observable-like events that can watch
for changes to the data.

Comes with a couple pre-defined type converters for data
serialized from MongoDB into its Extended JSON (v2) format.

It's not perfect by any stretch, nor is it complete, and it's 
entirely undocumented at the moment with no test suite. 
All things I plan to fix in the next release, I promise!

## Official URLs

This library can be found in two places:

 * [Github](https://github.com/supernovus/lum.proxy-model.js)
 * [NPM](https://www.npmjs.com/package/@lumjs/proxy-model)

## Author

Timothy Totten <2010@totten.ca>

## License

[MIT](https://spdx.org/licenses/MIT.html)
