import { spawn } from "node:child_process";

const steps = [
  ["node", ["src/scripts/seed-admin.js"]],
  ["node", ["src/scripts/seed-categories.js"]],
  ["node", ["src/scripts/seed-products.js"]],
  ["node", ["src/scripts/seed-blog.js"]],
  ["node", ["src/scripts/seed-customers.js"]],
  ["node", ["src/scripts/seed-orders.js"]],
];

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

async function main() {
  for (const [command, args] of steps) {
    await run(command, args);
  }
  console.log("Demo seed completed");
}

main().catch((error) => {
  console.error("Demo seed failed", error);
  process.exitCode = 1;
});
