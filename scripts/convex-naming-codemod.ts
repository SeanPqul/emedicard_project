import { Project, SyntaxKind } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the mapping configuration
const mappingFile = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'convex-naming-normalization-mapping.json'), 'utf8'));
const mapping = mappingFile.naming_normalization_mapping.changes;

interface FileMapping {
  current_export: string;
  new_export: string;
  new_filename?: string;
  type: string;
  status: string;
  notes?: string;
}

interface CallSiteMapping {
  oldCall: string;
  newCall: string;
  directory: string;
  oldFilename: string;
  newFilename: string;
}

class ConvexNamingCodemod {
  private project: Project;
  private callSiteMappings: CallSiteMapping[] = [];

  constructor() {
    this.project = new Project({
      tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
    });
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

  private buildCallSiteMappings() {
    console.log('📋 Building call site mappings...');
    
    Object.entries(mapping).forEach(([directory, files]) => {
      Object.entries(files as Record<string, FileMapping>).forEach(([currentFilename, fileMapping]) => {
        const oldCall = `api.${directory}.${fileMapping.current_export}`;
        const newCall = `api.${directory}.${fileMapping.new_export}`;
        const newFilename = fileMapping.new_filename || currentFilename;
        
        this.callSiteMappings.push({
          oldCall,
          newCall,
          directory,
          oldFilename: currentFilename,
          newFilename
        });
      });
    });

    console.log(`   Found ${this.callSiteMappings.length} call site mappings`);
  }

  private async renameFilesAndExports() {
    console.log('📁 Renaming files and updating exports...');
    
    Object.entries(mapping).forEach(([directory, files]) => {
      Object.entries(files as Record<string, FileMapping>).forEach(([currentFilename, fileMapping]) => {
        const currentPath = path.join('convex', directory, currentFilename);
        const newPath = fileMapping.new_filename 
          ? path.join('convex', directory, fileMapping.new_filename)
          : currentPath;
        
        this.updateFileExports(currentPath, fileMapping);
        
        // Rename file if needed
        if (fileMapping.new_filename && fileMapping.new_filename !== currentFilename) {
          this.renameFile(currentPath, newPath);
        }
      });
    });
  }

  private updateFileExports(filePath: string, fileMapping: FileMapping) {
    const sourceFile = this.project.getSourceFile(filePath);
    if (!sourceFile) {
      console.warn(`   ⚠️  File not found: ${filePath}`);
      return;
    }

    // Find the export declaration
    const exportDeclarations = sourceFile.getExportedDeclarations();
    const oldExportName = fileMapping.current_export;
    const newExportName = fileMapping.new_export;

    // Update variable exports
    sourceFile.getVariableStatements().forEach(varStatement => {
      if (varStatement.hasExportKeyword()) {
        const declaration = varStatement.getDeclarations()[0];
        if (declaration.getName() === oldExportName) {
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

  private renameFile(oldPath: string, newPath: string) {
    const sourceFile = this.project.getSourceFile(oldPath);
    if (!sourceFile) {
      console.warn(`   ⚠️  Cannot rename, file not found: ${oldPath}`);
      return;
    }

    // Move the file
    sourceFile.move(newPath);
    console.log(`   📁 Renamed file: ${oldPath} → ${newPath}`);
  }

  private async updateCallSites() {
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

  private async addTransitionalAliases() {
    console.log('🔄 Adding transitional aliases...');
    
    Object.entries(mapping).forEach(([directory, files]) => {
      Object.entries(files as Record<string, FileMapping>).forEach(([currentFilename, fileMapping]) => {
        const filePath = fileMapping.new_filename 
          ? path.join('convex', directory, fileMapping.new_filename)
          : path.join('convex', directory, currentFilename);
        
        const sourceFile = this.project.getSourceFile(filePath);
        if (!sourceFile) {
          return;
        }

        // Add transitional alias
        const oldExport = fileMapping.current_export;
        const newExport = fileMapping.new_export;
        
        if (oldExport !== newExport) {
          // Add the alias at the end of the file
          sourceFile.addExportAssignment({
            expression: newExport,
            isExportEquals: false,
          });
          
          // Add a comment explaining the deprecation
          sourceFile.insertText(sourceFile.getEndLineNumber(), 
            `\n\n// @deprecated - Use ${newExport} instead. This alias will be removed in a future release.\nexport const ${oldExport} = ${newExport};\n`
          );
          
          console.log(`   🔄 Added transitional alias: ${oldExport} → ${newExport} in ${filePath}`);
        }
      });
    });
  }
}

// Run the codemod
if (import.meta.url === `file://${process.argv[1]}`) {
  const codemod = new ConvexNamingCodemod();
  codemod.run().catch(console.error);
}

export default ConvexNamingCodemod;
