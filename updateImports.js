const fs = require('fs');
const path = require('path');

// Check for directory argument
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node updateImports.js <directory>');
  process.exit(1);
}

const directoryPath = path.resolve(args[0]);

// Function to process files
function processFile(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    // Regex to match the import statement
    const importRegex = /import\s*{\s*(.*?)\s*}\s*from\s*['"][\.?\.?\/?]*\/?main\/main['"];/g;
    
    // Check if the file contains the import statement
    if (importRegex.test(data)) {
      // Create new content with dynamic imports
      const newContent = data.replace(importRegex, (match, p1) => {
        const imports = p1.split(',').map(item => item.trim());
        const variables = imports.join(', ');
        const dots = "../../../";
        return `let ${variables};\n(async () => {\n  ;\n  if (process.env.RUN_MODE === 'engine') {\n    const engineModule = await import('${dots}engine/main');\n    ({ ${variables} } = engineModule);\n  } else {\n    const mainModule = await import('${dots}main/main');\n    ({ ${variables} } = mainModule);\n  }\n})();`;
      });

      // Write the new content to the file
      fs.writeFile(filePath, newContent, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing file ${filePath}:`, err);
        } else {
          console.log(`File updated: ${filePath}`);
        }
      });
    }
  });
}

// Function to process directory
function processDirectory(dirPath) {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dirPath}:`, err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dirPath, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats of file ${filePath}:`, err);
          return;
        }

        if (stats.isDirectory()) {
          processDirectory(filePath); // Recursively process directories
        } else if (stats.isFile() && filePath.endsWith('.ts')) {
          processFile(filePath); // Process TypeScript files
        }
      });
    });
  });
}

// Start processing
processDirectory(directoryPath);
