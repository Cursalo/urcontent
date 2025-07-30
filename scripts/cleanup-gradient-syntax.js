#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Function to clean up gradient syntax
function cleanupGradients(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Remove gradient classes that remain
    // Pattern: bg-gray-900 from-gray-* to-gray-* via-gray-*
    content = content.replace(/bg-gray-\d{2,3}\s+from-gray-\d{2,3}\s+to-gray-\d{2,3}/g, 'bg-gray-900');
    content = content.replace(/bg-gray-\d{2,3}\s+from-gray-\d{2,3}\s+via-gray-\d{2,3}\s+to-gray-\d{2,3}/g, 'bg-gray-900');
    
    // Clean up any bg-gradient-to-* classes
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-gray-\d{2,3}\s+to-gray-\d{2,3}/g, 'bg-gray-900');
    content = content.replace(/bg-gradient-to-[a-z]+\s+from-gray-\d{2,3}\s+via-gray-\d{2,3}\s+to-gray-\d{2,3}/g, 'bg-gray-900');
    
    // Clean up any standalone gradient utilities
    content = content.replace(/\bfrom-gray-\d{2,3}\s+to-gray-\d{2,3}\b/g, '');
    content = content.replace(/\bfrom-gray-\d{2,3}\s+via-gray-\d{2,3}\s+to-gray-\d{2,3}\b/g, '');
    
    // Clean up double spaces that might result from replacements
    content = content.replace(/\s+"/g, '"');
    content = content.replace(/"\s+/g, '"');
    content = content.replace(/\s{2,}/g, ' ');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned gradients in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting to clean up gradient syntax...\n');
  
  // Find all TypeScript/React files
  const patterns = [
    'src/**/*.tsx',
    'src/**/*.ts',
    'src/**/*.jsx',
    'src/**/*.js',
  ];
  
  let totalFiles = 0;
  let updatedFiles = 0;
  
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });
    
    for (const file of files) {
      totalFiles++;
      if (cleanupGradients(file)) {
        updatedFiles++;
      }
    }
  }
  
  console.log(`\nProcessed ${totalFiles} files, cleaned ${updatedFiles} files.`);
}

// Run the script
main().catch(console.error);