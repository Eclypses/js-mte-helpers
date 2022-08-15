# MTE Helpers

The goal of this package is to make MTE as simple and easy to use as possible.

## Quick Start

Install the package:\
`npm i mte-helpers`

Using MTE happens in three stages:

1. Instantiate WASM
   - Requires License Key and License Company
2. Create and encoder and/or decoder
   - Assign a unique ID to each encoder, decoder
   - Instantiation values must match
3. Use the encoder or decoder
   - Select the encoder or decoder via it's unique ID

```js
import {
  instantiateMteWasm,
  createEncoder,
  createDecoder,
  mteEncode,
  mteDecode,
} from "mte-helpers";

// 1. Instantiate MTE WASM
(async () => {
  await instantiateMteWasm({
    licenseKey: "abc-123",
    licenseCompany: "Demo CO, LLC",
  });

  // 2. create encoder and decoder with unique IDs
  await createMteEncoder({
    id: "my_encoder",
    entropy: new Uint8Array(32).fill(1),
    nonce: "9876543210",
    personalization: "some_personalization_str",
  });

  await createMteDecoder({
    id: "my_decoder",
    entropy: new Uint8Array(32).fill(1),
    nonce: "9876543210",
    personalization: "some_personalization_str",
  });

  // 3. Use encoder and decoder via their IDs
  const encoded = await mteEncode("Hello world!", { id: "my_encoder" });
  console.log("encoded: ", encoded);

  const decoded = await mteDecode(encoded, { id: "my_decoder" });
  console.log("decoded: ", decoded);
})();
```

## API Reference

### `instantiateMteWasm(options: InstantiateOptions): Promise<void>`

This function MUST be called once before invoking any other MTE methods. It instantiates the WASM module that powers MTE.

#### `options: InstantiateOptions`

| Key               | Type                   | Default        | Description                                                                                                                                 |
| ----------------- | ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `licenseKey`      | string                 | undefined      | **Required.** The license key issued to your instance of MTE.                                                                               |
| `licenseCompany`  | string                 | undefined      | **Required.** The name of the company this product was licensed to.                                                                         |
| `encoderType`     | `"MTE"\|"MKE"\|"FLEN"` | `"MTE"`        | The default encoder type to use during encode events.                                                                                       |
| `encoderOutput`   | `"B64"\|"Uint8Array"`  | `"B64"`        | The default output type of an encoder.                                                                                                      |
| `fixedLength`     | number                 | 0              | The default fixedLength value when using the MTE Fixed-Length addon.                                                                        |
| `decoderType`     | `"MTE"\|"MKE"`         | `"MTE"`        | The default decoder type to use during decode events.                                                                                       |
| `decoderOutput`   | `"str"\|"Uint8Array"`  | `"str"`        | The default output type of a decoder.                                                                                                       |
| `saveStateAs`     | `"B64"\|"Uint8Array"`  | `"Uint8Array"` | The default data type to use when saving MTE state.                                                                                         |
| `timestampWindow` | number                 | 0              | The default timestamp window a decoder would use. Required when using the timestamp verifier.                                               |
| `sequenceWindow`  | number                 | 0              | The default sequence window to use when decoding a payload. Requires the sequence window verifier.                                          |
| `passThrough`     | boolean                | false          | When true, encoders will not encode payloads, rather they will simply pass the original value through. Helpful in development environments. |
| `keepAlive`       | number(ms)             | 0              | The number of milliseconds to keep encoders and decoders alive before saving their state and destroying them.                               |

**Example**

```js
// minimal example
await instantiateMteWasm({
  licenseKey: "abc-123",
  licenseCompany: "Company Name, LLC",
});

// example with all options
await instantiateMteWasm({
  licenseKey: "abc-123",
  licenseCompany: "Company Name, LLC",
  passThrough: true,
  encoderType: "MTE",
  encoderOutput: "B64",
  fixedLength: 256,
  decoderType: "MTE",
  decoderOutput: "str",
  saveStateAs: "Uint8Array",
  timestampWindow: 0,
  sequenceWindow: 0,
  keepAlive: 0,
});
```

