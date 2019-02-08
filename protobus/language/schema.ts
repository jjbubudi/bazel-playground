import { ProtobufTypes } from './types';

export type Encoded = [number, ...number[]];
export type Encoder<T extends ProtobufTypes> = (data: T) => Encoded;

export type Decoded<T extends ProtobufTypes> = [T, number];
export type Decoder<T extends ProtobufTypes> =
  (fieldNumber: number, offset: number, bytes: Readonly<Uint8Array>, lastDecoded?: Readonly<T>) => Decoded<T>;

export interface Field<T extends ProtobufTypes> {
  readonly fieldNumbers: number[];
  readonly encode: Encoder<T>;
  readonly decode: Decoder<T>;
}

export interface Schema {
  readonly [key: string]: Field<any>;
}

export type FieldType<T extends Field<any>> = T extends Field<infer R> ? R : never;
export type ObjectType<T extends Schema> = { +readonly [K in keyof T]: FieldType<T[K]> };
