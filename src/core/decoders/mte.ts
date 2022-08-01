import { MteDec, MteWasm } from "mte";
import { validateStatusIsSuccess } from "../common";

type MteDecoderOptions = {
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
 * Create a new Mte Decoder.
 * @param {MteDecoderOptions} options
 * @returns {MteDec} MteDec
 */
export function createMteDecoder(options: MteDecoderOptions) {
  // create decoder
  const decoder = MteDec.fromdefault(options.mteWasm);

  // handle entropy
  if (options.entropy instanceof Uint8Array) {
    decoder.setEntropyArr(options.entropy);
  } else {
    if (options.entropy.encoding === "B64") {
      decoder.setEntropyB64(options.entropy.value);
    } else {
      decoder.setEntropyStr(options.entropy.value);
    }
  }

  // handle nonce
  decoder.setNonce(String(options.nonce));

  // handle instantiation
  const initResult = decoder.instantiate(options.personalization);
  validateStatusIsSuccess(initResult, decoder);

  return decoder;
}

/**
 * MTE decode a Uint8Array and return the decoded value as a Uint8Array.
 * @param payload A Uint8Array to MTE decode.
 * @param decoder An instance of an MTE decoder.
 * @returns An MTE decoded Uint8Array.
 */
export function mteDecode(payload: Uint8Array, decoder: MteDec) {
  const decodeResult = decoder.decode(payload);
  validateStatusIsSuccess(decodeResult.status, decoder);
  return decodeResult.arr!;
}

/**
 * MTE decode a Uint8Array and return the decoded value as a plaintext string.
 * @param payload A Uint8Array to MTE decode.
 * @param decoder An instance of an MTE decoder.
 * @returns An MTE decoded Uint8Array.
 */
export function mteDecodeStr(payload: Uint8Array, decoder: MteDec) {
  const decodeResult = decoder.decodeStr(payload);
  validateStatusIsSuccess(decodeResult.status, decoder);
  return decodeResult.str!;
}

/**
 * MTE decode a Base64 string and return the decoded value as a Uint8Array.
 * @param payload A Uint8Array to MTE decode.
 * @param decoder An instance of an MTE decoder.
 * @returns An MTE decoded Uint8Array.
 */
export function mteDecodeB64(payload: string, decoder: MteDec) {
  const decodeResult = decoder.decodeB64(payload);
  validateStatusIsSuccess(decodeResult.status, decoder);
  return decodeResult.arr!;
}

/**
 * MTE decode a plaintext string and return the decoded value as a Base64 string.
 * @param payload A Uint8Array to MTE decode.
 * @param decoder An instance of an MTE decoder.
 * @returns An MTE decoded Uint8Array.
 */
export function mteDecodeStrB64(payload: string, decoder: MteDec) {
  const decodeResult = decoder.decodeStrB64(payload);
  validateStatusIsSuccess(decodeResult.status, decoder);
  return decodeResult.str!;
}
