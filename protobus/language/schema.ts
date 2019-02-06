import { ProtobufTypes } from './types';

export class Field<T extends ProtobufTypes> {
  constructor(
    readonly tag: number[],
    readonly encode: Encoder<T>,
    readonly decode: Decoder<T>
  ) { }
}

export interface Schema {
  readonly [key: string]: Field<any>;
}

export type FieldType<T extends Field<any>> = T extends Field<infer R> ? R : never;
export type ObjectType<T extends Schema> = { +readonly [K in keyof T]: FieldType<T[K]> };

export type Encoded = [number, ...number[]];
export type Encoder<T extends ProtobufTypes> = (data: T) => Encoded;

export type Decoded<T extends ProtobufTypes> = [T, number];
export type Decoder<T extends ProtobufTypes> = (tag: number, offset: number, bytes: Readonly<Uint8Array>) => Decoded<T>;