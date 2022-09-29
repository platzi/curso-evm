import {
  bigIntToBuffer,
  bufferToBigInt,
  setLengthLeft,
} from "@ethereumjs/util";
import { arrayify, hexlify } from "@ethersproject/bytes";
import ExecutionContext from "../classes/execution";
import Instruction from "../classes/instruction";

const Opcodes: {
  0: Instruction;
  0x5b: Instruction;
  [key: number]: Instruction | undefined;
} = {
  0x00: new Instruction(0x00, "STOP", 0, (ctx: ExecutionContext) => ctx.stop()),
  0x01: new Instruction(0x01, "ADD", 3, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = a + b;
    ctx.stack.push(result);
  }),
  0x02: new Instruction(0x02, "MUL", 5, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = a * b;
    ctx.stack.push(result);
  }),
  0x03: new Instruction(0x03, "SUB", 3, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = a - b;
    ctx.stack.push(result);
  }),
  0x04: new Instruction(0x04, "DIV", 5, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = a / b;
    ctx.stack.push(result);
  }),
  0x06: new Instruction(0x06, "MOD", 5, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = a % b;
    ctx.stack.push(result);
  }),
  0x0a: new Instruction(
    0x0a,
    "EXP",
    async (ctx: ExecutionContext) => 1,
    (ctx: ExecutionContext) => {
      const [a, exponent] = [ctx.stack.pop(), ctx.stack.pop()];
      const result = a ** exponent;
      ctx.stack.push(result);
    }
  ),
  0x10: new Instruction(0x10, "LT", 3, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = BigInt(a < b);
    ctx.stack.push(result);
  }),
  0x11: new Instruction(0x11, "GT", 4, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = BigInt(a > b);
    ctx.stack.push(result);
  }),
  0x14: new Instruction(0x14, "EQ", 3, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = BigInt(a === b);
    ctx.stack.push(result);
  }),
  0x16: new Instruction(0x16, "AND", 3, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = BigInt(a && b);
    ctx.stack.push(result);
  }),
  0x17: new Instruction(0x17, "OR", 3, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = BigInt(a || b);
    ctx.stack.push(result);
  }),
  0x18: new Instruction(0x18, "XOR", 3, (ctx: ExecutionContext) => {
    const [a, b] = [ctx.stack.pop(), ctx.stack.pop()];
    const result = BigInt(a ^ b);
    ctx.stack.push(result);
  }),
  0x19: new Instruction(0x19, "NOT", 3, (ctx: ExecutionContext) => {
    const a = ctx.stack.pop();
    const result = BigInt(!a);
    ctx.stack.push(result);
  }),
  0x50: new Instruction(0x50, "POP", 3, (ctx: ExecutionContext) => {
    ctx.stack.pop();
  }),
  0x51: new Instruction(
    0x51,
    "MLOAD",
    async (ctx: ExecutionContext) => 1,
    (ctx: ExecutionContext) => {
      const offset = ctx.stack.pop();
      ctx.stack.push(ctx.memory.load(offset));
    }
  ),
  0x52: new Instruction(
    0x52,
    "MSTORE",
    async (ctx: ExecutionContext) => 1,
    (ctx: ExecutionContext) => {
      const [offset, value] = [ctx.stack.pop(), ctx.stack.pop()];
      ctx.memory.store(offset, value);
    }
  ),
  0x54: new Instruction(
    0x54,
    "SLOAD",
    async (ctx: ExecutionContext) => 1,
    async (ctx: ExecutionContext) => {
      const key = ctx.stack.pop();
      const value = await ctx.storage.get(
        setLengthLeft(bigIntToBuffer(key), 32)
      );
      ctx.stack.push(value ? bufferToBigInt(value) : BigInt(0));
    }
  ),
  0x55: new Instruction(
    0x55,
    "SSTORE",
    async (ctx: ExecutionContext) => 1,
    async (ctx: ExecutionContext) => {
      const [key, value] = [ctx.stack.pop(), ctx.stack.pop()];
      await ctx.storage.put(
        setLengthLeft(bigIntToBuffer(key), 32),
        bigIntToBuffer(value)
      );
    }
  ),
  0x56: new Instruction(0x56, "JUMP", 8, (ctx: ExecutionContext) => {
    const destination = ctx.stack.pop();
    ctx.jump(destination);
  }),
  0x57: new Instruction(0x57, "JUMPI", 10, (ctx: ExecutionContext) => {
    const [destination, b] = [ctx.stack.pop(), ctx.stack.pop()];
    if (Boolean(b)) ctx.jump(destination);
  }),
  0x5b: new Instruction(0x5b, "JUMPDEST", 1, () => undefined),
  0x60: new Instruction(0x60, "PUSH1", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(1));
  }),
  0x61: new Instruction(0x61, "PUSH2", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(2));
  }),
  0x62: new Instruction(0x62, "PUSH3", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(3));
  }),
  0x63: new Instruction(0x63, "PUSH4", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(4));
  }),
  0x64: new Instruction(0x64, "PUSH5", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(5));
  }),
  0x65: new Instruction(0x65, "PUSH6", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(6));
  }),
  0x66: new Instruction(0x66, "PUSH7", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(7));
  }),
  0x67: new Instruction(0x67, "PUSH8", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(8));
  }),
  0x68: new Instruction(0x68, "PUSH9", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(9));
  }),
  0x69: new Instruction(0x69, "PUSH10", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(10));
  }),
  0x6a: new Instruction(0x6a, "PUSH11", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(11));
  }),
  0x6b: new Instruction(0x6b, "PUSH12", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(12));
  }),
  0x6c: new Instruction(0x6c, "PUSH13", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(13));
  }),
  0x6d: new Instruction(0x6d, "PUSH14", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(14));
  }),
  0x6e: new Instruction(0x6e, "PUSH15", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(15));
  }),
  0x6f: new Instruction(0x6f, "PUSH16", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(16));
  }),
  0x70: new Instruction(0x70, "PUSH17", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(17));
  }),
  0x71: new Instruction(0x71, "PUSH18", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(18));
  }),
  0x72: new Instruction(0x72, "PUSH19", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(19));
  }),
  0x73: new Instruction(0x73, "PUSH20", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(20));
  }),
  0x74: new Instruction(0x74, "PUSH21", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(21));
  }),
  0x75: new Instruction(0x75, "PUSH22", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(22));
  }),
  0x76: new Instruction(0x76, "PUSH23", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(23));
  }),
  0x77: new Instruction(0x77, "PUSH24", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(24));
  }),
  0x78: new Instruction(0x78, "PUSH25", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(25));
  }),
  0x79: new Instruction(0x79, "PUSH26", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(26));
  }),
  0x7a: new Instruction(0x7a, "PUSH27", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(27));
  }),
  0x7b: new Instruction(0x7b, "PUSH28", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(28));
  }),
  0x7c: new Instruction(0x7c, "PUSH29", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(29));
  }),
  0x7d: new Instruction(0x7d, "PUSH30", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(30));
  }),
  0x7e: new Instruction(0x7e, "PUSH31", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(31));
  }),
  0x7f: new Instruction(0x7f, "PUSH32", 3, (ctx: ExecutionContext) => {
    ctx.stack.push(ctx.readBytesFromCode(32));
  }),
  0x80: new Instruction(0x80, "DUP1", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(1);
  }),
  0x81: new Instruction(0x81, "DUP2", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(2);
  }),
  0x82: new Instruction(0x82, "DUP3", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(3);
  }),
  0x83: new Instruction(0x83, "DUP4", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(4);
  }),
  0x84: new Instruction(0x84, "DUP5", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(5);
  }),
  0x85: new Instruction(0x85, "DUP6", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(6);
  }),
  0x86: new Instruction(0x86, "DUP7", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(7);
  }),
  0x87: new Instruction(0x87, "DUP8", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(8);
  }),
  0x88: new Instruction(0x88, "DUP9", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(9);
  }),
  0x89: new Instruction(0x89, "DUP10", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(10);
  }),
  0x8a: new Instruction(0x8a, "DUP11", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(11);
  }),
  0x8b: new Instruction(0x8b, "DUP12", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(12);
  }),
  0x8c: new Instruction(0x8c, "DUP13", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(13);
  }),
  0x8d: new Instruction(0x8d, "DUP14", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(14);
  }),
  0x8e: new Instruction(0x8e, "DUP15", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(15);
  }),
  0x8f: new Instruction(0x8f, "DUP16", 3, (ctx: ExecutionContext) => {
    ctx.stack.duplicate(16);
  }),
  0x90: new Instruction(0x90, "SWAP1", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 2);
  }),
  0x91: new Instruction(0x91, "SWAP2", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 3);
  }),
  0x92: new Instruction(0x92, "SWAP3", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 4);
  }),
  0x93: new Instruction(0x93, "SWAP4", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 5);
  }),
  0x94: new Instruction(0x94, "SWAP5", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 6);
  }),
  0x95: new Instruction(0x95, "SWAP6", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 7);
  }),
  0x96: new Instruction(0x96, "SWAP7", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 8);
  }),
  0x97: new Instruction(0x97, "SWAP8", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 9);
  }),
  0x98: new Instruction(0x98, "SWAP9", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 10);
  }),
  0x99: new Instruction(0x99, "SWAP10", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 11);
  }),
  0x9a: new Instruction(0x9a, "SWAP11", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 12);
  }),
  0x9b: new Instruction(0x9b, "SWAP12", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 13);
  }),
  0x9c: new Instruction(0x9c, "SWAP13", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 14);
  }),
  0x9d: new Instruction(0x9d, "SWAP14", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 15);
  }),
  0x9e: new Instruction(0x9e, "SWAP15", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 16);
  }),
  0x9f: new Instruction(0x9f, "SWAP16", 3, (ctx: ExecutionContext) => {
    ctx.stack.swap(1, 17);
  }),
  0xf3: new Instruction(
    0xf3,
    "RETURN",
    async (ctx: ExecutionContext) => 1,
    (ctx: ExecutionContext) => {
      const [offset, size] = [ctx.stack.pop(), ctx.stack.pop()];
      const output = ctx.memory.load(offset);
      const outputHex = arrayify(output.toString(16)).slice(0, Number(size));
      ctx.output = BigInt(hexlify(outputHex));
    }
  ),
};

export default Opcodes;
