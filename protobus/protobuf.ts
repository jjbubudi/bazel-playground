export class ProtobufEncoder {

  encodeUint32(value: number): Uint8Array {
    const byte1 = value & 0x7F | 0x80;
    if (byte1 <= 0x7F) {
      const result1 = new Uint8Array(1);
      result1[0] = byte1;
      return result1;
    }

    const byte2 = (value >>> 7) & 0x7F | 0x80;
    if (byte2 <= 0x7F) {
      const result2 = new Uint8Array(2);
      result2[0] = byte1;
      result2[1] = byte2;
      return result2;
    }

    const byte3 = (value >>> 14) & 0x7F | 0x80;
    if (byte3 <= 0x7F) {
      const result3 = new Uint8Array(3);
      result3[0] = byte1;
      result3[1] = byte2;
      result3[2] = byte3;
      return result3;
    }

    const byte4 = (value >>> 21) & 0x7F | 0x80;
    if (byte4 <= 0x7F) {
      const result4 = new Uint8Array(4);
      result4[0] = byte1;
      result4[1] = byte2;
      result4[2] = byte3;
      result4[3] = byte4;
      return result4;
    }

    const byte5 = (value >>> 28) & 0x7F | 0x80;
    const result5 = new Uint8Array(5);
    result5[0] = byte1;
    result5[1] = byte2;
    result5[2] = byte3;
    result5[3] = byte4;
    result5[4] = byte5;

    return result5;
  }

  encodeInt32(value: number): Uint8Array {
    if (value > 0) {
      return this.encodeUint32(value);
    }

    // https://developers.google.com/protocol-buffers/docs/encoding#types
    // If you use int32 or int64 as the type for a negative number,
    // the resulting varint is always 10 bytes long
    const bytes = new Uint8Array(10);

    let position = 0;
    while ((value & 0xFFFFFF80) !== 0) {
      bytes[position++] = (value & 0x7F) | 0x80;
      value >>>= 7;
    }
    bytes[position] = value & 0x7F;

    return bytes;
  }

  encodeBool(value: boolean): Uint8Array {
    return this.encodeUint32(value ? 1 : 0);
  }

  encodeSint32(value: number): Uint8Array {
    return this.encodeUint32((value << 1 ^ value >> 31) >>> 0);
  }
}

export class ProtobufDecoder {

  decodeUint32(bytes: Uint8Array): number {
    let pos = 0;
    let result = 0;
    let shift = 0;
    let bits: number;

    do {
      bits = bytes[pos++];
      result |= (bits & 0x7F) << shift;
      shift += 7;
    } while ((bits & 0x80) !== 0);

    return result >>> 0;
  }

  decodeInt32(bytes: Uint8Array): number {
    return this.decodeUint32(bytes) | 0;
  }

  decodeBool(bytes: Uint8Array): boolean {
    return this.decodeUint32(bytes) === 1 ? true : false;
  }

  decodeSint32(bytes: Uint8Array): number {
    const value = this.decodeUint32(bytes);
    return value >>> 1 ^ -(value & 1) | 0;
  }
}
