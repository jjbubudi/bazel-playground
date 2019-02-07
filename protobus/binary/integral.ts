import { Int32, Uint32 } from '../language/types';
import { Field, Decoded, Encoded } from '../language/schema';

export function decodeInt32(tag: number, offset: number, bytes: Readonly<Uint8Array>): Decoded<Int32> {
  const result = decodeUint32(tag, offset, bytes);
  result[0] = result[0] | 0;
  return result;
}

export function encodeUint32(value: number): number[] {
  const bytes = [];
  while (value > 127) {
    bytes.push((value & 0x7f) | 0x80);
    value = value >>> 7;
  }
  bytes.push(value);
  return bytes;
}

export function decodeUint32(tag: number, offset: number, bytes: Readonly<Uint8Array>): Decoded<Uint32> {
  let pos = offset;
  let result = 0;
  let shift = 0;
  let bits: number;
  let numberOfBytes = 0;

  do {
    bits = bytes[pos++];
    result |= (bits & 0x7F) << shift;
    shift += 7;
    numberOfBytes++;
  } while ((bits & 0x80) !== 0);

  return [result >>> 0, numberOfBytes];
}

export function uint32Field(tag: number): Field<Uint32> {
  return {
    tag: [tag],
    encode: (data) => [tag, 0, ...encodeUint32(data)],
    decode: decodeUint32
  };
}

export function int32Field(tag: number): Field<Int32> {
  return {
    tag: [tag],
    encode: (data) => [0],
    decode: decodeInt32
  };
}

export function decodeBoolean(tag: number, offset: number, bytes: Readonly<Uint8Array>): Decoded<boolean> {
  const result = decodeUint32(tag, offset, bytes)[0] === 1 ? true : false;
  return [result, 1];
}

export function booleanField(tag: number): Field<boolean> {
  return {
    tag: [tag],
    encode: (data) => [0],
    decode: decodeBoolean
  };
}
