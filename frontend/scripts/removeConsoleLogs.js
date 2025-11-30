// scripts/removeConsoleLogs.js
const fs = require('fs');
const path = require('path');

// Configuration
const srcDir = path.join(__dirname, '..', 'src');
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];
const consolePatterns = [
  /console\.log\s*\(.*\);?/g,
  /console\.error\s*\(.*\);?/g,
  /console\.warn\s*\(.*\);?/g,
  /console\.info\s*\(.*\);?/g,
  /console\.debug\s*\(.*\);?/g,
];
let totalRemoved = 0;

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalLength = content.length;
    
    // Apply all console patterns
    consolePatterns.forEach(pattern => {
      content = content.replace(pattern, '');
    });
    
    // If content changed, write back to file
    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content, 'utf8');
      const removedCount = originalLength - content.length;
      totalRemoved += removedCount;
      console.log(`Removed ${removedCount} bytes of console logs from ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
  }
}

// Function to walk through a directory
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (file !== 'node_modules' && !file.startsWith('.')) {
        walkDir(filePath);
      }
    } else if (fileExtensions.includes(path.extname(file))) {
      processFile(filePath);
    }
  });
}

// Run the script
console.log('Starting removal of console logs for production...');
walkDir(srcDir);
console.log(`Completed! Removed a total of ${totalRemoved} bytes.`);
