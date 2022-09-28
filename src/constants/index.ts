import { join } from "path";

const MAX_UINT256 = BigInt(2 ** 256);

const DB_PATH = join(__dirname, "../../db");

export { MAX_UINT256, DB_PATH };
