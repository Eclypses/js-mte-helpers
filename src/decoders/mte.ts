import { MteDec, MteWasm, MteBase } from "mte";
import { validateStatusIsSuccess } from "../common";

type MteDecoderOptions = {
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
 * Create a new Mte Decoder.
 * @param {MteDecoderOptions} options
 * @returns {MteDec} MteDec
 */
export function createMteDecoder(options: MteDecoderOptions) {
  // create decoder
  const mteDecoder = MteDec.fromdefault(options.mteWasm);

  // handle entropy
  if (options.entropy instanceof Uint8Array) {
    mteDecoder.setEntropyArr(options.entropy);
  } else {
    if (options.entropy.encoding === "B64") {
      mteDecoder.setEntropyB64(options.entropy.value);
    } else {
      mteDecoder.setEntropyStr(options.entropy.value);
    }
  }

  // handle nonce
  mteDecoder.setNonce(String(options.nonce));

  // handle instantiation
  const initResult = mteDecoder.instantiate(options.personalization);
  validateStatusIsSuccess(initResult, options.mteBase);

  return mteDecoder;
}

/**
 * MTE decode a Uint8Array and return the decoded value as a Uint8Array.
 * @param payload A Uint8Array to MTE decode.
 * @param decoder An instance of an MTE decoder.
 * @param mteBase An instance of MTE Base.
 * @returns An MTE decoded Uint8Array.
 */
export function mteDecode(
  payload: Uint8Array,
  decoder: MteDec,
  mteBase: MteBase
) {
  const decodeResult = decoder.decode(payload);
  validateStatusIsSuccess(decodeResult.status, mteBase);
  return decodeResult.arr!;
}

/**
 * MTE decode a Uint8Array and return the decoded value as a plaintext string.
 * @param payload A Uint8Array to MTE decode.
 * @param decoder An instance of an MTE decoder.
 * @param mteBase An instance of MTE Base.
 * @returns An MTE decoded Uint8Array.
 */
export function mteDecodeStr(
  payload: Uint8Array,
  decoder: MteDec,
  mteBase: MteBase
) {
  const decodeResult = decoder.decodeStr(payload);
  validateStatusIsSuccess(decodeResult.status, mteBase);
  return decodeResult.str!;
}

/**
 * MTE decode a Base64 string and return the decoded value as a Uint8Array.
 * @param payload A Uint8Array to MTE decode.
 * @param decoder An instance of an MTE decoder.
 * @param mteBase An instance of MTE Base.
 * @returns An MTE decoded Uint8Array.
 */
export function mteDecodeB64(
  payload: string,
  decoder: MteDec,
  mteBase: MteBase
) {
  const decodeResult = decoder.decodeB64(payload);
  validateStatusIsSuccess(decodeResult.status, mteBase);
  return decodeResult.arr!;
}

/**
 * MTE decode a plaintext string and return the decoded value as a Base64 string.
 * @param payload A Uint8Array to MTE decode.
 * @param decoder An instance of an MTE decoder.
 * @param mteBase An instance of MTE Base.
 * @returns An MTE decoded Uint8Array.
 */
export function mteDecodeStrB64(
  payload: string,
  decoder: MteDec,
  mteBase: MteBase
) {
  const decodeResult = decoder.decodeStrB64(payload);
  validateStatusIsSuccess(decodeResult.status, mteBase);
  return decodeResult.str!;
}
