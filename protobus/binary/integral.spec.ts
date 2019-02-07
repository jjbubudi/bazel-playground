import { decodeUint32, encodeUint32 } from './integral';

describe('Integral encode and decode', () => {

  describe('Uint32', () => {
    it('should decode varint into Uint32 and return its corresponding length', () => {
      [
        { bytes: [0x05], value: 5 },
        { bytes: [0x96, 0x01], value: 150 },
        { bytes: [0xAC, 0x02], value: 300 }
      ].forEach(({ bytes, value }) => {
        expect(decodeUint32(0, new Uint8Array(bytes))).toEqual([value, bytes.length]);
      });
    });

    it('should start decoding from the given offset', () => {
      const bytes = new Uint8Array([0x01, 0x01, 0x01, 0x05]);
      expect(decodeUint32(3, bytes)).toEqual([5, 1]);
    });

    it('should encode correctly', () => {
      [
        { number: 0, bytes: [0x00] },
        { number: 8, bytes: [0x08] },
        { number: 150, bytes: [0x96, 0x01] },
        { number: 300, bytes: [0xAC, 0x02] }
      ].forEach(({ number, bytes }) => {
        expect(encodeUint32(number)).toEqual(bytes);
      });
    });
  });

  // describe('Boolean', () => {
  //   it('should decode varint into Boolean and return its corresponding length', () => {
  //     [
  //       { bytes: [0x01], value: true },
  //       { bytes: [0x00], value: false }
  //     ].forEach(({ bytes, value }) => {
  //       expect(decodeBoolean(0, new Uint8Array(bytes))).toEqual([value, 1]);
  //     });
  //   });

  //   it('should start decoding from the given offset', () => {
  //     const bytes = new Uint8Array([0x99, 0x99, 0x01]);
  //     expect(decodeBoolean(2, bytes)).toEqual([true, 1]);
  //   });
  // });
});
