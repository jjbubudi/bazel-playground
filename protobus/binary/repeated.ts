import { ProtobufTypes } from '../language/types';
import { Field } from '../language/schema';
import { decodeUint32 } from './integral';

export function repeated<T extends ProtobufTypes>(field: Field<T>): Field<T[]> {
  const decode = field.decode;
  return {
    fieldNumbers: field.fieldNumbers,
    encode: (data) => [0, 0, []],
    decode: (fieldNumber, offset, bytes, lastDecoded) => {
      const [size, sizeLength] = decodeUint32(offset, bytes);
      const results = lastDecoded !== undefined ? lastDecoded.slice() : [];
      let cursor = 0;

      while (cursor < size) {
        const [data, length] = decode(fieldNumber, cursor + offset + sizeLength, bytes);
        results.push(data);
        cursor += length;
      }

      return [results, size + sizeLength];
    }
  };
}
