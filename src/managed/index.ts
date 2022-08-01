import {
  MteWasm,
  MteBase,
  MteEnc,
  MteDec,
  MteFlenEnc,
  MteMkeEnc,
  MteMkeDec,
  MteArrStatus,
  MteStrStatus,
} from "mte";
import {
  initMteLicense,
  createMteEncoder,
  createMteDecoder,
  getMteState,
  restoreMteState,
  validateStatusIsSuccess,
} from "../core";
import { DefaultSettings } from "../types";
import { setItem, takeItem } from "./memory-store";

/**
 * Declare variables to hold mteWasm and mteBase
 */
let mteWasm: MteWasm;

/**
 *  Declare variable for get/set state functions.
 */
const cache = {
  saveState: setItem,
  takeState: takeItem,
};

/**
 * Define default options
 * passThrough - when true, no encoding/decoding will occur (good for development)
 * keepAlive - keeps and encoding alive for this many ms before saving state and putting in cache
 * useMkeAboveSize - automatically uses MKE when the payload is larger than this value
 */
const _SETTINGS: DefaultSettings = {
  passThrough: false,
  keepAlive: 0,
  useMkeAboveSize: 0,
  stateType: "Uint8Array",
  encoderType: "MKE",
  fixedLength: 0,
  encoderOutput: "B64",
  decoderType: "MKE",
  decoderOutput: "str",
  timestampWindow: 0,
  sequenceWindow: 0,
};

/**
 * An asynchronous function that instantiates MteWasm, then sets up MteBase for future use.
 * This MUST be called before any other MTE methods can be used, usually as soon as the website loads.
 */
export async function instantiateMteWasm(
  options: {
    licenseKey: string;
    licenseCompany: string;
  } & Partial<typeof cache & DefaultSettings>
) {
  /**
   * If user provided their own state functions, use them.
   */
  if (options.saveState) {
    cache.saveState = options.saveState;
  }
  if (options.takeState) {
    cache.takeState = options.takeState;
  }

  /**
   * If user provided any default values, set them.
   */
  _SETTINGS.passThrough = options.passThrough || _SETTINGS.passThrough;
  _SETTINGS.keepAlive = options.keepAlive || _SETTINGS.keepAlive;
  _SETTINGS.useMkeAboveSize =
    options.useMkeAboveSize || _SETTINGS.useMkeAboveSize;
  _SETTINGS.stateType = options.stateType || _SETTINGS.stateType;
  _SETTINGS.encoderType = options.encoderType || _SETTINGS.encoderType;
  _SETTINGS.fixedLength = options.fixedLength || _SETTINGS.fixedLength;
  _SETTINGS.encoderOutput = options.encoderOutput || _SETTINGS.encoderOutput;
  _SETTINGS.decoderType = options.decoderType || _SETTINGS.decoderType;
  _SETTINGS.decoderOutput = options.decoderOutput || _SETTINGS.decoderOutput;
  _SETTINGS.timestampWindow =
    options.timestampWindow || _SETTINGS.timestampWindow;
  _SETTINGS.sequenceWindow = options.sequenceWindow || _SETTINGS.sequenceWindow;

  // assign mteWasm to global variable, and instantiate wasm
  mteWasm = new MteWasm();
  await mteWasm.instantiate();

  // assign mteBase variable
  const mteBase = new MteBase(mteWasm);

  // Initialize MTE license
  initMteLicense(options.licenseKey, options.licenseCompany, mteBase);

  return true;
}

/**
 * Create an encoder using specific instantiation values.
 */
type CreateEncoderOptions = {
  id: any;
  personalization: string;
  nonce: string | number;
  entropy:
    | Uint8Array
    | {
        value: string;
        encoding: "B64" | "plaintext";
      };
};
export async function createEncoder(options: CreateEncoderOptions) {
  if (!mteWasm) {
    throw Error("MTE WASM must be instantiated before creating an encoder.");
  }

  // create new encoder
  const encoder = createMteEncoder({
    mteWasm,
    personalization: options.personalization,
    nonce: options.nonce,
    entropy: options.entropy,
  });

  // save encoder state
  const state = getMteState(encoder, _SETTINGS.stateType);

  // save mte state in cache
  await cache.saveState(options.id, state);

  // destroy encoder
  encoder.uninstantiate();
  encoder.destruct();
}

/**
 * Create a decoder using specific instantiation values.
 */
type CreateDecoderOptions = CreateEncoderOptions;
export async function createDecoder(options: CreateDecoderOptions) {
  if (!mteWasm) {
    throw Error("MTE WASM must be instantiated before creating a decoder.");
  }

  // create new decoder
  const decoder = createMteDecoder({
    mteWasm: mteWasm,
    personalization: options.personalization,
    nonce: options.nonce,
    entropy: options.entropy,
  });

  // save decoder state
  const state = getMteState(decoder, _SETTINGS.stateType);

  // save mte state
  await cache.saveState(options.id, state);

  // destroy decoder
  decoder.uninstantiate();
  decoder.destruct();
}

/**
 * MTE Encode a value
 */
