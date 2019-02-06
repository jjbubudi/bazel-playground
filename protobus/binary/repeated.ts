import { ProtobufTypes } from '../language/types';
import { Field } from '../language/schema';

export function repeated<T extends ProtobufTypes>(field: Field<T>): Field<T[]> {
  const decode = field.decode;
  return new Field<T[]>(
    field.tag,
    (data) => [0],
    (tag, offset, bytes) => {
      const size = bytes[offset];
      const results = [];
      let cursor = 0;

      while (cursor < size) {
        const [data, length] = decode(tag, cursor + offset + 1, bytes);
        results.push(data);
        cursor += length;
      }

      return [results, size + 1];
    }
  );
}