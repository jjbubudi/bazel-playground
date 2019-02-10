import { repeated } from './repeated';
import { uint32Field } from './integral';
import { WireType } from '../language/types';

describe('Repeated', () => {
  it('should encode', () => {
    const fieldNumber = 1;
    const field = repeated(fieldNumber, uint32Field);
    const bytes = field.encode([1, 2, 3, 4, 5]);
    expect(bytes).toEqual([fieldNumber, WireType.Delimited, [0x05, 0x01, 0x02, 0x03, 0x04, 0x05]]);
  });
});
