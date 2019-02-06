import { decodeUint32, decodeBoolean } from './integral';

describe('Integral encode and decode', () => {

  describe('Uint32', () => {
    it('should decode varint into Uint32 and return its corresponding length', () => {
      [
        { bytes: [0x05], value: 5, length: 1 },
        { bytes: [0x96, 0x01], value: 150, length: 2 }
      ].forEach(({ bytes, value, length }) => {
        expect(decodeUint32(1, 0, new Uint8Array(bytes))).toEqual([value, length]);
      });
    });

    it('should start decoding from the given offset', () => {
      const bytes = new Uint8Array([0x01, 0x01, 0x01, 0x05]);
      expect(decodeUint32(1, 3, bytes)).toEqual([5, 1]);
    });
  });

  describe('Boolean', () => {
    it('should decode varint into Boolean and return its corresponding length', () => {
      [
        { bytes: [0x01], value: true, length: 1 },
        { bytes: [0x00], value: false, length: 1 }
      ].forEach(({ bytes, value, length }) => {
        expect(decodeBoolean(1, 0, new Uint8Array(bytes))).toEqual([value, length]);
      });
    });

    it('should start decoding from the given offset', () => {
      const bytes = new Uint8Array([0x99, 0x99, 0x01]);
      expect(decodeBoolean(1, 2, bytes)).toEqual([true, 1]);
    });
  });

});
