const fs = require('fs');
const path = require('path');

function transformStateFiles(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}: ${err}`);
      return;
    }

    files.forEach(file => {
        console.log(`updating ${file}`);
      const filePath = path.join(dir, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats of file ${filePath}: ${err}`);
          return;
        }

        if (stats.isDirectory()) {
          transformStateFiles(filePath); // Recursively handle subdirectories
        } else if (stats.isFile() && file.endsWith('.ts')) {
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
              console.error(`Error reading file ${filePath}: ${err}`);
              return;
            }

            // Check if file contains the specific structure
            const stateRegex = /export\s+default\s*{\s*name\s*:\s*"(\w+)"/;
            const match = data.match(stateRegex);

            if (match) {
              const stateName = match[1];
              const newState = `${data.replace('export default {', `import { State } from "../../State";\n\nconst ${stateName}: State = {`)}\n\nexport default ${stateName};`;

              fs.writeFile(filePath, newState, 'utf8', (err) => {
                if (err) {
                  console.error(`Error writing to file ${filePath}: ${err}`);
                } else {
                  console.log(`Transformed ${filePath}`);
                }
              });
            }
          });
        }
      });
    });
  });
}

// Specify the directory to start from
const startDir = process.argv[2] || '.';
transformStateFiles(startDir);
