class InvalidStackValue extends Error {
  constructor(value: bigint) {
    super(`Value ${value} is invalid`);
  }
}

class StackOverflow extends Error {}

class StackUnderflow extends Error {}

export { InvalidStackValue, StackOverflow, StackUnderflow };
