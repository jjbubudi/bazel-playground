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
  bool: repeated(1, booleanField),
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
  // 1, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, // Test.string
  (2 << 3) | 0, 0x96, 0x01, // Test.uint32
  (3 << 3) | 2, 0x1B, // Test.inner
    (1 << 3) | 0, 0x9A, 0x01, // Inner.int32
    (2 << 3) | 2, 0x08, // Inner.innerInner
      (1 << 3) | 0, 0x9C, 0x01, // InnerInner.int64
      (2 << 3) | 0, 0x01, // InnerInner.enum
      (3 << 3) | 0, 0x9D, 0x01, // InnerInner.sint32
    (3 << 3) | 2, 0x0C, // Inner.outer
      (1 << 3) | 2, 0x07, 0x01, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, // Outer.bool
      (2 << 3) | 0, 0x9F, 0x01, // Outer.double
  (4 << 3) | 0, 0x9B, 0x01 // Test.float
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

const testObject = Test.decode(testBytes);

const suite = new Benchmark.Suite();
suite
  .add('JSON decode', () => {
    JSON.parse(testJson);
  })
  .add('Protobuf decode', () => {
    Test.decode(testBytes);
  })
  .add('JSON encode', () => {
    JSON.stringify(testObject);
  })
  .add('Protobuf encode', () => {
    Test.encode(testObject);
  })
  .on('cycle', (event: Benchmark.Event) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    console.log(`Fastest is "${suite.filter('fastest').map((p: any) => p.name)}"`);
  })
  .run();
