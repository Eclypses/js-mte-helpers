import { MteMkeDec, MteWasm } from "mte";
import { validateStatusIsSuccess } from "../common";

type MkeDecoderOptions = {
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
 * Create a new MKE Decoder using the given options.
 * @param {MkeDecoderOptions} options
 * @returns {MteMkeDec} An MKE Decoder.
 */
export function createMkeDecoder(options: MkeDecoderOptions) {
  // create decoder
  const decryptor = MteMkeDec.fromdefault(options.mteWasm);

  // handle entropy
  if (options.entropy instanceof Uint8Array) {
    decryptor.setEntropyArr(options.entropy);
  } else {
    if (options.entropy.encoding === "B64") {
      decryptor.setEntropyB64(options.entropy.value);
    } else {
      decryptor.setEntropyStr(options.entropy.value);
    }
  }

  // handle nonce
  decryptor.setNonce(String(options.nonce));

  // handle instantiation
  const initResult = decryptor.instantiate(options.personalization);
  validateStatusIsSuccess(initResult, decryptor);

  return decryptor;
}

/**
 * MKE decrypt a Uint8Array and return the decrypted value as a Uint8Array.
 * @param payload A Uint8Array to MKE decrypt.
 * @param decrypter An instance of an MKE decrypter.
 * @returns An MKE decrypted Uint8Array.
 */
export function mkeDecrypt(payload: Uint8Array, decrypter: MteMkeDec) {
  const decryptResult = decrypter.decode(payload);
  validateStatusIsSuccess(decryptResult.status, decrypter);
  return decryptResult.arr!;
}

/**
 * MKE decrypt a Uint8Array and return the decrypted value as a plaintext string.
 * @param payload A Uint8Array to MKE decrypt.
 * @param decrypter An instance of an MKE decrypter.
 * @returns An MKE decrypted plaintext string.
 */
export function mkeDecryptStr(payload: Uint8Array, decrypter: MteMkeDec) {
  const decryptResult = decrypter.decodeStr(payload);
  validateStatusIsSuccess(decryptResult.status, decrypter);
  return decryptResult.str!;
}

/**
 * MKE decrypt a B64 string and return the decrypted value as a Uint8Array.
 * @param payload A plaintext string to MKE decrypt.
 * @param decrypter An instance of an MKE decrypter.
 * @returns An MKE decrypted Uint8Array.
 */
export function mkedecryptB64(payload: string, decrypter: MteMkeDec) {
  const decryptResult = decrypter.decodeB64(payload);
  validateStatusIsSuccess(decryptResult.status, decrypter);
  return decryptResult.arr!;
}

/**
 * MKE decrypt a B64 string and return the decrypted value as a plaintext string.
 * @param payload A plaintext string to MKE decrypt.
 * @param decrypter An instance of an MKE decrypter.
 * @returns An MKE decrypted Base64 string.
 */
export function mkeDecryptStrB64(payload: string, decrypter: MteMkeDec) {
  const decryptResult = decrypter.decodeStrB64(payload);
  validateStatusIsSuccess(decryptResult.status, decrypter);
  return decryptResult.str!;
}
