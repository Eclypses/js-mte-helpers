# MTE-Helpers "Managed" API Reference

The MTE-Helpers "Managed" module is the default export of the MTE-Helpers package, and it's goal is to make implementing MTE as easy as possible. It does this by reducing the API surface area to just five functions, and it takes complete control over MTE State management. For advanced use cases, consider using the MTE-Helpers "Core" package.

> Note: The MTE-Helpers package requires that a licensed version of the MTE library is supplied as a peer dependency in your project.

## Introduction

MTE-Helpers "Managed" module exports five functions that should be used/considered in three stages:

1. WASM Inititalization\
   `instantiateMteWasm(options)`\
   Call this one time, as early as possible, to instantiate the WASM module that powers MTE.

2. Create Encoders and/or Decoders\
   `createMteEncoder(encoderOptions)`\
   `createMteDecoder(decoderOptions)`\
   Call these functions to create new encoders and decoders. They must be created before they can be used. They must have unique IDs.

3. Encode and Decode Data\
   `mteEncode(payload, encodeOptions)`\
   `mteDecode(payload, decodeOptions)`\
   Encode or decode data, with an encoder or decoder by it's unique ID.

## API Reference

<hr/>

### `instantiateMteWasm(options: InitOptions): Promise<undefined>`

Call this function once, as early as possible, to instantiate the WASM module, and to set default settings.

Returns a promise that resolves with `undefined`, or throw an error.

**InitOptions**

- `licenseKey` **\*Required**\
  type: `string`\
  default: `undefined`\
  The license key issued to your company's licensed version of MTE.

- `licenseCompany` **\*Required**\
  type: `string`\
  default: `undefined`\
  The company name of that your version of MTE is licensed to.

- `encoderType`\
  type: `"MTE"|"FLEN"|"MKE"`\
  default: `"MTE"`\
  The default encoder type to use.

- `encoderOutput`\
  type: `"B64"|"Uint8Array"`\
  default: `"B64"`\
  The default output type to use for encode operations.

- `fixedLength`\
  type: `number`\
  default: `0`\
  The fixed-length to use for all Fixed-Length MTE encode operations.

- `decoderType`\
  type: `"MTE"|"MKE"`\
  default: `"MTE"`\
  The default decoder type to use.

- `decoderOutput`\
  type: `"str"|"Uint8Array"`\
  default: `"str"`\
  The default output type to use for decode operations.

- `timestampWindow`\
  type: `number` (milliseconds)\
  default: `0`\
  The window within which a message will be considered valid, when using the timestamp verifier addon.

- `sequenceWindow`\
  type: `number`\
  default: `0`\
  The sequence window within which a message will be considered valid, when using the sequence verifier addon.

- `saveStateAs`\
  type: `"B64"|"Uint8Array"`
  default: `"B64"`
  The data type to use when saving MTE State into cache.

- `saveState`\
  type: `(id: any; value: string|Uint8Array) => Promise<undefined>`\
  default: `undefined`\
  Provide your own setter function for storing MTE State in cache.

- `takeState`\
  type: `(id: any) => Promise<string|Uint8Array>`\
  default: `undefined`\
  Provide your own getter function for taking MTE state from cache.

- `passThrough`\
  type: `boolean`\
  default: `false`\
  When true, encoders and decoders simply pass-through their original payloads. Helpful in development.

- `keepAlive`\
  type: `number` (milliseconds)\
  default: `0`\
  The duration to keep an encoder or decoder alive, after which it's state is saved into cache and it is destroyed. Good for rapid encoder/decode operations, for example, when streaming or chunking data.

- `logMteState`\
  type: `boolean`\
  default: `false`\
  If true, MTE state will be logged to stdout after each operation; creation, encode/decode.

Example:

```js
instantiateMteWasm({
  licenseKey: "abc-123",
  licenseCompany: "Company Name, LLC",
  encoderType: "MTE",
  encoderOutput: "B64",
  fixedLength: 256,
  decoderType: "MTE",
  decoderOutput: "str",
  timestampWindow: 1000,
  sequenceWindow: -63,
  saveStateAs: "Uint8Array",
  saveState: (id, value) => redisClient.set(id, value),
  takeState: async (id) => {
    const value = await redisClient.get(id);
    await redisClient.delete(id);
    return value;
  },
  passThrough: true,
  keepAlive: 1000,
  logMteState: true,
})
  .then(() => {
    console.log(`MTE WASM instantiated!`);
  })
  .catch((err) => console.error(err));
```

