import { protobufSchema } from './protobus';
import { uint32Field, int32Field, booleanField } from './binary/integral';
import { repeated } from './binary/repeated';

describe('Encode and Decode', () => {

  it('should work', () => {
    const SimpleTest = protobufSchema({
      a: int32Field(1),
      b: uint32Field(2),
      c: booleanField(3)
    });
    const bytes = new Uint8Array([
      0x08, 0x96, 0x01,
      0x10, 0x97, 0x01,
      0x18, 0x01
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
      0x08, 0x00,
      0x12, 0x03, 0x08, 0x96, 0x01
    ]);
    expect(Outer.decode(bytes)).toEqual({
      outside: false,
      inner: {
        inside: 150
      }
    });
  });

  it('should merge objects together if there are duplicate keys', () => {
    const Inner = protobufSchema({
      list: repeated(uint32Field(1))
    });
    const Test = protobufSchema({
      inner: Inner.field(1)
    });
    const bytes = new Uint8Array([
      0x0A, 0x05,
        0x0A, 0x03, 0x01, 0x02, 0x03,
      0x0A, 0x04,
        0x0A, 0x02, 0x04, 0x05
    ]);
    expect(Test.decode(bytes)).toEqual({
      inner: {
        list: [1, 2, 3, 4, 5]
      }
    });
  });

  it('should encode', () => {
    const Test = protobufSchema({
      a: uint32Field(1)
    });
    expect(Test.encode({a: 150})).toEqual(new Uint8Array([0x08, 0x96, 0x01]));
  });
});
