import { MteEnc, MteWasm, MteBase } from "mte";
import { validateStatusIsSuccess } from "../common";

type MteEncoderOptions = {
  mteWasm: MteWasm;
  mteBase: MteBase;
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
  const mteEncoder = MteEnc.fromdefault(options.mteWasm);

  // handle entropy
  if (options.entropy instanceof Uint8Array) {
    mteEncoder.setEntropyArr(options.entropy);
  } else {
    if (options.entropy.encoding === "B64") {
      mteEncoder.setEntropyB64(options.entropy.value);
    } else {
      mteEncoder.setEntropyStr(options.entropy.value);
    }
  }

  // handle nonce
  mteEncoder.setNonce(String(options.nonce));

  // handle instantiation
  const initResult = mteEncoder.instantiate(options.personalization);
  validateStatusIsSuccess(initResult, options.mteBase);

  return mteEncoder;
}

/**
 * MTE encode a Uint8Array and return the encoded value as a Uint8Array.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @param mteBase An instance of MTE Base.
 * @returns An MTE encoded Uint8Array.
 */
export function mteEncode(
  payload: Uint8Array,
  encoder: MteEnc,
  mteBase: MteBase
) {
  const encodeResult = encoder.encode(payload);
  validateStatusIsSuccess(encodeResult.status, mteBase);
  return encodeResult.arr!;
}

/**
 * MTE encode a Uint8Array and return the encoded value as a Base64 string.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @param mteBase An instance of MTE Base.
 * @returns An MTE encoded Uint8Array.
 */
export function mteEncodeB64(
  payload: Uint8Array,
  encoder: MteEnc,
  mteBase: MteBase
) {
  const encodeResult = encoder.encodeB64(payload);
  validateStatusIsSuccess(encodeResult.status, mteBase);
  return encodeResult.str!;
}

/**
 * MTE encode a plaintext string and return the encoded value as a Uint8Array.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @param mteBase An instance of MTE Base.
 * @returns An MTE encoded Uint8Array.
 */
export function mteEncodeStr(
  payload: string,
  encoder: MteEnc,
  mteBase: MteBase
) {
  const encodeResult = encoder.encodeStr(payload);
  validateStatusIsSuccess(encodeResult.status, mteBase);
  return encodeResult.arr!;
}

/**
 * MTE encode a plaintext string and return the encoded value as a Base64 string.
 * @param payload A Uint8Array to MTE encode.
 * @param encoder An instance of an MTE encoder.
 * @param mteBase An instance of MTE Base.
 * @returns An MTE encoded Uint8Array.
 */
export function mteEncodeStrB64(
  payload: string,
  encoder: MteEnc,
  mteBase: MteBase
) {
  const encodeResult = encoder.encodeStrB64(payload);
  validateStatusIsSuccess(encodeResult.status, mteBase);
  return encodeResult.str!;
}
