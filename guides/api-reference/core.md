# MTE-Helpers "Core" API Reference

The MTE-Helpers "Core" module consists of a set of functions that interact directly with the MTE library. The primary goal of these functions is to facilitate best-practices and implement "common code" such as error checking after each encode/decode event. This is code you would have to write anyway; now, you don't have to.

## Encoder Functions

### MTE Encoder Functions

#### `createMteEncoder(options: MteEncoderOptions): MteEncoder`

Using the provided initialization options, creates and returns an MTE Encoder object.

**MteEncoderOptions**

- `mteWasm` **\*Required**\
  type: `MteWasm`\
  default: `undefined`\
  An instance of MteWasm that has been initialized.

- `personalization` **\*Required**\
  type: `string`\
  default: `undefined`\
  The personalization string to use when creating this encoder.

- `nonce` **\*Required**\
  type: `string` of integers\
  default: `undefined`\
  The personalization string to use when creating this encoder.

- `entropy` **\*Required**\
  type: `Uint8Array|EntropyObject`\
  default: `undefined`\
  An entropy value to use when creating this encoder. Greater entropy means better security.

  - `EntropyObject`
    - `EntropyObject.value`
      - type: `string`
      - A string to use for entropy.
    - `EntropyObject.encoding`
      - type: `"plaintext"|"B64"`
      - The encoding of the `value` proprty.

**Examples:**

```js
const { createMteEncoder } = require("mte-helpers/core");

// create encoder with Uint8Array entropy
const encoder_1 = createMteEncoder({
  personalization: "98eec683-04f2-4961-8edf-5f15165ba975",
  nonce: "192837465192837",
  entropy: new Uint8Array(32).fill(1),
});

// create encoder with a plaintext entropy string
const encoder_2 = createMteEncoder({
  personalization: "98eec683-04f2-4961-8edf-5f15165ba975",
  nonce: "192837465192837",
  entropy: {
    value: "RRN4Fqyce7!7!dH5kH#DNr#&gK!EA#Q%",
    encoding: "plaintext",
  },
});

// create encoder with a Base64 entropy string
const encoder_3 = createMteEncoder({
  personalization: "98eec683-04f2-4961-8edf-5f15165ba975",
  nonce: "192837465192837",
  entropy: {
    value: "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==",
    encoding: "B64",
  },
});
```

#### `mteEncode(payload: Uint8Array, encoder: MteEnc): Uint8Array`

Use MTE to tokenize a payload, and return the tokenized Uint8Array.

- `payload` **\*Required**\
  type: `Uint8Array`
  A Uint8Array to tokenize.

- `encoder` **\*Required**\
  type: `MteEncoder`
  The encoder to use for this operation.

**Example:**

```js
const encoded = mteEncode(uint8Array, encoder);
```
