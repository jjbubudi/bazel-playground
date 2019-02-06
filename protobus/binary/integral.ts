import { Int32, Uint32 } from '../language/types';
import { Field, Decoded } from '../language/schema';

export function decodeInt32(tag: number, offset: number, bytes: Readonly<Uint8Array>): Decoded<Int32> {
  const result = decodeUint32(tag, offset, bytes);
  result[0] = result[0] | 0;
  return result;
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
  return new Field<Uint32>(
    [tag],
    (data) => [0],
    decodeUint32
  );
}

export function int32Field(tag: number): Field<Int32> {
  return new Field<Int32>(
    [tag],
    (data) => [0],
    decodeInt32
  );
}

export function decodeBoolean(tag: number, offset: number, bytes: Readonly<Uint8Array>): Decoded<boolean> {
  const result = decodeUint32(tag, offset, bytes)[0] === 1 ? true : false;
  return [result, 1];
}

export function booleanField(tag: number): Field<boolean> {
  return new Field<boolean>(
    [tag],
    (data) => [0],
    decodeBoolean
  );
}
