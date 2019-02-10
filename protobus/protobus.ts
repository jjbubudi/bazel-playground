import { ObjectType, Decoded, Decoder, Field, Schema, Encoder } from './language/schema';
import { decodeUint32, encodeUint32 } from './binary/integral';
import { WireType } from './language/types';

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

  private readonly decoders: Readonly<{ [fieldNumber: number]: Decoder<any> }>;
  private readonly getters: Readonly<{ [fieldNumber: number]: (object: object) => any }>;
  private readonly setters: Readonly<{ [fieldNumber: number]: (object: object, value: any) => void }>;
  private readonly encoders: Readonly<{ [key: string]: Encoder<any> }>;

  constructor(schema: S) {
    const decoders: { [fieldNumber: number]: Decoder<any> } = {};
    const getters: { [fieldNumber: number]: () => any } = {};
    const setters: { [fieldNumber: number]: (value: any) => void } = {};
    const encoders: { [key: string]: Encoder<any> } = {};

    for (const k in schema) {
      if (!schema.hasOwnProperty(k)) {
        continue;
      }
      const field = schema[k];
      for (let i = 0; i < schema[k].fieldNumbers.length; i++) {
        const fieldNumber = field.fieldNumbers[i];
        decoders[fieldNumber] = field.decode;
        getters[fieldNumber] = new Function('proto', `return proto.${k};`) as any;
        setters[fieldNumber] = new Function('proto', 'value', `proto.${k} = value;`) as any;
      }
      encoders[k] = field.encode;
    }

    this.decoders = decoders;
    this.getters = getters;
    this.setters = setters;
    this.encoders = encoders;
  }

  field(fieldNumber: number): Field<ObjectType<S>> {
    return {
      fieldNumbers: [fieldNumber],
      encode: (data) => {
        const encoded = this.encodeDynamic(data, (dataLength) => new Array(dataLength));
        const length = encodeUint32(encoded.length);
        length.push(...encoded);
        return [fieldNumber, WireType.Delimited, length];
      },
      decode: (_, offset, bytes, lastDecoded) => this.decodeDelimited(offset, bytes, lastDecoded)
    };
  }

  encodeDynamic<T extends Uint8Array | number[]>(object: ObjectType<S>, f: (dataLength: number) => T): T {
    const encoded: number[][] = [];
    const tags: number[][] = [];
    const keys = Object.keys(this.encoders);
    let dataLength = 0;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const [fieldNumber, wireType, data] = this.encoders[key](object[key]);
      const tag = encodeUint32((fieldNumber << 3) | wireType);
      tags.push(tag);
      encoded.push(data);
      dataLength += (tag.length + data.length);
    }

    const bytes = f(dataLength);
    let cursor = 0;

    for (let i = 0; i < keys.length; i++) {
        const tag = tags[i];
        const data = encoded[i];
        for (let j = 0; j < tag.length; j++) {
          bytes[cursor++] = tag[j];
        }
        for (let k = 0; k < data.length; k++) {
          bytes[cursor++] = data[k];
        }
    }

    return bytes;
  }

  encode(object: ObjectType<S>): Uint8Array {
    return this.encodeDynamic(object, (dataLength) => new Uint8Array(dataLength));
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

      const decoder = this.decoders[fieldNumber];
      const existing = this.getters[fieldNumber](finalObject);
      const [data, dataLength] = decoder(fieldNumber, cursor + tagLength, bytes, existing);

      this.setters[fieldNumber](finalObject, data);
      cursor += dataLength + tagLength;
    }

    return [finalObject as ObjectType<S>, messageLength + sizeLength];
  }

  decode(bytes: Readonly<Uint8Array>): ObjectType<S> {
    return this.decodeDelimited(0, bytes)[0];
  }
}
