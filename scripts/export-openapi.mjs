import { writeFile } from "node:fs/promises";
import { swaggerSpec } from "../dist/config/swagger.js";

await writeFile("openapi.json", JSON.stringify(swaggerSpec, null, 2));
console.log("openapi.json generated");
