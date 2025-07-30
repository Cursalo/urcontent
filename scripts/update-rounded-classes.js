#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Function to update rounded classes in a file
function updateRoundedClasses(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace all rounded-* classes except rounded-full (which we'll keep for avatars)
    const roundedPatterns = [
      // Replace rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl with just "rounded"
      /rounded-(sm|md|lg|xl|2xl|3xl)/g,
      // Replace rounded-[*] with just "rounded"
      /rounded-\[[^\]]+\]/g,
    ];
    
    roundedPatterns.forEach(pattern => {
      content = content.replace(pattern, 'rounded');
    });
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
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
  console.log('Starting to update rounded classes...\n');
  
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
      if (updateRoundedClasses(file)) {
        updatedFiles++;
      }
    }
  }
  
  console.log(`\nProcessed ${totalFiles} files, updated ${updatedFiles} files.`);
}

// Run the script
main().catch(console.error);