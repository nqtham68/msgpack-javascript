import { ExtensionCodecType } from "./ExtensionCodec";
import { Decoder } from "./Decoder";

export type DecodeOptions = Partial<
  Readonly<{
    extensionCodec: ExtensionCodecType;

    /**
     * Maximum string length.
     * Default to 4_294_967_295 (UINT32_MAX).
     */
    maxStrLength: number;
    /**
     * Maximum binary length.
     * Default to 4_294_967_295 (UINT32_MAX).
     */
    maxBinLength: number;
    /**
     * Maximum array length.
     * Default to 4_294_967_295 (UINT32_MAX).
     */
    maxArrayLength: number;
    /**
     * Maximum map length.
     * Default to 4_294_967_295 (UINT32_MAX).
     */
    maxMapLength: number;
    /**
     * Maximum extension length.
     * Default to 4_294_967_295 (UINT32_MAX).
     */
    maxExtLength: number;
    /**
     * map key use to encode object key
     */
    mapKeys: string[];
  }>
>;

export const defaultDecodeOptions: DecodeOptions = {};

export function decode(buffer: ArrayLike<number>, options: DecodeOptions = defaultDecodeOptions): unknown {
  const decoder = new Decoder(
    options.extensionCodec,
    options.maxStrLength,
    options.maxBinLength,
    options.maxArrayLength,
    options.maxMapLength,
    options.maxExtLength,
    options.mapKeys,
  );
  decoder.setBuffer(buffer); // decodeSync() requires only one buffer
  return decoder.decodeOneSync();
}
