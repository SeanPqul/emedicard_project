#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Compiling and running Convex Naming Codemod...\n');

// Run the JavaScript codemod
const nodeProcess = spawn('node', [
  path.join(__dirname, 'convex-naming-codemod.js')
], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});
nodeProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Codemod execution completed successfully!');
    console.log('📝 Running post-codemod tasks...\n');
    
    // Run convex codegen after the codemod
    const codegenProcess = spawn('npx', ['convex', 'codegen'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });
    
    codegenProcess.on('close', (codegenCode) => {
      if (codegenCode === 0) {
        console.log('\n✅ Convex codegen completed successfully!');
        console.log('\n🎉 All done! Your Convex functions have been renamed and updated.');
        console.log('📋 Summary of changes:');
        console.log('   • Files renamed to match consistent naming conventions');
        console.log('   • Export names updated with Query/Mutation suffixes');
        console.log('   • API call sites updated across the codebase');
        console.log('   • Transitional aliases added for backward compatibility');
        console.log('\n🧪 Next steps:');
        console.log('   1. Test your application thoroughly');
        console.log('   2. Review the changes and commit them');
        console.log('   3. Plan to remove transitional aliases in a future release');
      } else {
        console.error('❌ Error running convex codegen. Please run it manually.');
        process.exit(1);
      }
    });
    
    codegenProcess.on('error', (err) => {
      console.error('❌ Error running convex codegen:', err.message);
      console.log('💡 Please run "npx convex codegen" manually after reviewing the changes.');
    });
    
  } else {
    console.error(`❌ Codemod failed with code ${code}`);
    process.exit(1);
  }
});

nodeProcess.on('error', (err) => {
  console.error('❌ Error running codemod:', err.message);
  process.exit(1);
});