export function mteEncode(
  payload: string | Uint8Array,
  options: { type?: "MTE" | "MKE"; id: any; output?: "B64" } & Partial<
    Omit<DefaultSettings, "defaultStateType">
  >
): Promise<string>;
export function mteEncode(
  payload: string | Uint8Array,
  options: { type?: "MTE" | "MKE"; id: any; output?: "Uint8Array" } & Partial<
    Omit<DefaultSettings, "defaultStateType">
  >
): Promise<Uint8Array>;
export function mteEncode(
  payload: string | Uint8Array,
  options: {
    type?: "FLEN";
    fixedLength?: number;
    id: any;
    output?: "B64";
  } & Partial<Omit<DefaultSettings, "defaultStateType">>
): Promise<string>;
export function mteEncode(
  payload: string | Uint8Array,
  options: {
    type?: "FLEN";
    fixedLength?: number;
    id: any;
    output?: "Uint8Array";
  } & Partial<Omit<DefaultSettings, "defaultStateType">>
): Promise<Uint8Array>;
export async function mteEncode(
  payload: string | Uint8Array,
  options: (
    | {
        type?: "FLEN";
        fixedLength?: number;
      }
    | {
        type?: "MTE" | "MKE";
      }
  ) & {
    id: any;
    output?: "Uint8Array" | "B64";
  } & Partial<Omit<DefaultSettings, "defaultStateType">>
) {
  // check for passthrough
  if (options.passThrough) {
    return payload;
  }

  const savedState = await cache.takeState<"string" | "Uint8Array">(options.id);
  if (!savedState) {
    throw Error(`Encoder state not found with id "${options.id}"`);
  }

  // create encoder of the requested type
  let encoder: MteEnc | MteFlenEnc | MteMkeEnc;
  const type = options.type || _SETTINGS.encoderType;
  switch (type) {
    case "MTE": {
      encoder = MteEnc.fromdefault(mteWasm);
      break;
    }
    case "MKE": {
      encoder = MteMkeEnc.fromdefault(mteWasm);
      break;
    }
    case "FLEN": {
      encoder = MteFlenEnc.fromdefault(
        mteWasm,
        options.fixedLength || _SETTINGS.fixedLength
      );
      break;
    }
    default: {
      throw Error(
        `Unknown encoder type was request. Expected type of MTE, MKE< or FLEN, but received "${type}".`
      );
    }
  }

  // restore encoder
  restoreMteState(encoder, savedState);

  // encode data
  let encodeResult: MteArrStatus | MteStrStatus;
  let output = options.output || _SETTINGS.encoderOutput;
  if (payload instanceof Uint8Array) {
    if (output === "Uint8Array") {
      encodeResult = encoder.encode(payload);
    } else {
      encodeResult = encoder.encodeB64(payload);
    }
  } else {
    if (output === "Uint8Array") {
      encodeResult = encoder.encodeStr(payload);
    } else {
      encodeResult = encoder.encodeStrB64(payload);
    }
  }

  // check encode result
  validateStatusIsSuccess(encodeResult.status, encoder);

  // get encoder state
  const state = getMteState(encoder, _SETTINGS.stateType);

  // save encoder state in cache
  await cache.saveState(options.id, state);

  // destroy encoder
  encoder.uninstantiate();
  encoder.destruct();

  // return result
  return "str" in encodeResult ? encodeResult.str : encodeResult.arr;
}

/**
 * MTE Decode a value
 */
export function mteDecode(
  payload: string | Uint8Array,
  options: {
    type?: "MTE" | "MKE";
    id: any;
    output?: "str";
    timestampWindow?: number;
    sequenceWindow?: number;
  }
): Promise<string>;
export function mteDecode(
  payload: string | Uint8Array,
  options: {
    type?: "MTE" | "MKE";
    id: any;
    output?: "Uint8Array";
    timestampWindow?: number;
    sequenceWindow?: number;
  }
): Promise<Uint8Array>;
export async function mteDecode(
  payload: string | Uint8Array,
  options: {
    type?: "MTE" | "MKE";
    id: any;
    output?: "str" | "Uint8Array";
    timestampWindow?: number;
    sequenceWindow?: number;
  }
) {
  // check for passthrough
  if (_SETTINGS.passThrough) {
    return payload;
  }

  const savedState = await cache.takeState<string>(options.id);
  if (!savedState) {
    throw Error(`Decoder not found with identifier "${options.id}"`);
  }

  // create decoder of the requested type
  let decoder: MteDec | MteMkeDec;
  const type = options.type || _SETTINGS.decoderType;
  const tsw = options.timestampWindow || _SETTINGS.timestampWindow;
  const sw = options.sequenceWindow || _SETTINGS.sequenceWindow;
  if (type === "MTE") {
    decoder = MteDec.fromdefault(mteWasm, String(tsw), sw);
  } else {
    decoder = MteMkeDec.fromdefault(mteWasm, String(tsw), sw);
  }

  // restore decoder
  decoder.restoreStateB64(savedState);

  // decode data
  let decodeResult: MteArrStatus | MteStrStatus;
  const output = options.output || _SETTINGS.decoderOutput;
  if (payload instanceof Uint8Array) {
    if (output === "Uint8Array") {
      decodeResult = decoder.decode(payload);
    } else {
      decodeResult = decoder.decodeStr(payload);
    }
  } else {
    if (output === "Uint8Array") {
      decodeResult = decoder.decodeB64(payload);
    } else {
      decodeResult = decoder.decodeStrB64(payload);
    }
  }

  // check decode result
  validateStatusIsSuccess(decodeResult.status, decoder);

  const state = getMteState(decoder, _SETTINGS.stateType);
  await cache.saveState(options.id, state);

  // return result
  return "str" in decodeResult ? decodeResult.str : decodeResult.arr;
}
