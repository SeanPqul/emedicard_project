const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const path = require('path');

// Load the mapping configuration
const mappingFile = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'convex-naming-normalization-mapping.json'), 'utf8'));
const mapping = mappingFile.naming_normalization_mapping.changes;

// Directory mapping from snake_case in JSON to camelCase in filesystem
const dirMapping = {
  'health_cards': 'healthCards',
  'job_categories': 'jobCategories',
  'notifications': 'notifications',
  'orientations': 'orientations', 
  'payments': 'payments',
  'requirements': 'requirements',
  'users': 'users',
  'verification': 'verification'
};

class ConvexNamingCodemod {
  constructor() {
    this.project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
    });
    this.callSiteMappings = [];
  }

  async run() {
    console.log('🚀 Starting Convex Naming Codemod...');
    
    // Step 1: Build call site mappings
    this.buildCallSiteMappings();
    
    // Step 2: Rename files and update exports
    await this.renameFilesAndExports();
    
    // Step 3: Update all call sites across the codebase
    await this.updateCallSites();
    
    // Step 4: Add transitional aliases (optional)
    await this.addTransitionalAliases();
    
    // Step 5: Save all changes
    await this.project.save();
    
    console.log('✅ Codemod completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Run "npx convex codegen" to regenerate API types');
    console.log('   2. Test the application to ensure everything works');
    console.log('   3. Review and remove transitional aliases in a future release');
  }

  buildCallSiteMappings() {
    console.log('📋 Building call site mappings...');
    
    Object.entries(mapping).forEach(([directory, files]) => {
      // Convert directory names from mapping format to actual filesystem format
      const actualDirectory = dirMapping[directory] || directory;
      
      Object.entries(files).forEach(([currentFilename, fileMapping]) => {
        const oldCall = `api.${actualDirectory}.${fileMapping.current_export}`;
        const newCall = `api.${actualDirectory}.${fileMapping.new_export}`;
        const newFilename = fileMapping.new_filename || currentFilename;
        
        this.callSiteMappings.push({
          oldCall,
          newCall,
          directory: actualDirectory,
          oldFilename: currentFilename,
          newFilename
        });
      });
    });

    console.log(`   Found ${this.callSiteMappings.length} call site mappings`);
  }

  async renameFilesAndExports() {
    console.log('📝 Renaming files and updating exports...');
    
    Object.entries(mapping).forEach(([directory, files]) => {
      const actualDirectory = dirMapping[directory] || directory;
      
      Object.entries(files).forEach(([currentFilename, fileMapping]) => {
        const currentPath = path.join('convex', actualDirectory, currentFilename);
        const newPath = fileMapping.new_filename 
          ? path.join('convex', actualDirectory, fileMapping.new_filename)
          : currentPath;
        
        this.updateFileExports(currentPath, fileMapping);
        
        // Rename file if needed
        if (fileMapping.new_filename && fileMapping.new_filename !== currentFilename) {
          this.renameFile(currentPath, newPath);
        }
      });
    });
  }

  updateFileExports(filePath, fileMapping) {
    const sourceFile = this.project.getSourceFile(filePath);
    if (!sourceFile) {
      console.warn(`   ⚠️  File not found: ${filePath}`);
      return;
    }

    const oldExportName = fileMapping.current_export;
    const newExportName = fileMapping.new_export;

    // Update variable exports
    sourceFile.getVariableStatements().forEach(varStatement => {
      if (varStatement.hasExportKeyword()) {
        const declaration = varStatement.getDeclarations()[0];
        if (declaration && declaration.getName() === oldExportName) {
          declaration.rename(newExportName);
          console.log(`   ✏️  Updated export: ${oldExportName} → ${newExportName} in ${filePath}`);
        }
      }
    });

    // Update named exports
    sourceFile.getExportDeclarations().forEach(exportDecl => {
      exportDecl.getNamedExports().forEach(namedExport => {
        if (namedExport.getName() === oldExportName) {
          namedExport.setName(newExportName);
          console.log(`   ✏️  Updated named export: ${oldExportName} → ${newExportName} in ${filePath}`);
        }
      });
    });
  }

  renameFile(oldPath, newPath) {
    const sourceFile = this.project.getSourceFile(oldPath);
    if (!sourceFile) {
      console.warn(`   ⚠️  Cannot rename, file not found: ${oldPath}`);
      return;
    }

    // Move the file
    sourceFile.move(newPath);
    console.log(`   📁 Renamed file: ${oldPath} → ${newPath}`);
  }

  async updateCallSites() {
    console.log('🔄 Updating API call sites...');
    
    // Get all TypeScript and JavaScript files in src and app directories
    this.project.addSourceFilesAtPaths([
      'src/**/*.{ts,tsx,js,jsx}',
      'app/**/*.{ts,tsx,js,jsx}'
    ]);
    
    const sourceFiles = this.project.getSourceFiles();
    let totalUpdates = 0;

    sourceFiles.forEach(sourceFile => {
      let fileUpdates = 0;
      const filePath = sourceFile.getFilePath();
      
      // Skip convex directory files to avoid self-modification during rename
      if (filePath.includes('convex' + path.sep)) {
        return;
      }

      // Find and update API calls
      sourceFile.forEachDescendant((node) => {
        if (node.getKind() === SyntaxKind.PropertyAccessExpression) {
          const text = node.getText();
          
          // Check if this matches any of our mappings
          this.callSiteMappings.forEach(mapping => {
            if (text === mapping.oldCall) {
              // Replace the text
              node.replaceWithText(mapping.newCall);
              fileUpdates++;
              totalUpdates++;
            }
          });
        }
      });

      if (fileUpdates > 0) {
        console.log(`   ✏️  Updated ${fileUpdates} call sites in ${path.relative(process.cwd(), filePath)}`);
      }
    });

    console.log(`   📊 Total call sites updated: ${totalUpdates}`);
  }

  async addTransitionalAliases() {
    console.log('🔄 Adding transitional aliases...');
    
    Object.entries(mapping).forEach(([directory, files]) => {
      const actualDirectory = dirMapping[directory] || directory;
      
      Object.entries(files).forEach(([currentFilename, fileMapping]) => {
        const filePath = fileMapping.new_filename 
          ? path.join('convex', actualDirectory, fileMapping.new_filename)
          : path.join('convex', actualDirectory, currentFilename);
        
        const sourceFile = this.project.getSourceFile(filePath);
        if (!sourceFile) {
          return;
        }

        // Add transitional alias
        const oldExport = fileMapping.current_export;
        const newExport = fileMapping.new_export;
        
        if (oldExport !== newExport && oldExport !== 'deprecated' && oldExport !== undefined) {
          // Add a comment explaining the deprecation and the alias at the end
          sourceFile.insertText(sourceFile.getFullText().length, 
            `\n\n// @deprecated - Use ${newExport} instead. This alias will be removed in a future release.\nexport const ${oldExport} = ${newExport};\n`
          );
          
          console.log(`   🔄 Added transitional alias: ${oldExport} → ${newExport} in ${filePath}`);
        }
      });
    });
  }
}

// Run the codemod
if (require.main === module) {
  const codemod = new ConvexNamingCodemod();
  codemod.run().catch(console.error);
}

module.exports = ConvexNamingCodemod;
