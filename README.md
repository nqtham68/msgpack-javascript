# MessagePack for JavaScript/ECMA-262

[![npm version](https://img.shields.io/npm/v/@msgpack/msgpack.svg)](https://www.npmjs.com/package/@msgpack/msgpack) [![Build Status](https://travis-ci.org/msgpack/msgpack-javascript.svg?branch=master)](https://travis-ci.org/msgpack/msgpack-javascript) [![codecov](https://codecov.io/gh/msgpack/msgpack-javascript/branch/master/graphs/badge.svg)](https://codecov.io/gh/msgpack/msgpack-javascript) [![bundlephobia](https://badgen.net/bundlephobia/minzip/@msgpack/msgpack)](https://bundlephobia.com/result?p=@msgpack/msgpack)

[![Browser Matrix powered by Sauce Labs](https://saucelabs.com/browser-matrix/gfx2019.svg)](https://saucelabs.com)

This is a JavaScript/ECMA-262 implementation of **MessagePack**, an efficient binary serilization format:

https://msgpack.org/

This library is a universal JavaScript, which suppors both browsers and NodeJS. In addition, because it is implemented in [TypeScript](https://www.typescriptlang.org/), type definition files (`d.ts`) are bundled in the distribution.

*Note that this is the second version of MessagePack for JavaScript. The first version, which was implemented in ES5 and was never released to npmjs.com, is tagged as [classic](https://github.com/msgpack/msgpack-javascript/tree/classic).*

## Synopsis

```typescript
import { deepStrictEqual } from "assert";
import { encode, decode } from "@msgpack/msgpack";

const object = {
  nil: null,
  integer: 1,
  float: Math.PI,
  string: "Hello, world!",
  binary: Uint8Array.from([1, 2, 3]),
  array: [10, 20, 30],
  map: { foo: "bar" },
  timestampExt: new Date(),
};

const encoded: Uint8Array = encode(object);

deepStrictEqual(decode(encoded), object);
```

## Table of Contents

<!-- TOC depthFrom:2 anchorMode:github.com -->

- [Synopsis](#synopsis)
- [Table of Contents](#table-of-contents)
- [Install](#install)
- [API](#api)
  - [`encode(data: unknown, options?: EncodeOptions): Uint8Array`](#encodedata-unknown-options-encodeoptions-uint8array)
    - [`EncodeOptions`](#encodeoptions)
  - [`decode(buffer: ArrayLike<number>, options?: DecodeOptions): unknown`](#decodebuffer-arraylikenumber-options-decodeoptions-unknown)
    - [`DecodeOptions`](#decodeoptions)
  - [`decodeAsync(stream: AsyncIterable<ArrayLike<number>> | ReadableStream<ArrayLike<number>>, options?: DecodeAsyncOptions): Promise<unknown>`](#decodeasyncstream-asynciterablearraylikenumber--readablestreamarraylikenumber-options-decodeasyncoptions-promiseunknown)
  - [`decodeArrayStream(stream: AsyncIterable<ArrayLike<number>> | ReadableStream<ArrayLike<number>>, options?: DecodeAsyncOptions): AsyncIterable<unknown>`](#decodearraystreamstream-asynciterablearraylikenumber--readablestreamarraylikenumber-options-decodeasyncoptions-asynciterableunknown)
  - [`decodeStream(stream: AsyncIterable<ArrayLike<number>> | ReadableStream<ArrayLike<number>>, options?: DecodeAsyncOptions): AsyncIterable<unknown>`](#decodestreamstream-asynciterablearraylikenumber--readablestreamarraylikenumber-options-decodeasyncoptions-asynciterableunknown)
  - [Extension Types](#extension-types)
    - [Handling BigInt with ExtensionCodec](#handling-bigint-with-extensioncodec)
    - [The temporal module as timestamp extensions](#the-temporal-module-as-timestamp-extensions)
- [MessagePack Specification](#messagepack-specification)
  - [MessagePack Mapping Table](#messagepack-mapping-table)
- [Prerequsites](#prerequsites)
  - [ECMA-262](#ecma-262)
  - [NodeJS](#nodejs)
- [Benchmark](#benchmark)
- [Distribution](#distribution)
  - [NPM / npmjs.com](#npm--npmjscom)
  - [CDN / unpkg.com](#cdn--unpkgcom)
- [Maintenance](#maintenance)
  - [Testing](#testing)
  - [Continuous Integration](#continuous-integration)
  - [Release Engineering](#release-engineering)
  - [Updating Dependencies](#updating-dependencies)
- [Big Thanks](#big-thanks)
- [License](#license)

<!-- /TOC -->

## Install

This library is publised as [@msgpack/msgpack](https://www.npmjs.com/package/@msgpack/msgpack) in npmjs.com.

```shell
npm install @msgpack/msgpack
```

## API

### `encode(data: unknown, options?: EncodeOptions): Uint8Array`

It encodes `data` and returns a byte array as `Uint8Array`, throwing errors if `data` is, or includes, a non-serializable object such as a `function` or a `symbol`.

for example:

```typescript
import { encode } from "@msgpack/msgpack";

const encoded: Uint8Array = encode({ foo: "bar" });
console.log(encoded);
```

#### `EncodeOptions`

Name|Type|Default
----|----|----
extensionCodec | ExtensionCodec | `ExtensinCodec.defaultCodec`
maxDepth | number | `100`
initialBufferSize | number | `2048`
sortKeys | boolean | false

### `decode(buffer: ArrayLike<number>, options?: DecodeOptions): unknown`

It decodes `buffer` encoded as MessagePack, and returns a decoded object as `uknown`.

`buffer` must be an array of bytes, which is typically `Uint8Array`.

for example:

```typescript
import { encode } from "@msgpack/msgpack";

const encoded: Uint8Array;
const object = decode(encoded);
console.log(object);
```

#### `DecodeOptions`

Name|Type|Default
----|----|----
extensionCodec | ExtensionCodec | `ExtensinCodec.defaultCodec`
maxStrLength | number | `4_294_967_295` (UINT32_MAX)
maxBinLength | number | `4_294_967_295` (UINT32_MAX)
maxArrayLength | number | `4_294_967_295` (UINT32_MAX)
maxMapLength | number | `4_294_967_295` (UINT32_MAX)
maxExtLength | number | `4_294_967_295` (UINT32_MAX)

You can use `max${Type}Length` to limit the length of each type decoded.

### `decodeAsync(stream: AsyncIterable<ArrayLike<number>> | ReadableStream<ArrayLike<number>>, options?: DecodeAsyncOptions): Promise<unknown>`

It decodes `stream` in an async iterable of byte arrays, and returns decoded object as `uknown` type, wrapped in `Promise`. This function works asyncronously.

`DecodeAsyncOptions` is the same as `DecodeOptions` for `decode()`.

This function is designed to work with whatwg `fetch()` like this:

```typescript
import { decodeAsync } from "@msgpack/msgpack";

const MSGPACK_TYPE = "application/x-msgpack";

const response = await fetch(url);
const contentType = response.headers.get("Content-Type");
if (contentType && contentType.startsWith(MSGPACK_TYPE) && response.body != null) {
  const object = await decodeAsync(response.body);
  // do something with object
} else { /* handle errors */ }
```

### `decodeArrayStream(stream: AsyncIterable<ArrayLike<number>> | ReadableStream<ArrayLike<number>>, options?: DecodeAsyncOptions): AsyncIterable<unknown>`

It is alike to `decodeAsync()`, but only accepts an array of items as the input `stream`, and emits the decoded item one by one.

It throws errors when the input is not an array-family.

for example:

```typescript
import { encode } from "@msgpack/msgpack";

const stream: AsyncIterator<Uint8Array>;

// in an async function:
for await (const item of decodeArrayStream(stream)) {
  console.log(item);
}
```


### `decodeStream(stream: AsyncIterable<ArrayLike<number>> | ReadableStream<ArrayLike<number>>, options?: DecodeAsyncOptions): AsyncIterable<unknown>`

It is alike to `decodeAsync()` and `decodeArrayStream()`, but the input `stream` consists of independent MessagePack items.

In other words, it decodes an unlimited stream and emits an item one by one.

for example:

```typescript
import { encode } from "@msgpack/msgpack";

const stream: AsyncIterator<Uint8Array>;

// in an async function:
for await (const item of decodeArrayStream(stream)) {
  console.log(item);
}
```

### Extension Types

To handle [MessagePack Extension Types](https://github.com/msgpack/msgpack/blob/master/spec.md#extension-types), this library provides `ExtensionCodec` class.

Here is an example to setup custom extension types that handles `Map` and `Set` classes in TypeScript:

```typescript
import { encode, decode, ExtensionCodec } from "@msgpack/msgpack";

const extensionCodec = new ExtensionCodec();

// Set<T>
const SET_EXT_TYPE = 0 // Any in 0-127
extensionCodec.register({
  type: SET_EXT_TYPE,
  encode: (object: unknown): Uint8Array | null => {
    if (object instanceof Set) {
      return encode([...object]);
    } else {
      return null;
    }
  },
  decode: (data: Uint8Array) => {
    const array = decode(data) as Array<unknown>;
    return new Set(array);
  },
});

// Map<T>
const MAP_EXT_TYPE = 1; // Any in 0-127
extensionCodec.register({
  type: 1,
  encode: (object: unknown): Uint8Array => {
    if (object instanceof Map) {
      return encode([...object]);
    } else {
      return null;
    }
  },
  decode: (data: Uint8Array) => {
    const array = decode(data) as Array<[unknown, unknown]>;
    return new Map(array);
  },
});

// and later
import { encode, decode } from "@msgpack/msgpack";

const encoded = = encode([new Set<any>(), new Map<any, any>()], { extensionCodec });
const decoded = decode(encoded, { extensionCodec });
```

Not that extension types for custom objects must be `[0, 127]`, while `[-1, -128]` is reserved for MessagePack itself.

#### Handling BigInt with ExtensionCodec

This library does not handle BigInt by default, but you can handle it with `ExtensionCodec` like this:

```typescript
import { deepStrictEqual } from "assert";
import { encode, decode, ExtensionCodec } from "@msgpack/msgpack";

const BIGINT_EXT_TYPE = 0; // Any in 0-127
const extensionCodec = new ExtensionCodec();
extensionCodec.register({
  type: BIGINT_EXT_TYPE,
  encode: (input: unknown) => {
    if (typeof input === "bigint") {
      return encode(input.toString());
    } else {
      return null;
    }
  },
  decode: (data: Uint8Array) => {
    return BigInt(decode(data));
  },
});

const value = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1);
const encoded: = encode(value, { extensionCodec });
deepStrictEqual(decode(encoded, { extensionCodec }), value);
```

#### The temporal module as timestamp extensions

There is a proposal for a new date/time representations in JavaScript:

* https://github.com/tc39/proposal-temporal

This library maps `Date` to the MessagePack timestamp extension by default, but you can re-map the temporal module (or [@std-proposal/temporal ponyfill](https://github.com/std-proposal/temporal)) to the timestamp extension like this:

```typescript
import { Instant } from "@std-proposal/temporal";
import { deepStrictEqual } from "assert";
import {
  encode,
  decode,
  ExtensionCodec,
  EXT_TIMESTAMP,
  encodeTimeSpecToTimestamp,
  decodeTimestampToTimeSpec,
} from "@msgpack/msgpack";

const extensionCodec = new ExtensionCodec();
extensionCodec.register({
  type: EXT_TIMESTAMP, // override the default behavior!
  encode: (input: any) => {
    if (input instanceof Instant) {
      const sec = input.seconds;
      const nsec = Number(input.nanoseconds - BigInt(sec) * BigInt(1e9));
      return encodeTimeSpecToTimestamp({ sec, nsec });
    } else {
      return null;
    }
  },
  decode: (data: Uint8Array) => {
    const timeSpec = decodeTimestampToTimeSpec(data);
    const sec = BigInt(timeSpec.sec);
    const nsec = BigInt(timeSpec.nsec);
    return Instant.fromEpochNanoseconds(sec * BigInt(1e9) + nsec);
  },
});

const instant = Instant.fromEpochMilliseconds(Date.now());
const encoded = encode(instant, { extensionCodec });
const decoded = decode(encoded, { extensionCodec });
deepStrictEqual(decoded, instant);
```

This will be default once the temporal module is standardizied, which is not a near-future, though.

## MessagePack Specification

This library is compatible with the "August 2017" revision of MessagePack specification at the point where timestamp ext was added:

* [x] str/bin separation, added on August 2013
* [x] extension types, added on August 2013
* [x] timestamp ext type, added on August 2017

The livinng specification is here:

https://github.com/msgpack/msgpack

Note that as of June 2019 there're no versions on the MessagePack specification. See https://github.com/msgpack/msgpack/issues/195 for the discussions.

### MessagePack Mapping Table

The following table shows how JavaScript values are mapped to [MessagePack formats](https://github.com/msgpack/msgpack/blob/master/spec.md) and vice versa.

Source Value|MessagePack Format|Value Decoded
----|----|----
null, undefined|nil|null (*1)
boolean (true, false)|bool family|boolean (true, false)
number (53-bit int)|int family|number (53-bit int)
number (64-bit float)|float family|number (64-bit float)
string|str family|string
ArrayBufferView |bin family|Uint8Array (*2)
Array|array family|Array
Object|map family|Object (*3)
Date|timestamp ext family|Date (*4)

* *1 Both `null` and `undefined` are mapped to `nil` (`0xC0`) type, and are decoded into `null`
* *2 Any `ArrayBufferView`s including NodeJS's `Buffer` are mapped to `bin` family, and are decoded into `Uint8Array`
* *3 In handling `Object`, it is regarded as `Record<string, unknown>` in terms of TypeScript
* *4 MessagePack timestamps may have nanoseconds, which will lost when it is decoded into JavaScript `Date`. This behavior can be overrided by registering `-1` for the extension codec.

## Prerequsites

This is a universal JavaScript library that supports major browsers and NodeJS.

### ECMA-262

* ES5 language features
* ES2018 standard library, including:
  * Typed arrays (ES2015)
  * Async iterations (ES2018)
  * Features added in ES2015-ES2018

ES2018 standard library used in this library can be polyfilled with [core-js](https://github.com/zloirock/core-js).

If you support IE11, import `core-js` in your application entrypoints, as this library does in testing for browsers .
### NodeJS

NodeJS v10 is required, but NodeJS v12 or later is recommended because it includes the V8 feature of [Improving DataView performance in V8](https://v8.dev/blog/dataview).

NodeJS before v10 will work by importing `@msgpack/msgpack/dist.es5/msgpack`.

## Benchmark

Benchmark on NodeJS/v12.3.1

operation                                                         |   op   |   ms  |  op/s
----------------------------------------------------------------- | ------: | ----: | ------:
buf = Buffer.from(JSON.stringify(obj));                           |  497600 |  5000 |   99520
buf = JSON.stringify(obj);                                        |  969500 |  5000 |  193900
obj = JSON.parse(buf);                                            |  345300 |  5000 |   69060
buf = require("msgpack-lite").encode(obj);                        |  369100 |  5000 |   73820
obj = require("msgpack-lite").decode(buf);                        |  278900 |  5000 |   55780
buf = require("@msgpack/msgpack").encode(obj);                    |  556900 |  5000 |  111380
obj = require("@msgpack/msgpack").decode(buf);                    |  502200 |  5000 |  100440

Note that `Buffer.from()` for `JSON.stringify()` is added to emulate I/O where a JavaScript string must be converted into a byte array encoded in UTF-8, whereas MessagePack's `encode()` returns a byte array.

## Distribution

### NPM / npmjs.com

The NPM package distributed in npmjs.com includes both ES2015+ and ES5 files:

* `dist/` is compiled into ES2015+
* `dist.es5/` is compiled into ES5 and bundled to singile file
  * `dist.es5/msgpack.min.js` - the default, minified file (UMD)
  * `dist.es5/msgpack.js` - an optional, non-minified file (UMD)

If you use NodeJS and/or webpack, their module resolvers use the suitable one automatically.

### CDN / unpkg.com

This library is availble via CDN:

```html
<script crossorigin src="https://unpkg.com/@msgpack/msgpack"></script>
```

It loads `MessagePack` module to the global object.

## Maintenance

### Testing

For simple testing:

```
npm run test
```

### Continuous Integration

This library uses Travis CI.

test matrix:

* WebAssembly availability
  * `WASM=force` / `WASM=never`
* TypeScript targets
  * `target=es2019` / `target=es5`
* JavaScript engines
  * NodeJS, borwsers (Chrome, Firefox, Safari, IE11, and so on)

See [test:* in package.json](./package.json) and [.travis.yml](./.travis.yml) for details.

### Release Engineering

```console
# run tests on NodeJS, Chrome, and Firefox
make test-all

# edit the changelog
code CHANGELOG.md

# bump version
npm version patch|minor|major

# run the publishing task
make publish
```

### Updating Dependencies

```console
npm run update-dependencies
```

## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by Sauce Labs.

<a href="https://saucelabs.com"><img src="./assets/SauceLabs.svg" alt="Sauce Labs" width="280"></a>

## License

Copyright 2019 The MessagePack community.

This software uses the ISC license:

https://opensource.org/licenses/ISC

See [LICENSE](./LICENSE) for details.
