import {
  StackOverflow,
  StackUnderflow,
  InvalidStackValue,
  IndexOutOfBounds,
} from "./errors";
import { MAX_UINT256 } from "../../constants";
import { hexlify } from "@ethersproject/bytes";

class Stack {
  private readonly maxDepth;
  private stack: bigint[];

  constructor(maxDepth = 1024) {
    this.maxDepth = maxDepth;
    this.stack = [];
  }

  public push(value: bigint): void {
    if (value < 0 || value > MAX_UINT256) throw new InvalidStackValue(value);

    if (this.stack.length + 1 > this.maxDepth) throw new StackOverflow();

    this.stack.push(value);
  }

  public pop(): bigint {
    const value = this.stack.pop();

    if (value === undefined) throw new StackUnderflow();

    return value;
  }

  public duplicate(index: number): void {
    const value = this.stack[this.toStackIndex(index)];
    if (value === undefined) throw new IndexOutOfBounds();
    this.stack.push(value);
  }

  public swap(indexA: number, indexB: number): void {
    const a = this.getAtIndex(indexA);
    const b = this.getAtIndex(indexB);

    this.setAtIndex(indexA, b);
    this.setAtIndex(indexB, a);
  }

  private toStackIndex(index: number) {
    return this.stack.length - index;
  }

  public getAtIndex(index: number): bigint {
    const adjustedIndex = this.toStackIndex(index);
    const value = this.stack[adjustedIndex];
    if (value === undefined) throw new IndexOutOfBounds();
    return value;
  }

  public setAtIndex(index: number, value: bigint) {
    this.stack[this.toStackIndex(index)] = value;
  }

  public print(): void {
    console.log(
      `Stack:\t`,
      this.stack.map((value) => hexlify(value))
    );
  }
}

export default Stack;
