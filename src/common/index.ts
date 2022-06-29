import {
  MteEnc,
  MteDec,
  MteFlenEnc,
  MteMkeEnc,
  MteMkeDec,
  MteBase,
  MteStatus,
} from "mte";

type EncDec = MteEnc | MteFlenEnc | MteMkeEnc | MteDec | MteMkeDec;

/**
 * Initialize MTE with a company name and license key.
 * @param licenseKey The license key.
 * @param companyName The company name MTE has been licensed to.
 * @param mteBase An instance of MteBase
 */
export function initMteLicense(
  licenseKey: string,
  companyName: string,
  mteBase: MteBase
) {
  // Initialize MTE license
  const initResult = mteBase.initLicense(companyName, licenseKey);
  if (!initResult) {
    const licenseStatus = MteStatus.mte_status_license_error;
    const status = mteBase.getStatusName(licenseStatus);
    const message = mteBase.getStatusDescription(licenseStatus);
    throw new Error(`Error with MTE License.\n${status}: ${message}`);
  }
}

/**
 * Validate that an MTE status is successful. If the status is NOT successful, throw an error.
 * @param status An MTE status.
 * @param mteBase An instance of MTE Base.
 */
export function validateStatusIsSuccess(status: MteStatus, mteBase: MteBase) {
  if (status !== MteStatus.mte_status_success) {
    const statusName = mteBase.getStatusName(status);
    const description = mteBase.getStatusDescription(status);
    throw new Error(statusName + ": " + description);
  }
}

/**
 * Restore an Encoder or Decoder using a previously saved MTE state.
 * @param encdec An instance of an Encoder or Decoder.
 * @param state The previous MTE state.
 * @param mteBase An instance of MTE Base.
 */
export function restoreMteState(
  encdec: EncDec,
  state: string | Uint8Array,
  mteBase: MteBase
): void {
  let result: MteStatus;
  if (state instanceof Uint8Array) {
    result = encdec.restoreState(state);
  } else {
    result = encdec.restoreStateB64(state);
  }

  // validate restore event
  validateStatusIsSuccess(result, mteBase);
}

/**
 * Save an MTE state as a Base64 string or a Uint8Array
 * @param encoder An instance of an Encoder or Decoder.
 * @param output Uint8Array or B64
 * @return Uint8Array or B64.
 */
export function getMteState(encoder: EncDec, output: "Uint8Array"): Uint8Array;
export function getMteState(encoder: EncDec, output: "B64"): string;
export function getMteState(
  encoder: EncDec,
  output: "B64" | "Uint8Array"
): string;
export function getMteState(encoder: EncDec, output: "Uint8Array" | "B64") {
  if (output === "Uint8Array") {
    const state = encoder.saveState();
    if (!state) {
      throw Error("Failed to save MTE state.");
    }
    return state;
  }

  const state = encoder.saveStateB64();
  if (!state) {
    throw Error("Failed to save MTE state.");
  }
  return state;
}
