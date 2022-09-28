import { argv } from "process";
import ExecutionContext from "./classes/execution";

const main = () => {
  const code = argv[2] ?? "0x00";
  const executionContext = new ExecutionContext(code);

  executionContext.run();
};

main();
