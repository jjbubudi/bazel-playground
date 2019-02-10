import { ProtobufTypes, WireType } from '../language/types';
import { Field } from '../language/schema';
import { decodeUint32, encodeUint32 } from './integral';

export function repeated<T extends ProtobufTypes>(
  fieldNumber: number,
  createField: (fieldNumber: number) => Field<T>): Field<T[]> {
  const field = createField(fieldNumber);
  const decode = field.decode;
  return {
    fieldNumbers: [fieldNumber],
    encode: (data) => {
      const encoded: number[] = [];
      let dataLength = 0;
      for (let i = 0; i < data.length; i++) {
        const e = field.encode(data[i])[2];
        encoded.push(...e);
        dataLength += e.length;
      }
      const length = encodeUint32(dataLength);
      length.push(...encoded);
      return [fieldNumber, WireType.Delimited, length];
    },
    decode: (_, offset, bytes, lastDecoded) => {
      const [size, sizeLength] = decodeUint32(offset, bytes);
      const results = lastDecoded !== undefined ? lastDecoded.slice() : [];
      let cursor = 0;

      while (cursor < size) {
        const [data, length] = decode(_, cursor + offset + sizeLength, bytes);
        results.push(data);
        cursor += length;
      }

      return [results, size + sizeLength];
    }
  };
}
