import { protobufSchema } from './protobus';
import { uint32Field, int32Field, booleanField } from './binary/integral';

describe('Encode and Decode', () => {

  it('should work', () => {
    const SimpleTest = protobufSchema({
      a: int32Field(1),
      b: uint32Field(2),
      c: booleanField(3)
    });
    const bytes = new Uint8Array([
      1, 0x96, 0x01,
      2, 0x97, 0x01,
      3, 0x01
    ]);
    expect(SimpleTest.decode(bytes)).toEqual({
      a: 150,
      b: 151,
      c: true
    });
  });

  it('should work for nested message', () => {
    const Inner = protobufSchema({
      inside: int32Field(1)
    });
    const Outer = protobufSchema({
      outside: booleanField(1),
      inner: Inner.field(2)
    });
    const bytes = new Uint8Array([
      1, 0x00,
      2, 0x03, 1, 0x96, 0x01
    ]);
    expect(Outer.decode(bytes)).toEqual({
      outside: false,
      inner: {
        inside: 150
      }
    });
  });
});
