import { Int32, Uint32, WireType } from '../language/types';
import { Field, Decoded } from '../language/schema';

export function encodeUint32(value: number): number[] {
  const bytes = [];
  while (value > 127) {
    bytes.push((value & 0x7f) | 0x80);
    value = value >>> 7;
  }
  bytes.push(value);
  return bytes;
}

export function decodeUint32(offset: number, bytes: Readonly<Uint8Array>): Decoded<Uint32> {
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

export function uint32Field(fieldNumber: number): Field<Uint32> {
  return {
    fieldNumbers: [fieldNumber],
    encode: (data) => [fieldNumber, WireType.Varint, encodeUint32(data)],
    decode: (_, offset, bytes) => decodeUint32(offset, bytes)
  };
}

export function int32Field(fieldNumber: number): Field<Int32> {
  return {
    fieldNumbers: [fieldNumber],
    encode: (data) => [0, 0, []],
    decode: (_, offset, bytes) => {
      const result = decodeUint32(offset, bytes);
      result[0] = result[0] | 0;
      return result;
    }
  };
}

export function booleanField(fieldNumber: number): Field<boolean> {
  return {
    fieldNumbers: [fieldNumber],
    encode: (data) => [fieldNumber, WireType.Varint, [data ? 1 : 0]],
    decode: (_, offset, bytes) => [!!decodeUint32(offset, bytes)[0], 1]
  };
}
