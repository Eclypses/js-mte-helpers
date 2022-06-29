import { MteWasm, MteBase } from "mte";

export type MteState = string | Uint8Array;

export type DefaultSettings = {
  passThrough: boolean;
  keepAlive: number;
  useMkeAboveSize: number;
  stateType: "Uint8Array" | "B64";
  encoderType: "MKE" | "MTE" | "FLEN";
  fixedLength: number;
  decoderType: "MKE" | "MTE";
  encoderOutput: "Uint8Array" | "B64";
  decoderOutput: "Uint8Array" | "str";
  timestampWindow: number;
  sequenceWindow: number;
};
