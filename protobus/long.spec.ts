import { Int64, UInt64 } from './long';

describe('Lossless 64 bit integers', () => {

  it('should convert strings to unsigned 64 bit integers', () => {
    expect(UInt64.fromString('12345678912345').toString()).toBe('12345678912345');
  });

  it('should convert strings to signed 64 bit integers', () => {
    expect(Int64.fromString('12345678912345').toString()).toBe('12345678912345');
  });

  it('should convert strings to negative signed 64 bit integers', () => {
    expect(Int64.fromString('-234567890123456').toString()).toBe('-234567890123456');
  });

});
