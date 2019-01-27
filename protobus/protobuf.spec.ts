import { ProtobufEncoder, ProtobufDecoder } from './protobuf';

describe('Encode and Decode', () => {

  it('should convert a positive int32', () => {
    const number = 12345;
    const encoder = new ProtobufEncoder();
    const decoder = new ProtobufDecoder();
    expect(decoder.decodeInt32(encoder.encodeInt32(number))).toBe(number);
  });

  it('should convert a negative int32', () => {
    const number = -12345;
    const encoder = new ProtobufEncoder();
    const decoder = new ProtobufDecoder();
    expect(decoder.decodeInt32(encoder.encodeInt32(number))).toBe(number);
  });

});
