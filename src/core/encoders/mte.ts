import { MteEnc, MteWasm } from "mte";
import { validateStatusIsSuccess } from "../common";

type MteEncoderOptions = {
  mteWasm: MteWasm;
  personalization: string;
  nonce: string | number;
  entropy:
    | Uint8Array
    | {
        value: string;
        encoding: "B64" | "plaintext";
      };
};
/**
 * Create a new MteEncoder using the given options.
 * @param {MteEncoderOptions} options
 * @returns {MteEnc} MteEnc
 */
export function createMteEncoder(options: MteEncoderOptions) {
  // create encoder
  const encoder = MteEnc.fromdefault(options.mteWasm);

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
 * MTE encode a Uint8Array and return the encoded value as a Uint8Array.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @returns An MTE encoded Uint8Array.
 */
export function mteEncode(payload: Uint8Array, encoder: MteEnc) {
  const encodeResult = encoder.encode(payload);
  validateStatusIsSuccess(encodeResult.status, encoder);
  return encodeResult.arr!;
}

/**
 * MTE encode a Uint8Array and return the encoded value as a Base64 string.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @returns An MTE encoded Uint8Array.
 */
export function mteEncodeB64(payload: Uint8Array, encoder: MteEnc) {
  const encodeResult = encoder.encodeB64(payload);
  validateStatusIsSuccess(encodeResult.status, encoder);
  return encodeResult.str!;
}

/**
 * MTE encode a plaintext string and return the encoded value as a Uint8Array.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @returns An MTE encoded Uint8Array.
 */
export function mteEncodeStr(payload: string, encoder: MteEnc) {
  const encodeResult = encoder.encodeStr(payload);
  validateStatusIsSuccess(encodeResult.status, encoder);
  return encodeResult.arr!;
}

/**
 * MTE encode a plaintext string and return the encoded value as a Base64 string.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @returns An MTE encoded Uint8Array.
 */
export function mteEncodeStrB64(payload: string, encoder: MteEnc) {
  const encodeResult = encoder.encodeStrB64(payload);
  validateStatusIsSuccess(encodeResult.status, encoder);
  return encodeResult.str!;
}
