import { MteMkeDec, MteWasm, MteBase } from "mte";
import { validateStatusIsSuccess } from "../common";

type MkeDecoderOptions = {
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
 * Create a new MKE Decoder using the given options.
 * @param {MkeDecoderOptions} options
 * @returns {MteMkeDec} An MKE Decoder.
 */
export function createMkeDecoder(options: MkeDecoderOptions) {
  // create decoder
  const mteDecoder = MteMkeDec.fromdefault(options.mteWasm);

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
 * MKE decrypt a Uint8Array and return the decrypted value as a Uint8Array.
 * @param payload A Uint8Array to MKE decrypt.
 * @param decrypter An instance of an MKE decrypter.
 * @param mteBase An instance of MTE Base.
 * @returns An MKE decrypted Uint8Array.
 */
export function mkeDecrypt(
  payload: Uint8Array,
  decrypter: MteMkeDec,
  mteBase: MteBase
) {
  const decodeResult = decrypter.decode(payload);
  validateStatusIsSuccess(decodeResult.status, mteBase);
  return decodeResult.arr!;
}

/**
 * MKE decrypt a Uint8Array and return the decrypted value as a Base64 string.
 * @param payload A Uint8Array to MKE decrypt.
 * @param decrypter An instance of an MKE decrypter.
 * @param mteBase An instance of MTE Base.
 * @returns An MKE decrypted Base64 string.
 */
export function mkeDecryptStr(
  payload: Uint8Array,
  decryptor: MteMkeDec,
  mteBase: MteBase
) {
  const decodeResult = decryptor.decodeStr(payload);
  validateStatusIsSuccess(decodeResult.status, mteBase);
  return decodeResult.str!;
}

/**
 * MKE decrypt a plaintext string and return the decrypted value as a Uint8Array.
 * @param payload A plaintext string to MKE decrypt.
 * @param decrypter An instance of an MKE decrypter.
 * @param mteBase An instance of MTE Base.
 * @returns An MKE decrypted Uint8Array.
 */
export function mkedecryptB64(
  payload: string,
  decrypter: MteMkeDec,
  mteBase: MteBase
) {
  const decodeResult = decrypter.decodeB64(payload);
  validateStatusIsSuccess(decodeResult.status, mteBase);
  return decodeResult.arr!;
}

/**
 * MKE decrypt a plaintext string and return the decrypted value as a Base64 string.
 * @param payload A plaintext string to MKE decrypt.
 * @param decrypter An instance of an MKE decrypter.
 * @param mteBase An instance of MTE Base.
 * @returns An MKE decrypted Base64 string.
 */
export function mteDecryptStrB64(
  payload: string,
  decoder: MteMkeDec,
  mteBase: MteBase
) {
  const decodeResult = decoder.decodeStrB64(payload);
  validateStatusIsSuccess(decodeResult.status, mteBase);
  return decodeResult.str!;
}
