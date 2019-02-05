export type Double = number;
export type Float = number;
export type Int32 = number;
export type Int64 = Long;
export type Uint32 = number;
export type Uint64 = Long;
export type Sint32 = number;
export type Sint64 = Long;
export type Fixed32 = number;
export type Fixed64 = Long;
export type Sfixed32 = number;
export type Sfixed64 = Long;
export type Bytes = Uint8Array;

export interface Long {
  readonly low: Uint32;
  readonly high: Uint32;
  toString(): string;
  unsafeToNumber(): number;
}

export type ProtobufTypes =
  Double
  | Float
  | Int32
  | Int64
  | Uint32
  | Uint64
  | Sint32
  | Sint64
  | Fixed32
  | Fixed64
  | Sfixed32
  | Sfixed64
  | boolean
  | string
  | Bytes
  | OneofCase<any, any>
  | { [index: number]: ProtobufTypes }
  | { [field: string]: ProtobufTypes };

export interface OneofCase<T, R extends ProtobufTypes> {
  readonly type: T;
  readonly value: R;
}
