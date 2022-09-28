import { isHexString, arrayify, hexlify } from "@ethersproject/bytes";
import Memory from "../memory";
import Stack from "../stack";
import { InvalidBytecode } from "./errors";

class ExecutionContext {
  private readonly code: Uint8Array;
  public stack: Stack;
  public memory: Memory;
  private pc: number;
  private stopped: boolean;

  constructor(code: string) {
    if (!isHexString(code) || code.length % 2 !== 0)
      throw new InvalidBytecode();
    this.code = arrayify(code);
    this.stack = new Stack();
    this.memory = new Memory();
    this.pc = 0;
    this.stopped = false;
  }

  public stop(): void {
    this.stopped = true;
  }

  public run() {
    while (!this.stopped) {
      const opcode = this.readBytesFromCode(1);

      // TODO: Ejecutar opcode
    }
  }

  public readBytesFromCode(bytes = 1): bigint {
    const hexValues = this.code.slice(this.pc, this.pc + bytes); // Recortar un pedazo the tamaño bytes
    const values = BigInt(hexlify(hexValues));

    this.pc += bytes;

    return values;
  }
}

export default ExecutionContext;
