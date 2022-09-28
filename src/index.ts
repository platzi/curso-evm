import { Trie } from "@ethereumjs/trie";
import { Level } from "level";
import { argv } from "process";
import ExecutionContext from "./classes/execution";
import LevelDB from "./classes/storage";
import { DB_PATH } from "./constants";

const main = async () => {
  const code = argv[2] ?? "0x00";
  const trie = await Trie.create({
    db: new LevelDB(new Level(DB_PATH)),
    useRootPersistence: true,
  });

  const executionContext = new ExecutionContext(code, trie);

  executionContext.run();
};

main();
