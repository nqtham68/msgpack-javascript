import { ExtensionCodecType } from "./ExtensionCodec";
import { Encoder } from "./Encoder";

export type EncodeOptions = Partial<
  Readonly<{
    extensionCodec: ExtensionCodecType;
    maxDepth: number;
    initialBufferSize: number;
    sortKeys: boolean;
    mapKeys: string[];
  }>
>;

const defaultEncodeOptions = {};

export function encode(value: unknown, options: EncodeOptions = defaultEncodeOptions): Uint8Array {
  const encoder = new Encoder(options.extensionCodec, options.maxDepth, options.initialBufferSize, options.sortKeys, options.mapKeys);
  encoder.encode(value, 1);
  return encoder.getUint8Array();
}
