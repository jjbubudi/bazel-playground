import { oneof } from './oneof';
import { int32Field } from './integral';
import { FieldType } from '../language/schema';

describe('Oneof', () => {
  it('should decode oneof message', () => {
    const field = oneof({
      foo: int32Field(1),
      bar: int32Field(2)
    });
    [
      { fieldNumber: 1, bytes: [0x05], value: <FieldType<typeof field>>{ $case: 'foo', value: 5 } },
      { fieldNumber: 2, bytes: [0x96, 0x01], value: <FieldType<typeof field>>{ $case: 'bar', value: 150 } }
    ].forEach(({ fieldNumber, bytes, value }) => {
      expect(field.decode(fieldNumber, 0, new Uint8Array(bytes))).toEqual([value, bytes.length]);
    });
  });
});
