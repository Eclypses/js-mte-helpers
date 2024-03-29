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
  createMteEncoder as createMteEncoderCore,
  createMteDecoder as createMteDecoderCore,
  getMteState,
  restoreMteState,
  validateStatusIsSuccess,
  isDrbgReseedRequired,
} from "../core";
import { GenericSettings, EncoderSettings, DecoderSettings } from "../types";
import {
  deleteAliveItem,
  keepItemAlive,
  takeAliveItem,
} from "./keep-alive-store";
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
 * keepAlive - keeps an encoder/decoder alive for this many ms before saving state and putting in cache
 */
const _SETTINGS: GenericSettings & EncoderSettings & DecoderSettings = {
  passThrough: false,
  encoderType: "MTE",
  saveStateAs: "B64",
  fixedLength: 0,
  encoderOutput: "B64",
  decoderType: "MTE",
  decoderOutput: "str",
  timestampWindow: 0,
  sequenceWindow: 0,
  keepAlive: 0,
  logMteState: false,
};

/**
 * An asynchronous function that instantiates MteWasm, then sets up MteBase for future use.
 * This MUST be called before any other MTE methods can be used, usually as soon as the website loads.
 */
export async function instantiateMteWasm(
  options: {
    licenseKey: string;
    licenseCompany: string;
  } & Partial<
    typeof cache & GenericSettings & EncoderSettings & DecoderSettings
  >
) {
  /**
   * If mteWasm is already instantiated, return true.
   * This prevents multiple instantiations of mteWasm.
   */
  if (mteWasm) {
    return true;
  }

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
  _SETTINGS.saveStateAs = options.saveStateAs || _SETTINGS.saveStateAs;
  _SETTINGS.encoderType = options.encoderType || _SETTINGS.encoderType;
  _SETTINGS.fixedLength = options.fixedLength || _SETTINGS.fixedLength;
  _SETTINGS.encoderOutput = options.encoderOutput || _SETTINGS.encoderOutput;
  _SETTINGS.decoderType = options.decoderType || _SETTINGS.decoderType;
  _SETTINGS.decoderOutput = options.decoderOutput || _SETTINGS.decoderOutput;
  _SETTINGS.timestampWindow =
    options.timestampWindow || _SETTINGS.timestampWindow;
  _SETTINGS.sequenceWindow = options.sequenceWindow || _SETTINGS.sequenceWindow;
  _SETTINGS.logMteState = options.logMteState || _SETTINGS.logMteState;

  // freeze this object to prevent changes to it after first instantiation
  Object.freeze(_SETTINGS);

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
type CreateEncoderDecoderOptions = {
  id: any;
  personalization: string;
  nonce: string | number;
  logMteState?: GenericSettings["logMteState"];
  entropy:
    | Uint8Array
    | {
        value: string;
        encoding: "B64" | "plaintext";
      };
};
export async function createMteEncoder(options: CreateEncoderDecoderOptions) {
  if (!mteWasm) {
    throw Error("MTE WASM must be instantiated before creating an encoder.");
  }

  // create new encoder
  const encoder = createMteEncoderCore({
    mteWasm,
    personalization: options.personalization,
    nonce: options.nonce,
    entropy: options.entropy,
  });

  // save encoder state
  const state = getMteState(encoder, _SETTINGS.saveStateAs);

  // log MTE state for debugging
  if (options.logMteState || _SETTINGS.logMteState) {
    console.log(`Encoder State: ${state}`);
  }

  // save mte state in cache
  await cache.saveState(options.id, state);

  // destroy encoder
  encoder.uninstantiate();
  encoder.destruct();
}

/**
 * Create a decoder using specific instantiation values.
 */
export async function createMteDecoder(options: CreateEncoderDecoderOptions) {
  if (!mteWasm) {
    throw Error("MTE WASM must be instantiated before creating a decoder.");
  }

  // create new decoder
  const decoder = createMteDecoderCore({
    mteWasm: mteWasm,
    personalization: options.personalization,
    nonce: options.nonce,
    entropy: options.entropy,
  });

  // save decoder state
  const state = getMteState(decoder, _SETTINGS.saveStateAs);

  // log MTE state for debugging
  if (options.logMteState || _SETTINGS.logMteState) {
    console.log(`Decoder State: ${state}`);
  }

  // save mte state
  await cache.saveState(options.id, state);

  // destroy decoder
  decoder.uninstantiate();
  decoder.destruct();
}

/**
 * MTE Encode a value
 */
type EncodeOptions<Output> = {
  id: any;
  output?: Output;
} & Partial<GenericSettings>;
type MteEncodeOptions<Type, Output> = {
  type?: Type;
} & EncodeOptions<Output>;
type FlenEncodeOptions<Output> = {
  type?: "FLEN";
  fixedLength: number;
} & EncodeOptions<Output>;
export function mteEncode(
  payload: string | Uint8Array,
  options: MteEncodeOptions<"MTE" | "MKE", "B64">
): Promise<string>;
export function mteEncode(
  payload: string | Uint8Array,
  options: MteEncodeOptions<"MTE" | "MKE", "Uint8Array">
): Promise<Uint8Array>;
export function mteEncode(
  payload: string | Uint8Array,
  options: FlenEncodeOptions<"B64">
): Promise<string>;
export function mteEncode(
  payload: string | Uint8Array,
  options: FlenEncodeOptions<"Uint8Array">
): Promise<Uint8Array>;
export async function mteEncode(
  payload: string | Uint8Array,
  options:
    | MteEncodeOptions<"MTE" | "MKE", "B64" | "Uint8Array">
    | FlenEncodeOptions<"B64" | "Uint8Array">
) {
  // check for passthrough
  if (options.passThrough || _SETTINGS.passThrough) {
    return payload;
  }

  // create an encoder
  const encoder = await (async () => {
    // check alive cache for encoder
    const aliveEncoder = takeAliveItem(options.id);
    if (aliveEncoder) {
      return aliveEncoder as MteEnc | MteFlenEnc | MteMkeEnc;
    }

    // get encoder state from cache
    const state = await cache.takeState<string | Uint8Array>(options.id);
    if (!state) {
      throw Error(`Encoder state not found with id "${options.id}"`);
    }

    // create encoder of the requested type
    let _encoder: MteEnc | MteFlenEnc | MteMkeEnc;
    const type = options.type || _SETTINGS.encoderType;
    switch (type) {
      case "MTE": {
        _encoder = MteEnc.fromdefault(mteWasm);
        break;
      }
      case "MKE": {
        _encoder = MteMkeEnc.fromdefault(mteWasm);
        break;
      }
      case "FLEN": {
        _encoder = MteFlenEnc.fromdefault(
          mteWasm,
          // @ts-ignore
          options.fixedLength || _SETTINGS.fixedLength
        );
        break;
      }
      default: {
        throw Error(
          `Unknown encoder type was request. Expected type of MTE, MKE, or FLEN, but received "${type}".`
        );
      }
    }

    // restore encoder from state
    restoreMteState(_encoder, state);

    return _encoder;
  })();

  // check if DRBG reseed is required
  const reseedIsRequired = isDrbgReseedRequired(encoder);
  if (reseedIsRequired) {
    throw Error(
      "DRBG reseed count is nearing the threshhold. Reseed is required."
    );
  }

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

  // keep encoder alive, or save state to cache
  await (async () => {
    if (options.keepAlive === Infinity) {
      keepItemAlive(options.id, encoder);
      return;
    }

    // get encoder state
    const state = getMteState(
      encoder,
      options.saveStateAs || _SETTINGS.saveStateAs
    );

    // log MTE state for debugging
    if (options.logMteState || _SETTINGS.logMteState) {
      console.log(`Encoder State: ${state}`);
    }

    // keepAlive, with timeout to move to cache storage
    if (options.keepAlive || _SETTINGS.keepAlive) {
      keepItemAlive(
        options.id,
        encoder,
        setTimeout(() => {
          cache
            .saveState(options.id, state)
            .then(() => {
              deleteAliveItem(options.id);
              encoder.uninstantiate();
              encoder.destruct();
            })
            .catch((err) => {
              console.error("Failed to save MTE state to cache.\n", err);
            });
        }, options.keepAlive || _SETTINGS.keepAlive)
      );
      return true;
    }

    // else, just save to state cache
    await cache.saveState(options.id, state);
    // destroy encoder
    encoder.uninstantiate();
    encoder.destruct();

    return true;
  })();

  // return result
  return "str" in encodeResult ? encodeResult.str : encodeResult.arr;
}

/**
 * MTE Decode a value
 */
type Options<T> = {
  type?: "MTE" | "MKE";
  id: any;
  output?: T;
  timestampWindow?: number;
  sequenceWindow?: number;
} & Partial<GenericSettings>;
export function mteDecode(
  payload: string | Uint8Array,
  options: Options<"str">
): Promise<string>;
export function mteDecode(
  payload: string | Uint8Array,
  options: Options<"Uint8Array">
): Promise<Uint8Array>;
export async function mteDecode(
  payload: string | Uint8Array,
  options: Options<"str" | "Uint8Array">
) {
  // check for passthrough
  if (options.passThrough || _SETTINGS.passThrough) {
    return payload;
  }

  // create a decoder
  const decoder = await (async () => {
    // check alive cache for decoder
    const aliveDecoder = takeAliveItem(options.id);
    if (aliveDecoder) {
      return aliveDecoder as MteDec | MteMkeDec;
    }

    // get decoder state from, cache
    const state = await cache.takeState<"string" | "Uint8Array">(options.id);
    if (!state) {
      throw Error(`Decoder state not found with id "${options.id}"`);
    }

    // create decoder of the requested type
    let _decoder: MteDec | MteMkeDec;
    const type = options.type || _SETTINGS.decoderType;
    const tsw = options.timestampWindow || _SETTINGS.timestampWindow;
    const sw = options.sequenceWindow || _SETTINGS.sequenceWindow;
    if (type === "MTE") {
      _decoder = MteDec.fromdefault(mteWasm, String(tsw), sw);
    } else {
      _decoder = MteMkeDec.fromdefault(mteWasm, String(tsw), sw);
    }

    // restore decoder from state
    restoreMteState(_decoder, state);

    return _decoder;
  })();

  // check if DRBG reseed is required
  const reseedIsRequired = isDrbgReseedRequired(decoder);
  if (reseedIsRequired) {
    throw Error(
      "DRBG reseed count is nearing the threshold. Reseed is required."
    );
  }

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

  // keep decoder alive, or save state to cache
  await (async () => {
    if (options.keepAlive === Infinity) {
      keepItemAlive(options.id, decoder);
      return;
    }

    // get decoder state
    const state = getMteState(
      decoder,
      options.saveStateAs || _SETTINGS.saveStateAs
    );

    // log MTE state for debugging
    if (options.logMteState || _SETTINGS.logMteState) {
      console.log(`Decoder State: ${state}`);
    }

    // keepAlive, with timeout to move to cache storage
    if (options.keepAlive || _SETTINGS.keepAlive) {
      keepItemAlive(
        options.id,
        decoder,
        setTimeout(() => {
          cache
            .saveState(options.id, state)
            .then(() => {
              deleteAliveItem(options.id);
              decoder.uninstantiate();
              decoder.destruct();
            })
            .catch((err) => {
              console.error("Failed to save MTE state to cache.\n", err);
            });
        }, options.keepAlive || _SETTINGS.keepAlive)
      );
      return true;
    }

    // else, just save to state cache
    await cache.saveState(options.id, state);
    // destroy decoder
    decoder.uninstantiate();
    decoder.destruct();

    return true;
  })();

  // return result
  return "str" in decodeResult ? decodeResult.str : decodeResult.arr;
}
