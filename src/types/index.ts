import { MteEnc, MteFlenEnc, MteMkeEnc, MteDec, MteMkeDec } from "mte";

export type MteState = string | Uint8Array;

export type EncoderSettings = {
  encoderType: "MKE" | "MTE" | "FLEN";
  fixedLength: number;
  encoderOutput: "Uint8Array" | "B64";
};

export type DecoderSettings = {
  decoderType: "MKE" | "MTE";
  decoderOutput: "Uint8Array" | "str";
  timestampWindow: number;
  sequenceWindow: number;
};

export type GenericSettings = {
  passThrough: boolean;
  keepAlive: number;
  saveStateAs: "Uint8Array" | "B64";
};

export type EncDec = MteEnc | MteFlenEnc | MteMkeEnc | MteDec | MteMkeDec;
