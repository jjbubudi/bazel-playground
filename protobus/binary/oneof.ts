import { OneofCase } from '../language/types';
import { Field, FieldType, Schema, Decoder } from '../language/schema';

export type UnionizeProperties<T extends object> = T[keyof T];
export type Oneof<S extends Schema> = UnionizeProperties<{ [K in keyof S]: OneofCase<K, FieldType<S[K]>> }>;

export function oneof<S extends Schema>(schema: S): Field<Oneof<S>> {
  const fieldNumberToDecoder: { [fieldNumber: number]: Decoder<any> } = {};
  const fieldNumberToKey: { [fieldNumber: number]: string } = {};
  const fieldNumbers: number[] = [];

  for (const k in schema) {
    if (!schema.hasOwnProperty(k)) {
      continue;
    }
    fieldNumbers.push(...schema[k].fieldNumbers);
    for (let i = 0; i < schema[k].fieldNumbers.length; i++) {
      fieldNumberToKey[schema[k].fieldNumbers[i]] = k;
      fieldNumberToDecoder[schema[k].fieldNumbers[i]] = schema[k].decode;
    }
  }

  return {
    fieldNumbers: fieldNumbers,
    encode: (data) => [0, 0, []],
    decode: (fieldNumber, offset, bytes) => {
      const [value, length] = fieldNumberToDecoder[fieldNumber](fieldNumber, offset, bytes);
      return [{
        $case: fieldNumberToKey[fieldNumber],
        value: value
      } as Oneof<S>, length];
    }
  };
}
