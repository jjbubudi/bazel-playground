const DIGITS = [
  '0', '1', '2', '3', '4', '5', '6', '7',
  '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
];
const TWO_TO_32 = 0x100000000;
const MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;

export class UInt64 {

  static readonly ZERO: UInt64 = UInt64.fromNumber(0);

  readonly low: number;
  readonly high: number;

  constructor(low: number, high: number) {
    this.low = low;
    this.high = high;
  }

  static fromNumber(value: number): UInt64 {
    // JavaScript always uses 32-bit signed integer for bitwise operations
    // and will drop all extra bits.
    // Doing a zero right shift will automatically give us the exact 32 low bits we need
    const low = value >>> 0;
    const high = Math.floor((value - low) / TWO_TO_32) >>> 0;
    return new UInt64(low, high);
  }

  static fromString(s: string): UInt64 {
    // We can avoid very expensive multiply based code path for some common cases.
    const numberValue = +s;
    if (numberValue <= MAX_SAFE_INTEGER) {
      return UInt64.fromNumber(numberValue);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated multiply.
    let result = UInt64.ZERO;

    for (let i = 0; i < s.length; i += 8) {
      const size = Math.min(8, s.length - i);
      const value = +s.substring(i, i + size);
      if (size < 8) {
        const power = UInt64.fromNumber(Math.pow(10, size));
        result = add(multiply(result, power), UInt64.fromNumber(value));
      } else {
        result = add(multiply(result, UInt64.fromNumber(1e8)), UInt64.fromNumber(value));
      }
    }

    return result;
  }

  unsafeToNumber(): number {
    return this.high * TWO_TO_32 + this.low;
  }

  toString(): string {
    // Skip the expensive conversion if the number is small enough to use the
    // built-in conversions.
    if (this.high <= 0x1FFFFF) {
      return '' + this.unsafeToNumber();
    }

    // What this code is doing is essentially converting the input number from
    // base-2 to base-1e7, which allows us to represent the 64-bit range with
    // only 3 (very large) digits. Those digits are then trivial to convert to
    // a base-10 string.

    // The magic numbers used here are -
    // 2^24 = 16777216 = (1,6777216) in base-1e7.
    // 2^48 = 281474976710656 = (2,8147497,6710656) in base-1e7.

    // Split 32:32 representation into 16:24:24 representation so our
    // intermediate digits don't overflow.
    const low = this.low & 0xFFFFFF;
    const mid = (((this.low >>> 24) | (this.high << 8)) >>> 0) & 0xFFFFFF;
    const high = (this.high >> 16) & 0xFFFF;

    // Assemble our three base-1e7 digits, ignoring carries. The maximum
    // value in a digit at this step is representable as a 48-bit integer, which
    // can be stored in a 64-bit floating point number.
    let digitA = low + (mid * 6777216) + (high * 6710656);
    let digitB = mid + (high * 8147497);
    let digitC = (high * 2);

    // Apply carries from A to B and from B to C.
    const base = 1e7;
    if (digitA >= base) {
      digitB += Math.floor(digitA / base);
      digitA %= base;
    }

    if (digitB >= base) {
      digitC += Math.floor(digitB / base);
      digitB %= base;
    }

    // Convert base-1e7 digits to base-10, omitting leading zeroes.
    let start = false;
    let result = '';

    function emit(digit: number) {
      let temp = base;
      for (let i = 0; i < 7; i++) {
        temp /= 10;
        const decimalDigit = ((digit / temp) % 10) >>> 0;
        if ((decimalDigit === 0) && !start) {
          continue;
        }
        start = true;
        result += DIGITS[decimalDigit];
      }
    }

    if (digitC || start) {
      emit(digitC);
    }
    if (digitB || start) {
      emit(digitB);
    }
    if (digitA || start) {
      emit(digitA);
    }

    return result;
  }
}

export class Int64 {

  readonly low: number;
  readonly high: number;

  constructor(low: number, high: number) {
    this.low = low;
    this.high = high;
  }

  static fromNumber(value: number): Int64 {
    // Here, we are just mimicing what UInt64 does
    // We don't need to explicitly handle the sign
    // because they are just bits
    const low = value >>> 0;
    const high = Math.floor((value - low) / TWO_TO_32) >>> 0;
    return new Int64(low, high);
  }

  static fromString(s: string): Int64 {
    const isNegative = (s.length > 0 && s[0] === '-');
    const numberString = isNegative ? s.substring(1) : s;
    const unsigned = UInt64.fromString(numberString);
    const signed = isNegative ? subtract(UInt64.ZERO, unsigned) : unsigned;
    return new Int64(signed.low, signed.high);
  }

  unsafeToNumber(): number {
    const isNegative = (this.high & 0x80000000);
    const unsigned = isNegative
      ? subtract(UInt64.ZERO, new UInt64(this.low, this.high))
      : new UInt64(this.low, this.high);
    const sign = isNegative ? -1 : 1;
    return sign * unsigned.unsafeToNumber();
  }

  toString(): string {
    const isNegative = (this.high & 0x80000000);
    const unsigned = isNegative
      ? subtract(UInt64.ZERO, new UInt64(this.low, this.high))
      : new UInt64(this.low, this.high);
    return (isNegative ? '-' : '') + unsigned.toString();
  }
}

// Although these functions look useful, we intentionally hide these and only support
// simple conversion in our public API. Users who want to manipulate the Long should
// consider taking the bits and use other libraries instead

function add(a: UInt64, b: UInt64): UInt64 {
  const low = ((a.low + b.low) & 0xFFFFFFFF) >>> 0;
  const high =
    (((a.high + b.high) & 0xFFFFFFFF) >>> 0) +
    (((a.low + b.low) >= 0x100000000) ? 1 : 0);
  return new UInt64(low >>> 0, high >>> 0);
}

function subtract(a: UInt64, b: UInt64): UInt64 {
  const low = ((a.low - b.low) & 0xFFFFFFFF) >>> 0;
  const high =
    (((a.high - b.high) & 0xFFFFFFFF) >>> 0) -
    (((a.low - b.low) < 0) ? 1 : 0);
  return new UInt64(low >>> 0, high >>> 0);
}

function multiply(a: UInt64, b: UInt64): UInt64 {
  // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
  // We can skip products that would overflow.
  const a48 = a.high >>> 16;
  const a32 = a.high & 0xFFFF;
  const a16 = a.low >>> 16;
  const a00 = a.low & 0xFFFF;

  const b48 = b.high >>> 16;
  const b32 = b.high & 0xFFFF;
  const b16 = b.low >>> 16;
  const b00 = b.low & 0xFFFF;

  let c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 * b00;
  c16 += c00 >>> 16;
  c00 &= 0xFFFF;
  c16 += a16 * b00;
  c32 += c16 >>> 16;
  c16 &= 0xFFFF;
  c16 += a00 * b16;
  c32 += c16 >>> 16;
  c16 &= 0xFFFF;
  c32 += a32 * b00;
  c48 += c32 >>> 16;
  c32 &= 0xFFFF;
  c32 += a16 * b16;
  c48 += c32 >>> 16;
  c32 &= 0xFFFF;
  c32 += a00 * b32;
  c48 += c32 >>> 16;
  c32 &= 0xFFFF;
  c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
  c48 &= 0xFFFF;

  return new UInt64((c16 << 16) | c00, (c48 << 16) | c32);
}
