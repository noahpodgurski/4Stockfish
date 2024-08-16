const fs = require('fs');
const path = require('path');

function renameJsToTs(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}: ${err}`);
      return;
    }

    files.forEach(file => {
        console.log(`changing ${file}`)
      const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats of file ${filePath}: ${err}`);
          return;
        }

        if (stats.isDirectory()) {
          renameJsToTs(filePath); // Recursively handle subdirectories
        } else if (stats.isFile() && file.endsWith('.js')) {
          const newFilePath = filePath.slice(0, -3) + '.ts';
          
          fs.rename(filePath, newFilePath, (err) => {
            if (err) {
              console.error(`Error renaming file ${filePath} to ${newFilePath}: ${err}`);
            } else {
              console.log(`Renamed ${filePath} to ${newFilePath}`);
            }
          });
        }
      });
    });
  });
}

// Specify the directory to start from
const startDir = process.argv[2] || '.';
renameJsToTs(startDir);