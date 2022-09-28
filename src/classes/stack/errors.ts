class InvalidStackValue extends Error {
  constructor(value: bigint) {
    super(`Value ${value} is invalid`);
  }
}

class StackOverflow extends Error {}

class StackUnderflow extends Error {}

class IndexOutOfBounds extends Error {}

export { InvalidStackValue, StackOverflow, StackUnderflow, IndexOutOfBounds };
