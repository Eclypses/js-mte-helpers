import { MteMkeEnc, MteWasm, MteBase } from "mte";
import { validateStatusIsSuccess } from "../common";

type MkeEncoderOptions = {
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
 * Create a new MKE Encoder using the given options.
 * @param {MteEncoderOptions} options
 * @returns {MteMkeEnc} An MKE Encoder.
 */
export function createMkeEncoder(options: MkeEncoderOptions) {
  // create encoder
  const mteEncoder = MteMkeEnc.fromdefault(options.mteWasm);

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
 * MKE encrypt a Uint8Array and return the encrypted value as a Uint8Array.
 * @param payload A Uint8Array to MKE encrypt.
 * @param encrypter An instance of an MKE encrypter.
 * @param mteBase An instance of MTE Base.
 * @returns An MKE encrypted Uint8Array.
 */
export function mkeEncrypt(
  payload: Uint8Array,
  encrypter: MteMkeEnc,
  mteBase: MteBase
) {
  const encodeResult = encrypter.encode(payload);
  validateStatusIsSuccess(encodeResult.status, mteBase);
  return encodeResult.arr!;
}

/**
 * MKE encrypt a Uint8Array and return the encrypted value as a Base64 string.
 * @param payload A Uint8Array to MKE encrypt.
 * @param encrypter An instance of an MKE encrypter.
 * @param mteBase An instance of MTE Base.
 * @returns An MKE encrypted Base64 string.
 */
export function mkeEncryptB64(
  payload: Uint8Array,
  encryptor: MteMkeEnc,
  mteBase: MteBase
) {
  const encodeResult = encryptor.encodeB64(payload);
  validateStatusIsSuccess(encodeResult.status, mteBase);
  return encodeResult.str!;
}

/**
 * MKE encrypt a plaintext string and return the encrypted value as a Uint8Array.
 * @param payload A plaintext string to MKE encrypt.
 * @param encrypter An instance of an MKE encrypter.
 * @param mteBase An instance of MTE Base.
 * @returns An MKE encrypted Uint8Array.
 */
export function mkeEncryptStr(
  payload: string,
  encrypter: MteMkeEnc,
  mteBase: MteBase
) {
  const encodeResult = encrypter.encodeStr(payload);
  validateStatusIsSuccess(encodeResult.status, mteBase);
  return encodeResult.arr!;
}

/**
 * MKE encrypt a plaintext string and return the encrypted value as a Base64 string.
 * @param payload A plaintext string to MKE encrypt.
 * @param encrypter An instance of an MKE encrypter.
 * @param mteBase An instance of MTE Base.
 * @returns An MKE encrypted Base64 string.
 */
export function mkeEncryptStrB64(
  payload: string,
  encoder: MteMkeEnc,
  mteBase: MteBase
) {
  const encodeResult = encoder.encodeStrB64(payload);
  validateStatusIsSuccess(encodeResult.status, mteBase);
  return encodeResult.str!;
}
