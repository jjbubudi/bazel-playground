import * as Benchmark from 'benchmark';
import { int32Field, booleanField, uint32Field } from '../binary/integral';
import { repeated } from '../binary/repeated';
import { protobufSchema } from '../protobus';

const InnerInner = protobufSchema({
  int64: int32Field(1),
  enum: uint32Field(2),
  sint32: int32Field(3),
});

const Outer = protobufSchema({
  bool: repeated(booleanField(1)),
  double: int32Field(2)
});

const Inner = protobufSchema({
  int32: int32Field(1),
  innerInner: InnerInner.field(2),
  outer: Outer.field(3)
});

const Test = protobufSchema({
  // string: stringField(1),
  uint32: uint32Field(2),
  inner: Inner.field(3),
  float: int32Field(4)
});

const testBytes = new Uint8Array([
  // 1, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, // string

  2, 0x96, 0x01, // uint32

  3, 0x1B, // Inner
  1, 0x9A, 0x01, // Inner.int32

  2, 0x08, // InnerInner
  1, 0x9C, 0x01, // InnerInner.int64
  2, 0x01, // InnerInner.enum
  3, 0x9D, 0x01, // InnerInner.sint32

  3, 0x0C, // Outer
  1, 0x07, 0x01, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, // Outer.bool
  2, 0x9F, 0x01, // Outer.double

  4, 0x9B, 0x01
]);

const testJson = `
{
  "string" : "Lorem ipsum dolor sit amet.",
  "uint32" : 150,
  "inner" : {
    "int32" : 20161110,
    "innerInner" : {
      "int64": 123456,
      "enum": 1,
      "sint32": -42
    },
    "outer" : {
      "bool" : [ true, false, false, true, false, false, true ],
      "double": 204.8
    }
  },
  "float": 0.25
}
`;

const suite = new Benchmark.Suite();

suite
  .add('JSON decode', () => {
    JSON.parse(testJson);
  })
  .add('Protobuf decode', () => {
    Test.decode(testBytes);
  })
  .on('cycle', (event: Benchmark.Event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    console.log(`Fastest is "${suite.filter('fastest').map((p: any) => p.name)}"`);
  })
  .run();
