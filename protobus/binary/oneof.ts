import { OneofCase } from '../language/types';
import { Field, FieldType, Schema } from '../language/schema';

export type UnionizeProperties<T extends object> = T[keyof T];
export type Oneof<S extends Schema> = UnionizeProperties<{ [K in keyof S]: OneofCase<K, FieldType<S[K]>> }>;

export function oneof<S extends Schema>(schema: S): Field<Oneof<S>> {
  throw Error('Work in progress');
}