### `createMteEncoder(options: CreateEncoderOptions): Promise<void>;`

### `createMteDecoder(options: CreateDecoderOptions): Promise<void>;`

Creates an encoder or decoder with the given instantiation values and labels it with the given ID.

#### `options: CreateEncoderOptions | CreateDecoderOptions`

| Key             | Type                 | Default   | Description                                                                                                                      |
| --------------- | -------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| id              | any                  | undefined | **Required.** A unique ID to label this encoder/decoder with.                                                                    |
| personalization | string               | undefined | **Required.** A personalization string to use during instantiation.                                                              |
| nonce           | string               | undefined | **Required.** A nonce string to use during instantiation. Should be an integer string.                                           |
| entropy         | Uint8Array \| Object | undefined | **Required.** An entropy value to use during instantiation. Can be a byte array or an object with a value and encoding property. |

**Example**

```js
// create an encoder
await createMteEncoder({
  id: "unique_encoder_id",
  personalization: "some_personalization_string",
  nonce: "6457981320",
  entropy: new Uint8Array(32).fill(1),
});

// create a decoder
await createMteDecoder({
  id: "unique_decoder_id",
  personalization: "some_personalization_string",
  nonce: "6457981320",
  entropy: new Uint8Array(32).fill(1),
});
```

### `mteEncode(payload: String|Uint8Array, options: EncodeOptions): Promise<string|Uint8Array>`

Uses an encoder, identified by it's unique ID, to perform an encode operation.

#### `payload: String|Uint8Array`

A payload to encode; either a string or a Uint8Array.

#### `options: EncodeOptions`

| Key           | Type                   | Default        | Description                                                                                                                                                                                                        |
| ------------- | ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`          | any                    | undefined      | **Required.** The ID of the encoder to be used for this operation.                                                                                                                                                 |
| `type`        | `"MTE"\|"MKE"\|"FLEN"` | undefined      | The type of MTE encoder to use. If not defined, falls back to the value set in `instantiateMteWasm()`.                                                                                                             |
| `output`      | `"B64"\|"Uint8Array"`  | undefined      | The type of encoded value to return. If not defined, falls back to the value set in `instantiateMteWasm()`.                                                                                                        |
| `fixedLength` | number                 | undefined      | When using Fixed-Length, the length of the encoded value. If not defined, falls back to the value set in `instantiateMteWasm()`.                                                                                   |
| `saveStateAs` | `"B64"\|"Uint8Array"`  | `"Uint8Array"` | The data type to use when saving MTE state. If not defined, falls back to the value set in `instantiateMteWasm()`.                                                                                                 |
| `passThrough` | boolean                | false          | When true, encoders will not encode payloads, rather they will simply pass the original value through. Helpful in development environments. If not defined, falls back to the value set in `instantiateMteWasm()`. |
| `keepAlive`   | number(ms)             | 0              | The number of milliseconds to keep encoders and decoders alive before saving their state and destroying them. If not defined, falls back to the value set in `instantiateMteWasm()`.                               |

**Example**

```js
// example using default values
const encoded = await mteEncode("Hello world!", {id: "unique_encoder_id"});

