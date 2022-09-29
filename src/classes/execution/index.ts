import { Trie } from "@ethereumjs/trie";
import { isHexString, arrayify, hexlify } from "@ethersproject/bytes";
import Opcodes from "../../opcodes";
import Instruction from "../instruction";
import Memory from "../memory";
import Stack from "../stack";
import {
  InvalidBytecode,
  InvalidJump,
  InvalidProgramCounterIndex,
  OutOfGas,
  UnknownOpcode,
} from "./errors";

class ExecutionContext {
  private readonly code: Uint8Array;
  public stack: Stack;
  public memory: Memory;
  private pc: number;
  private stopped: boolean;
  public output: bigint = BigInt(0);
  public storage: Trie;
  public readonly originalStorage: Trie;
  public gas: bigint;

  constructor(code: string, gas: bigint, storage: Trie) {
    if (!isHexString(code) || code.length % 2 !== 0)
      throw new InvalidBytecode();
    this.code = arrayify(code);
    this.stack = new Stack();
    this.memory = new Memory();
    this.pc = 0;
    this.stopped = false;
    this.storage = storage;
    this.originalStorage = storage.copy()
    this.gas = gas;
  }

  public stop(): void {
    this.stopped = true;
  }

  public async run() {
    while (!this.stopped) {
      const currentPc = this.pc;

      const instruction = this.fetchInstruction();
      const currentAvailableGas = this.gas;
      const { gasFee } = await instruction.execute(this);

      console.info(
        `${instruction.name}\t @pc=${currentPc}\t gas=${currentAvailableGas}\t cost=${gasFee}`
      );

      this.memory.print();
      this.stack.print();
      console.log("");
    }

    console.log("Output:\t", hexlify(this.output));
    console.log("Root:\t", hexlify(this.storage.root()));
  }

  public useGas(fee: number) {
    this.gas -= BigInt(fee);
    if (this.gas < 0) throw new OutOfGas();
  }

  private fetchInstruction(): Instruction {
    if (this.pc >= this.code.length) return Opcodes[0];

    if (this.pc < 0) throw new InvalidProgramCounterIndex();

    const opcode = this.readBytesFromCode(1);

    const instruction = Opcodes[Number(opcode)];

    if (!instruction) throw new UnknownOpcode();

    return instruction;
  }

  public readBytesFromCode(bytes = 1): bigint {
    const hexValues = this.code.slice(this.pc, this.pc + bytes); // Recortar un pedazo the tamaño bytes
    const values = BigInt(hexlify(hexValues));

    this.pc += bytes;

    return values;
  }

  public jump(destination: bigint): void {
    if (!this.isValidJump(destination)) throw new InvalidJump();
    this.pc = Number(destination);
  }

  private isValidJump(destination: bigint): boolean {
    return this.code[Number(destination) - 1] === Opcodes[0x5b].opcode;
  }
}

export default ExecutionContext;
