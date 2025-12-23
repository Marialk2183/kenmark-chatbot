import { seedInitialKnowledge } from "../lib/seed";

async function main() {
  await seedInitialKnowledge();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