<hr/>

### `createMteEncoder(options: EncoderOptions): Promise<undefined>`

Call this function to create an encoder, and label it with a unique ID.

Returns a promise the resolve `undefined`, or throws an error.

**EncoderOptions**

- `id` **\*Required**\
  type: `any`\
  default: `undefined`\
  A unique identifier that will be assigned to this encoder. Usually a string or a number.

- `personalization` **\*Required**\
  type: `string`\
  default: `undefined`\
  The personalization string to use during initialization of this encoder.

- `nonce` **\*Required**\
  type: `string` of integers\
  default: `undefined`\
  The nonce that will be used during initialization of this encoder.

- `entropy` **\*Required**\
  type: `object|Uint8Array`\
  default: `undefined`\
  An entropy value to use during initialization of this encoder. The value can be a Uint8Array or a string. If the entropy value is a string, then provide an object with a `value` and `encoding` property to describe the string as either `plaintext` or `Base64`.

- `logMteState`\
  type: `boolean`\
  default: `false`\
  If true, MTE state will be logged to stdout after creation.

```js
// entropy as Uint8Array
const entropyU8 = new Uint8Array(32).fill(1);

// entropy as random plaintext string
const entropyPlaintext = {
  encoding: "plaintext",
  value: "cn3DCpaI0xfaaLXCatRssCb55mrn83ut",
};

// entropy as a Base64 String
const entropyB64 = {
  encoding: "B64",
  value: "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==",
};

// create an encoder, registered with a unique ID
await createMteEncoder({
  id: "my-encoder-001",
  personalization: "b9096a46-e10e-4a9f-bfef-3c43b9092bac",
  nonce: "4053335578500636",
  entropy: {
    encoding: "plaintext",
    value: "fhO9s4kDACSUFt6TG88CqDBNE0DTcfOu",
  },
  logMteState: true,
});
```

<hr/>

### `createMteDecoder(options: DecoderOptions): Promise<undefined>`

Call this function to create a decoder, and label it with a unique ID.

Returns a promise the resolve `undefined`, or throws an error.

**DecoderOptions**

- `id` **\*Required**\
  type: `any`\
  default: `undefined`\
  A unique identifier that will be assigned to this decoder. Usually a string or a number.

- `personalization` **\*Required**\
  type: `string`\
  default: `undefined`\
  The personalization string to use during initialization of this decoder.

- `nonce` **\*Required**\
  type: `string` of integers\
  default: `undefined`\
  The nonce that will be used during initialization of this decoder.

- `entropy` **\*Required**\
  type: `object|Uint8Array`\
  default: `undefined`\
  An entropy value to use during initialization of this decoder. The value can be a Uint8Array or a string. If the entropy value is a string, then provide an object with a `value` and `encoding` property to describe the string as either `plaintext` or `Base64`.

- `logMteState`\
  type: `boolean`\
  default: `false`\
  If true, MTE state will be logged to stdout after creation.

```js
// entropy as Uint8Array
const entropyU8 = new Uint8Array(32).fill(1);

// entropy as random plaintext string
const entropyPlaintext = {
  encoding: "plaintext",
  value: "cn3DCpaI0xfaaLXCatRssCb55mrn83ut",
};

// entropy as a Base64 String
const entropyB64 = {
  encoding: "B64",
  value: "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==",
};

// create a decoder, registered with a unique ID
await createMteDecoder({
  id: "my-decoder-001",
  personalization: "b9096a46-e10e-4a9f-bfef-3c43b9092bac",
  nonce: "4053335578500636",
  entropy: {
    encoding: "plaintext",
    value: "fhO9s4kDACSUFt6TG88CqDBNE0DTcfOu",
  },
  logMteState: true,
});
```

<hr/>

### `mteEncode(payload: String|Uint8Array, options: EncodeOptions): Promise<String|Uint8Array>`

