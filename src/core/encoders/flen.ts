import { MteFlenEnc, MteWasm } from "mte";
import { validateStatusIsSuccess } from "../common";

type FlenInitOptions = {
  mteWasm: MteWasm;
  personalization: string;
  nonce: string | number;
  entropy:
    | Uint8Array
    | {
        value: string;
        encoding: "B64" | "plaintext";
      };
  fixedLength: number;
};

/**
 * Create a new MTE Fixed-Length Encoder using the given options.
 * @param {EncoderDecoderInitOptions} options
 * @returns {MteEncFMteFlenEnclen} MteEnc
 */
export function createFlenEncoder(options: FlenInitOptions) {
  // create encoder
  const encoder = MteFlenEnc.fromdefault(options.mteWasm, options.fixedLength);

  // handle entropy
  if (options.entropy instanceof Uint8Array) {
    encoder.setEntropyArr(options.entropy);
  } else {
    if (options.entropy.encoding === "B64") {
      encoder.setEntropyB64(options.entropy.value);
    } else {
      encoder.setEntropyStr(options.entropy.value);
    }
  }

  // handle nonce
  encoder.setNonce(String(options.nonce));

  // handle instantiation
  const initResult = encoder.instantiate(options.personalization);
  validateStatusIsSuccess(initResult, encoder);

  return encoder;
}

/**
 * MTE Fixed-Length encode a Uint8Array and return the encoded value as a Uint8Array.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @returns An MTE Fixed-Length encoded Uint8Array.
 */
export function flenEncode(payload: Uint8Array, encoder: MteFlenEnc) {
  const encodeResult = encoder.encode(payload);
  validateStatusIsSuccess(encodeResult.status, encoder);
  return encodeResult.arr!;
}

/**
 * MTE Fixed-Length encode a Uint8Array and return the encoded value as a Base64 string.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @returns An MTE Fixed-Length encoded Uint8Array.
 */
export function flenEncodeB64(payload: Uint8Array, encoder: MteFlenEnc) {
  const encodeResult = encoder.encodeB64(payload);
  validateStatusIsSuccess(encodeResult.status, encoder);
  return encodeResult.str!;
}

/**
 * MTE Fixed-Length encode a plaintext string and return the encoded value as a Uint8Array.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @returns An MTE Fixed-Length encoded Uint8Array.
 */
export function flenEncodeStr(payload: string, encoder: MteFlenEnc) {
  const encodeResult = encoder.encodeStr(payload);
  validateStatusIsSuccess(encodeResult.status, encoder);
  return encodeResult.arr!;
}

/**
 * MTE Fixed-Length encode a plaintext string and return the encoded value as a Base64 string.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @returns An MTE Fixed-Length encoded Uint8Array.
 */
export function flenEncodeStrB64(payload: string, encoder: MteFlenEnc) {
  const encodeResult = encoder.encodeStrB64(payload);
  validateStatusIsSuccess(encodeResult.status, encoder);
  return encodeResult.str!;
}
