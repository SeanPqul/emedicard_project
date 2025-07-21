import { spawn } from 'child_process';
// Inlined and encoded DUMMY_TEXT
const DUMMY_TEXT = "Placeholder text for seeding purposes. This is example content.";
const dummyBytes = new TextEncoder().encode(DUMMY_TEXT);
console.log("Using dummy text for seeding...");
// Function to call Convex
function seedDatabase() {
  const convexRun = spawn('npx', ['convex', 'run', 'seed:all'], {
    stdio: 'inherit',
    shell: true,
  });

  convexRun.on('close', (code) => {
    console.log(`Convex seeding process exited with code ${code}`);
  });
}

seedDatabase();