Call this function to MTE encode a payload.

Returns a promise that resolves with the encoded value, or throws an error.

**payload: String|Uint8Array**

A plaintext string (possibly JSON), or a Uint8Array to encode.

**EncodeOptions**

- `id` **\*Required**\
  type: `any`\
  default: `undefined`\
  The unique identifier assigned to the encoder you want to use. Usually a string or a number.

- `type`\
  type: `"MTE"|"FLEN"|"MKE"`\
  default: The value set in `instantiateMteWasm(options)`\
  The type of MTE encoder to use for this encode operation.

- `fixedLength`\
  type: `number`\
  default: The value set in `instantiateMteWasm(options)`\
  The fixed-length to use for this Fixed-Length MTE encode operations. Only applies to fixed-length encodes.

- `output`\
  type: `"Uint8Array"|"B64"`
  default: The value set in `instantiateMteWasm(options)`\
  The default output type to use for encode operations.

- `passThrough`\
  type: `boolean`\
  default: The value set in `instantiateMteWasm(options)`\
  When true, encoders and decoders simply pass-through their original payloads. Helpful in development.

- `keepAlive`\
  type: `number` (milliseconds)\
  default: The value set in `instantiateMteWasm(options)`\
  The duration to keep an encoder or decoder alive, after which it's state is saved into cache and it is destroyed. Good for rapid encoder/decode operations, for example, when streaming or chunking data.

- `logMteState`\
  type: `boolean`\
  default: `false`\
  If true, MTE state will be logged to stdout after this encode event.

```js
// encode using default options
const encoded = mteEncode("Hello World", { id: "my-encoder-001" });

// encode using custom options
const encoded = mteEncode("Hello world!", {
  id: "my-encoder-001",
  type: "MKE",
  output: "Uint8Array",
  passThrough: true,
  keepAlive: 1000,
  logMteState: true,
});
```

<hr/>

### `mteDecode(payload: String|Uint8Array, options: DecodeOptions): Promise<String|Uint8Array>`

Call this function to MTE decode a payload.

Returns a promise that resolves with the decoded value, or throws an error.

**payload: String|Uint8Array**

A Base64 encoded string, or a Uint8Array to decode.

**DecodeOptions**

- `id` **\*Required**\
  type: `any`\
  default: `undefined`\
  The unique identifier assigned to the decoder you want to use. Usually a string or a number.

- `type`\
  type: `"MTE"|"MKE"`\
  default: The value set in `instantiateMteWasm(options)`\
  The type of MTE decoder to use for this decode operation. Must match the type used to encode the payload.

- `output`\
  type: `"Uint8Array"|"B64"`
  default: The value set in `instantiateMteWasm(options)`\
  The default output type to use for decode operations.

- `timestampWindow`\
  type: `number` (milliseconds)\
  default: The value set in `instantiateMteWasm(options)`\
  The window within which a message will be considered valid, when using the timestamp verifier addon.

- `sequenceWindow`\
  type: `number`\
  default: The value set in `instantiateMteWasm(options)`\
  The sequence window within which a message will be considered valid, when using the sequence verifier addon.

- `passThrough`\
  type: `boolean`\
  default: The value set in `instantiateMteWasm(options)`\
  When true, decoders simply pass-through their original payloads. Helpful in development.

- `keepAlive`\
  type: `number` (milliseconds)\
  default: The value set in `instantiateMteWasm(options)`\
  The duration to keep an decoder or decoder alive, after which it's state is saved into cache and it is destroyed. Good for rapid decoder/decode operations, for example, when streaming or chunking data.

- `logMteState`\
  type: `boolean`\
  default: `false`\
  If true, MTE state will be logged to stdout after this decode event.

```js
// decode using default options
const decoded = mteDecode(encoded, { id: "my-decoder-001" });

// decode using custom options
const decoded = mteDecode(encoded, {
  id: "my-decoder-001",
  type: "MKE",
  output: "Uint8Array",
  sequenceWindow: 5,
  timestampWindow: 5000,
  passThrough: true,
  keepAlive: 1000,
  logMteState: true,
});
```
