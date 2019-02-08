import { ObjectType, Decoded, Decoder, Field, Schema, Encoder } from './language/schema';
import { decodeUint32, encodeUint32 } from './binary/integral';

export type SchemaType<T extends CompiledSchema<any>> = T extends CompiledSchema<infer R> ? R : never;

export interface CompiledSchema<S extends Schema> {
  field(fieldNumber: number): Field<ObjectType<S>>;
  encode(object: ObjectType<S>): Uint8Array;
  decode(bytes: Readonly<Uint8Array>): ObjectType<S>;
}

export function protobufSchema<S extends Schema>(schema: S): CompiledSchema<S> {
  return new Protobus(schema);
}

class Protobus<S extends Schema> implements CompiledSchema<S> {

  private readonly fieldNumberToDecoder: Readonly<{ [fieldNumber: number]: Decoder<any> }>;
  private readonly fieldNumberToKey: Readonly<{ [fieldNumber: number]: string }>;
  private readonly keyToEncoder: Readonly<{ [key: string]: Encoder<any> }>;
  private readonly keys: Readonly<string[]>;

  constructor(schema: S) {
    const fieldNumberToDecoder: { [fieldNumber: number]: Decoder<any> } = {};
    const fieldNumberToKey: { [fieldNumber: number]: string } = {};
    const keyToEncoder: { [key: string]: Encoder<any> } = {};
    const keys: string[] = [];

    for (const k in schema) {
      if (!schema.hasOwnProperty(k)) {
        continue;
      }
      for (let i = 0; i < schema[k].fieldNumbers.length; i++) {
        fieldNumberToKey[schema[k].fieldNumbers[i]] = k;
        fieldNumberToDecoder[schema[k].fieldNumbers[i]] = schema[k].decode;
      }
      keyToEncoder[k] = schema[k].encode;
      keys.push(k);
    }

    this.fieldNumberToDecoder = fieldNumberToDecoder;
    this.fieldNumberToKey = fieldNumberToKey;
    this.keyToEncoder = keyToEncoder;
    this.keys = keys;
  }

  field(fieldNumber: number): Field<ObjectType<S>> {
    const decode = this.decodeDelimited.bind(this);
    return {
      fieldNumbers: [fieldNumber],
      encode: (data) => [0],
      decode: (_, offset, bytes, lastDecoded) => decode(offset, bytes, lastDecoded)
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

  decodeDelimited(offset: number, bytes: Readonly<Uint8Array>, lastDecoded?: ObjectType<S>): Decoded<ObjectType<S>> {
    const finalObject: { [index: string]: any } = lastDecoded !== undefined ? { ...lastDecoded as object } : {};
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
      const [tag, tagLength] = decodeUint32(cursor, bytes);
      const fieldNumber = tag >>> 3;
      const decoder = this.fieldNumberToDecoder[fieldNumber];

      const key = this.fieldNumberToKey[fieldNumber];
      const [data, dataLength] = decoder(fieldNumber, cursor + tagLength, bytes, finalObject[key]);

      finalObject[key] = data;
      cursor += dataLength + tagLength;
    }

    return [finalObject as ObjectType<S>, messageLength + sizeLength];
  }

  decode(bytes: Readonly<Uint8Array>): ObjectType<S> {
    return this.decodeDelimited(0, bytes)[0];
  }
}
