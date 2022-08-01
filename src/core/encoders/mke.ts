import { MteMkeEnc, MteWasm } from "mte";
import { validateStatusIsSuccess } from "../common";

type MkeEncoderOptions = {
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
 * Create a new MKE Encoder using the given options.
 * @param {MteEncoderOptions} options
 * @returns {MteMkeEnc} An MKE Encoder.
 */
export function createMkeEncoder(options: MkeEncoderOptions) {
  // create encoder
  const encryptor = MteMkeEnc.fromdefault(options.mteWasm);

  // handle entropy
  if (options.entropy instanceof Uint8Array) {
    encryptor.setEntropyArr(options.entropy);
  } else {
    if (options.entropy.encoding === "B64") {
      encryptor.setEntropyB64(options.entropy.value);
    } else {
      encryptor.setEntropyStr(options.entropy.value);
    }
  }

  // handle nonce
  encryptor.setNonce(String(options.nonce));

  // handle instantiation
  const initResult = encryptor.instantiate(options.personalization);
  validateStatusIsSuccess(initResult, encryptor);

  return encryptor;
}

/**
 * MKE encrypt a Uint8Array and return the encrypted value as a Uint8Array.
 * @param payload A Uint8Array to MKE encrypt.
 * @param encrypter An instance of an MKE encrypter.
 * @returns An MKE encrypted Uint8Array.
 */
export function mkeEncrypt(payload: Uint8Array, encrypter: MteMkeEnc) {
  const encryptResult = encrypter.encode(payload);
  validateStatusIsSuccess(encryptResult.status, encrypter);
  return encryptResult.arr!;
}

/**
 * MKE encrypt a Uint8Array and return the encrypted value as a Base64 string.
 * @param payload A Uint8Array to MKE encrypt.
 * @param encrypter An instance of an MKE encrypter.
 * @returns An MKE encrypted Base64 string.
 */
export function mkeEncryptB64(payload: Uint8Array, encrypter: MteMkeEnc) {
  const encryptResult = encrypter.encodeB64(payload);
  validateStatusIsSuccess(encryptResult.status, encrypter);
  return encryptResult.str!;
}

/**
 * MKE encrypt a plaintext string and return the encrypted value as a Uint8Array.
 * @param payload A plaintext string to MKE encrypt.
 * @param encrypter An instance of an MKE encrypter.
 * @returns An MKE encrypted Uint8Array.
 */
export function mkeEncryptStr(payload: string, encrypter: MteMkeEnc) {
  const encryptResult = encrypter.encodeStr(payload);
  validateStatusIsSuccess(encryptResult.status, encrypter);
  return encryptResult.arr!;
}

/**
 * MKE encrypt a plaintext string and return the encrypted value as a Base64 string.
 * @param payload A plaintext string to MKE encrypt.
 * @param encrypter An instance of an MKE encrypter.
 * @returns An MKE encrypted Base64 string.
 */
export function mkeEncryptStrB64(payload: string, encrypter: MteMkeEnc) {
  const encryptResult = encrypter.encodeStrB64(payload);
  validateStatusIsSuccess(encryptResult.status, encrypter);
  return encryptResult.str!;
}
