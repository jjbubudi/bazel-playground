import { ObjectType, Decoded, Decoder, Field, Schema, Encoder } from './language/schema';
import { decodeUint32, encodeUint32 } from './binary/integral';

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
  private readonly keyToEncoder: Readonly<{ [key: string]: Encoder<any> }>;
  private readonly keys: Readonly<string[]>;

  constructor(schema: S) {
    const tagToDecoder: { [tag: number]: Decoder<any> } = {};
    const tagToKey: { [tag: number]: string } = {};
    const keyToEncoder: { [key: string]: Encoder<any> } = {};
    const keys: string[] = [];

    for (const k in schema) {
      if (!schema.hasOwnProperty(k)) {
        continue;
      }
      for (let i = 0; i < schema[k].tag.length; i++) {
        tagToKey[schema[k].tag[i]] = k;
        tagToDecoder[schema[k].tag[i]] = schema[k].decode;
      }
      keyToEncoder[k] = schema[k].encode;
      keys.push(k);
    }

    this.tagToDecoder = tagToDecoder;
    this.tagToKey = tagToKey;
    this.keyToEncoder = keyToEncoder;
    this.keys = keys;
  }

  field(tag: number): Field<ObjectType<S>> {
    const decode = this.decodeDelimited.bind(this);
    return {
      tag: [tag],
      encode: (data) => [0],
      decode: (_, offset, bytes) => decode(offset, bytes)
    };
  }

  encode(o: ObjectType<S>): Uint8Array {
    const encoded: number[] = [];
    const keysLength = this.keys.length;

    for (let i = 0; i < keysLength; i++) {
      const key = this.keys[i];
      const [fieldNumber, wireType, ...data] = this.keyToEncoder[key](o[key]);
      const tag = encodeUint32((fieldNumber << 3) | wireType);
      encoded.push(...tag);
      encoded.push(...data);
    }

    const length = encoded.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = encoded[i];
    }

    return bytes;
  }

  decodeDelimited(offset: number, bytes: Readonly<Uint8Array>): Decoded<ObjectType<S>> {
    const finalObject: { [index: string]: any } = {};
    const isDelimited = offset > 0;

    let messageLength: number;
    let sizeLength: number;

    if (isDelimited) {
      const d = decodeUint32(offset, bytes);
      messageLength = d[0];
      sizeLength = d[1];
    } else {
      messageLength = bytes.byteLength;
      sizeLength = 0;
    }

    const end = messageLength + offset;
    let cursor = offset + sizeLength;

    while (cursor < end) {
      const [key, keyLength] = decodeUint32(cursor, bytes);
      const decoder = this.tagToDecoder[key];
      const [data, dataLength] = decoder(key, cursor + keyLength, bytes);
      finalObject[this.tagToKey[key]] = data;
      cursor += dataLength + keyLength;
    }

    return [finalObject as ObjectType<S>, messageLength + sizeLength];
  }

  decode(bytes: Readonly<Uint8Array>): ObjectType<S> {
    return this.decodeDelimited(0, bytes)[0];
  }
}
