import { protobufSchema } from './protobus';
import { uint32Field, int32Field, booleanField } from './binary/integral';

describe('Encode and Decode', () => {
  it('should work', () => {
    const SimpleTest = protobufSchema({
      a: int32Field(1),
      b: int32Field(2),
      c: int32Field(3),
      d: int32Field(4),
      j: int32Field(5),
      k: uint32Field(6),
      l: booleanField(7),
      m: booleanField(8),
      n: booleanField(9)
    });
    const bytes = new Uint8Array(
      [
        1, 0x96, 0x01,
        2, 0x97, 0x01,
        3, 0x98, 0x01,
        4, 0x99, 0x01,
        5, 0x9A, 0x01,
        6, 0x9B, 0x01,
        7, 0x00,
        8, 0x01,
        9, 0x00
      ]
    );
    expect(SimpleTest.decode(bytes)).toEqual(
      {
        a: 150,
        b: 151,
        c: 152,
        d: 153,
        j: 154,
        k: 155,
        l: false,
        m: true,
        n: false
      }
    );
  });
});
