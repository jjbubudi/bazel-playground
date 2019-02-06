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
      { tag: 1, bytes: [0x05], value: <FieldType<typeof field>>{ $case: 'foo', value: 5 } },
      { tag: 2, bytes: [0x96, 0x01], value: <FieldType<typeof field>>{ $case: 'bar', value: 150 } }
    ].forEach(({ tag, bytes, value }) => {
      expect(field.decode(tag, 0, new Uint8Array(bytes))).toEqual([value, bytes.length]);
    });
  });
});
