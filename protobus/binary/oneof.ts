import { OneofCase } from '../language/types';
import { Field, FieldType, Schema } from '../language/schema';

export type UnionizeProperties<T extends object> = T[keyof T];
export type Oneof<S extends Schema> = UnionizeProperties<{ [K in keyof S]: OneofCase<K, FieldType<S[K]>> }>;

export function oneof<S extends Schema>(schema: S): Field<Oneof<S>> {
  const tagToField: { [tag: number]: Field<any> } = {};
  const tagToKey: { [tag: number]: string } = {};
  const tags: number[] = [];

  for (const k in schema) {
    if (!schema.hasOwnProperty(k)) {
      continue;
    }
    tags.push(...schema[k].tag);
    for (let i = 0; i < schema[k].tag.length; i++) {
      tagToKey[schema[k].tag[i]] = k;
      tagToField[schema[k].tag[i]] = schema[k];
    }
  }

  return new Field<Oneof<S>>(
    tags,
    (data) => [0],
    (tag, offset, bytes) => {
      const [value, length] = tagToField[tag].decode(tag, offset, bytes);
      return [{
        type: tagToKey[tag],
        value: value
      } as Oneof<S>, length];
    }
  );
}
