import { OneofCase } from '../language/types';
import { Field, FieldType, Schema, Decoder } from '../language/schema';

export type UnionizeProperties<T extends object> = T[keyof T];
export type Oneof<S extends Schema> = UnionizeProperties<{ [K in keyof S]: OneofCase<K, FieldType<S[K]>> }>;

export function oneof<S extends Schema>(schema: S): Field<Oneof<S>> {
  const tagToDecoder: { [tag: number]: Decoder<any> } = {};
  const tagToKey: { [tag: number]: string } = {};
  const tags: number[] = [];

  for (const k in schema) {
    if (!schema.hasOwnProperty(k)) {
      continue;
    }
    tags.push(...schema[k].tag);
    for (let i = 0; i < schema[k].tag.length; i++) {
      tagToKey[schema[k].tag[i]] = k;
      tagToDecoder[schema[k].tag[i]] = schema[k].decode;
    }
  }

  return {
    tag: tags,
    encode: (data) => [0],
    decode: (tag, offset, bytes) => {
      const [value, length] = tagToDecoder[tag](tag, offset, bytes);
      return [{
        type: tagToKey[tag],
        value: value
      } as Oneof<S>, length];
    }
  };
}
