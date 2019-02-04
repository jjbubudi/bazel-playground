import { ObjectType, Decoded, Decoder, Field, Schema } from './language/schema';
import { decodeUint32 } from './binary/integral';

export type SchemaType<T extends CompiledSchema<any>> = T extends CompiledSchema<infer R> ? R : never;

export interface CompiledSchema<S extends Schema> {
  field(tag: number): Field<ObjectType<S>>;
  encode(o: ObjectType<S>): Uint8Array;
  decode(b: Readonly<Uint8Array>): ObjectType<S>;
}

export function protobufSchema<S extends Schema>(schema: S): CompiledSchema<S> {
  return new Protobus(schema);
}

class Protobus<S extends Schema> implements CompiledSchema<S> {

  private readonly tagToDecoder: Readonly<{ [tag: number]: Decoder<any> }>;
  private readonly tagToKey: Readonly<{ [tag: number]: string }>;

  constructor(schema: S) {
    this.tagToDecoder = (() => {
      const fields: { [index: number]: Decoder<any> } = {};
      for (const k in schema) {
        if (!schema.hasOwnProperty(k)) {
          continue;
        }
        fields[schema[k].tag] = schema[k].decode;
      }
      return fields;
    })();
    this.tagToKey = (() => {
      const tagToKey: { [index: number]: string } = {};
      for (const k in schema) {
        if (!schema.hasOwnProperty(k)) {
          continue;
        }
        tagToKey[schema[k].tag] = k;
      }
      return tagToKey;
    })();
  }

  field(tag: number): Field<ObjectType<S>> {
    const decode = this.decodeDelimited.bind(this);
    return new Field(
      tag,
      (data) => [0],
      decode
    );
  }

  encode(o: ObjectType<S>): Uint8Array {
    return new Uint8Array(0);
  }

  decodeDelimited(offset: number, b: Readonly<Uint8Array>): Decoded<ObjectType<S>> {
    const finalObject: { [index: string]: any } = {};
    const isDelimited = offset > 0;

    let messageLength: number;
    let sizeLength: number;

    if (isDelimited) {
      const d = decodeUint32(offset, b);
      messageLength = d[0];
      sizeLength = d[1];
    } else {
      messageLength = b.byteLength;
      sizeLength = 0;
    }

    const end = messageLength + offset;
    let cursor = offset + sizeLength;

    while (cursor < end) {
      const [key, keyLength] = decodeUint32(cursor, b);
      const decoder = this.tagToDecoder[key];
      const [data, numberOfBytes] = decoder(cursor + keyLength, b);
      finalObject[this.tagToKey[key]] = data;
      cursor += numberOfBytes + keyLength;
    }

    return [finalObject as ObjectType<S>, messageLength + sizeLength];
  }

  decode(b: Readonly<Uint8Array>): ObjectType<S> {
    return this.decodeDelimited(0, b)[0];
  }
}
