import { hexlify } from "@ethersproject/bytes";
import { MAX_UINT256 } from "../../constants";
import { InvalidMemoryOffset, InvalidMemoryValue } from "./errors";

class Memory {
  private memory: bigint[];

  constructor() {
    this.memory = [];
  }

  public store(offset: bigint, value: bigint): void {
    if (offset < 0 || offset > MAX_UINT256)
      throw new InvalidMemoryOffset(offset, value);

    if (value < 0 || value > MAX_UINT256)
      throw new InvalidMemoryValue(offset, value);

    this.memory[Number(offset)] = value;
  }

  public load(offset: bigint): bigint {
    if (offset < 0 || offset > MAX_UINT256)
      throw new InvalidMemoryOffset(offset, BigInt(0));

    if (offset >= this.memory.length) return BigInt(0);

    return this.memory[Number(offset)];
  }

  public memoryExpansionCost(offset: bigint): bigint {
    const newMemoryCost = this.memoryCost(offset + BigInt(32));
    const lastMemoryCost = this.memoryCost(BigInt(this.memory.length));

    const cost = newMemoryCost - lastMemoryCost;

    return cost < 0 ? BigInt(0) : cost;
  }

  private memoryCost(memorySize: bigint): bigint {
    const memoryByteSize = memorySize * BigInt(32);
    const memorySizeWord = (memoryByteSize + BigInt(31)) / BigInt(32);
    const memoryCost =
      memorySizeWord ** BigInt(2) / BigInt(512) + BigInt(3) * memorySizeWord;
    return memoryCost;
  }

  public print(): void {
    console.log(
      `Memory:\t`,
      this.memory.map((value) => hexlify(value))
    );
  }
}

export default Memory;
