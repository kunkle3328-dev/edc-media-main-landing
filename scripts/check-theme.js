import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredFiles = [
  'app/globals.css',
  'app/layout.tsx',
  'postcss.config.mjs',
  'EDC_FRONTEND_THEME_CONTRACT.md'
];

const criticalTokens = [
  '--color-obsidian-bg',
  '--color-edc-cyan',
  '--font-sans',
  'min-height: 100dvh',
  'touch-action: manipulation',
  '@import "tailwindcss"'
];

let failed = false;

// 1. Check for missing files
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, '..', file))) {
    console.error(`\n❌ THEME REGRESSION DETECTED: Missing authoritative file: ${file}`);
    failed = true;
  }
}

// 2. Check for globals.css import in layout
try {
  const layoutContent = fs.readFileSync(path.join(__dirname, '..', 'app/layout.tsx'), 'utf8');
  if (!layoutContent.includes('import "./globals.css"')) {
    console.error('\n❌ THEME REGRESSION DETECTED: globals.css is not imported in app/layout.tsx');
    failed = true;
  }
} catch (e) {
  console.error('\n❌ FAILED TO READ app/layout.tsx');
  failed = true;
}

// 3. Check for critical tokens in globals.css
try {
  const cssContent = fs.readFileSync(path.join(__dirname, '..', 'app/globals.css'), 'utf8');
  for (const token of criticalTokens) {
    if (!cssContent.includes(token)) {
      console.error(`\n❌ THEME REGRESSION DETECTED: Critical token "${token}" missing from app/globals.css`);
      failed = true;
    }
  }
} catch (e) {
  console.error('\n❌ FAILED TO READ app/globals.css');
  failed = true;
}

if (failed) {
  console.error('\n⚠️ THEME INTEGRITY COMPROMISED. DO NOT PUBLISH UNTIL RESTORED.\n');
  process.exit(1);
} else {
  console.log('✅ EDC Theme integrity check passed.');
}

