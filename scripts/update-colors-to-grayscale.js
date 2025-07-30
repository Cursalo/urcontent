#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Color replacement mappings
const colorReplacements = {
  // Background colors
  'bg-purple-': 'bg-gray-',
  'bg-pink-': 'bg-gray-',
  'bg-blue-': 'bg-gray-',
  'bg-indigo-': 'bg-gray-',
  'bg-green-': 'bg-gray-',
  'bg-red-': 'bg-gray-',
  'bg-yellow-': 'bg-gray-',
  'bg-amber-': 'bg-gray-',
  'bg-orange-': 'bg-gray-',
  'bg-teal-': 'bg-gray-',
  'bg-cyan-': 'bg-gray-',
  'bg-emerald-': 'bg-gray-',
  'bg-lime-': 'bg-gray-',
  'bg-rose-': 'bg-gray-',
  'bg-fuchsia-': 'bg-gray-',
  'bg-violet-': 'bg-gray-',
  'bg-sky-': 'bg-gray-',
  
  // Text colors
  'text-purple-': 'text-gray-',
  'text-pink-': 'text-gray-',
  'text-blue-': 'text-gray-',
  'text-indigo-': 'text-gray-',
  'text-green-': 'text-gray-',
  'text-red-': 'text-gray-',
  'text-yellow-': 'text-gray-',
  'text-amber-': 'text-gray-',
  'text-orange-': 'text-gray-',
  'text-teal-': 'text-gray-',
  'text-cyan-': 'text-gray-',
  'text-emerald-': 'text-gray-',
  'text-lime-': 'text-gray-',
  'text-rose-': 'text-gray-',
  'text-fuchsia-': 'text-gray-',
  'text-violet-': 'text-gray-',
  'text-sky-': 'text-gray-',
  
  // Border colors
  'border-purple-': 'border-gray-',
  'border-pink-': 'border-gray-',
  'border-blue-': 'border-gray-',
  'border-indigo-': 'border-gray-',
  'border-green-': 'border-gray-',
  'border-red-': 'border-gray-',
  'border-yellow-': 'border-gray-',
  'border-amber-': 'border-gray-',
  'border-orange-': 'border-gray-',
  'border-teal-': 'border-gray-',
  'border-cyan-': 'border-gray-',
  'border-emerald-': 'border-gray-',
  'border-lime-': 'border-gray-',
  'border-rose-': 'border-gray-',
  'border-fuchsia-': 'border-gray-',
  'border-violet-': 'border-gray-',
  'border-sky-': 'border-gray-',
  
  // Hover colors
  'hover:bg-purple-': 'hover:bg-gray-',
  'hover:bg-pink-': 'hover:bg-gray-',
  'hover:bg-blue-': 'hover:bg-gray-',
  'hover:bg-indigo-': 'hover:bg-gray-',
  'hover:bg-green-': 'hover:bg-gray-',
  'hover:bg-red-': 'hover:bg-gray-',
  'hover:bg-yellow-': 'hover:bg-gray-',
  'hover:bg-amber-': 'hover:bg-gray-',
  'hover:bg-orange-': 'hover:bg-gray-',
  'hover:bg-teal-': 'hover:bg-gray-',
  'hover:bg-cyan-': 'hover:bg-gray-',
  'hover:bg-emerald-': 'hover:bg-gray-',
  'hover:bg-lime-': 'hover:bg-gray-',
  'hover:bg-rose-': 'hover:bg-gray-',
  'hover:bg-fuchsia-': 'hover:bg-gray-',
  'hover:bg-violet-': 'hover:bg-gray-',
  'hover:bg-sky-': 'hover:bg-gray-',
  
  // Gradient replacements
  'from-purple-': 'from-gray-',
  'from-pink-': 'from-gray-',
  'from-blue-': 'from-gray-',
  'from-indigo-': 'from-gray-',
  'from-green-': 'from-gray-',
  'from-red-': 'from-gray-',
  'from-yellow-': 'from-gray-',
  'from-amber-': 'from-gray-',
  'from-orange-': 'from-gray-',
  'from-teal-': 'from-gray-',
  'from-cyan-': 'from-gray-',
  'from-emerald-': 'from-gray-',
  'from-lime-': 'from-gray-',
  'from-rose-': 'from-gray-',
  'from-fuchsia-': 'from-gray-',
  'from-violet-': 'from-gray-',
  'from-sky-': 'from-gray-',
  
  'to-purple-': 'to-gray-',
  'to-pink-': 'to-gray-',
  'to-blue-': 'to-gray-',
  'to-indigo-': 'to-gray-',
  'to-green-': 'to-gray-',
  'to-red-': 'to-gray-',
  'to-yellow-': 'to-gray-',
  'to-amber-': 'to-gray-',
  'to-orange-': 'to-gray-',
  'to-teal-': 'to-gray-',
  'to-cyan-': 'to-gray-',
  'to-emerald-': 'to-gray-',
  'to-lime-': 'to-gray-',
  'to-rose-': 'to-gray-',
  'to-fuchsia-': 'to-gray-',
  'to-violet-': 'to-gray-',
  'to-sky-': 'to-gray-',
  
  'via-purple-': 'via-gray-',
  'via-pink-': 'via-gray-',
  'via-blue-': 'via-gray-',
  'via-indigo-': 'via-gray-',
  'via-green-': 'via-gray-',
  'via-red-': 'via-gray-',
  'via-yellow-': 'via-gray-',
  'via-amber-': 'via-gray-',
  'via-orange-': 'via-gray-',
  'via-teal-': 'via-gray-',
  'via-cyan-': 'via-gray-',
  'via-emerald-': 'via-gray-',
  'via-lime-': 'via-gray-',
  'via-rose-': 'via-gray-',
  'via-fuchsia-': 'via-gray-',
  'via-violet-': 'via-gray-',
  'via-sky-': 'via-gray-',
};

// Shade mapping for grayscale conversion
const shadeMapping = {
  '50': '50',
  '100': '100',
  '200': '200',
  '300': '300',
  '400': '400',
  '500': '600',  // Map medium colors to darker grays
  '600': '700',
  '700': '800',
  '800': '900',
  '900': '900',
  '950': '950',
};

// Function to update colors in a file
function updateColors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace each color pattern
    Object.entries(colorReplacements).forEach(([colorPattern, replacement]) => {
      // Match color with shade (e.g., bg-purple-500, text-blue-600)
      const regex = new RegExp(`${colorPattern}(50|100|200|300|400|500|600|700|800|900|950)`, 'g');
      content = content.replace(regex, (match, shade) => {
        const mappedShade = shadeMapping[shade] || shade;
        return `${replacement}${mappedShade}`;
      });
    });
    
    // Replace gradient classes with solid backgrounds
    content = content.replace(/bg-gradient-to-[a-z]+/g, 'bg-gray-900');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated colors in: ${filePath}`);
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
  console.log('Starting to update colors to grayscale...\n');
  
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
      if (updateColors(file)) {
        updatedFiles++;
      }
    }
  }
  
  console.log(`\nProcessed ${totalFiles} files, updated ${updatedFiles} files.`);
}

// Run the script
main().catch(console.error);