// example overriding default settings
const encoded = await mteEncode("Hello World", {
  id: "unique_encoder_id",
  type: "MKE",
  output: "Uint8Array"
  passThrough: true,
  keepAlive: 2000,
  saveStateAs: 'B64'
})
```

### `mteDecode(payload: String|Uint8Array, options: DecodeOptions): Promise<string|Uint8Array>`

Uses a decoder, identified by it's unique ID, to perform a decode operation.

#### `payload: String|Uint8Array`

A payload to decode; either a string or a Uint8Array.

#### `options: DecodeOptions`

| Key           | Type                  | Default        | Description                                                                                                                                                                                                        |
| ------------- | --------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`          | any                   | undefined      | **Required.** The ID of the decoder to be used for this operation.                                                                                                                                                 |
| `type`        | `"MTE"\|"MKE"`        | undefined      | The type of MTE decoder to use. If not defined, falls back to the value set in `instantiateMteWasm()`.                                                                                                             |
| `output`      | `"B64"\|"Uint8Array"` | undefined      | The type of decoded value to return. If not defined, falls back to the value set in `instantiateMteWasm()`.                                                                                                        |
| `saveStateAs` | `"B64"\|"Uint8Array"` | `"Uint8Array"` | The data type to use when saving MTE state. If not defined, falls back to the value set in `instantiateMteWasm()`.                                                                                                 |
| `passThrough` | boolean               | false          | When true, decoders will not decode payloads, rather they will simply pass the original value through. Helpful in development environments. If not defined, falls back to the value set in `instantiateMteWasm()`. |
| `keepAlive`   | number(ms)            | 0              | The number of milliseconds to keep decoders and decoders alive before saving their state and destroying them. If not defined, falls back to the value set in `instantiateMteWasm()`.                               |

**Example**

```js
// example using default values
const decoded = await mteDecode(encodedPayload, {id: "unique_decoder_id"});

// example using all values
const decoded = await mteDecode(encodedPayload, {
  id: "unique_decoder_id",
  type: "MKE",
  output: "Uint8Array"
  passThrough: true,
  keepAlive: 2000,
  saveStateAs: 'B64'
})
```

## Core Concepts

---

- Instantiating MTE WASM
- Providing Sensible defaults, with overrides
- Encoding/Decoding
- Managing State
- Handles Error Checking (but not error handling)

Sections:
Quick Start section
Advanced

- Best Practices
- Core Functions
  Examples
- Elliptical Curve Diffie Helman
- Encode JSON
- Encode Files
  API Docs section
  Development section

Features:

TODO:

- [x] Pass-through mode, that does NOT encode/decode anything. Great for development.
- [ ] First-in, First-out queue for managing requests.
- [ ] MTE/MKE auto-switching, based on input size
- [ ] ECDH Helpers that are universal- Work in Browser and NodeJS, without dependencies
- [ ] Generate instantiation values (entropy public key, entropy secret function, nonce, personalization)
- [ ] Can I do more? If I detect a browser environment, can I set keepAlive true in the browser, and false in the server?
- [ ] Can I do more? Can I assign a default ID in a browser environment, so you don't need to provide an ID when using the encoder/decoder? IF an ID is not provided, can I create and return one? What's a performant ID creator in JS?

- What is the Web MTE Helper package?
  - It is a package with two modules:
    - Core Functions: A suite of common MTE functions that follow best practices, catch and throw errors, provide a typesafe API.
    - Managed MTE: A "batteries included" state management library that assigns each encoder/decoder a unique key, and exposes a simple API for accessing MTE functions. Supports in-memory management, and provides an storage-agnostic plugin API.
- Why make this package?
  - When using MTE, I almost always rewrite the same helpers with very little variation, often copying from project to project with no changes. I do this for both common MTE helper functions, and also for my MTE state management solution. It's tedious, and time consuming, and it's code that our clients don't need to write. I decided that I wanted to make a package where I could write useful, reusable logic, one time and then use it in any project.
- What are the Core function?
  - The Core Functions module contains a suite of functions that encapsulate a series of common MTE logic. For example, after decoding a message, checking the result status before using the result value - this logic is written every them, in every application. No more!
- What is the MAnaged MTE module?
  - The goal of the managed MTE module is to make MTE ass easy as possible to use. This includes:
    - Simple, minimal API
    - Secure Defaults
    - Follows best practices
    - Catch and throw errors appropriately
    - Provide state-management solution
    - State-management solution plug-in API
- Does every have to use this package?
  - No! MTE implementors always have the option to roll their own solution, and we have many detailed guides on how to do it. Although I hope this package can accomodate most web use cases.

```

```
