import { deepStrictEqual } from "assert";
import { encode, decode } from "@msgpack/msgpack";

describe("map-key", () => {
  context("mapkey", () => {
    it("runs", () => {
      const object = {
        x: 10.983049823049820384023,
        y: 102,
        key: "some key"
      };

      const mapkey = ['x', 'y']

      const encoded = encode(object, { mapKeys: mapkey });
      // encoded is an Uint8Array instance
      deepStrictEqual(decode(encoded, { mapKeys: mapkey }), object);
    });
  });
});