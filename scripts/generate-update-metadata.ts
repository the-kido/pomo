import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// AI did all of this 

// Read package.json to get version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Generate latest.yml content
const latestYml = `version: ${version}
files:
  - url: PomoTimer-${version} Setup.exe
    sha512: ""
    size: 0
path: PomoTimer-${version} Setup.exe
sha512: ""
releaseDate: ${new Date().toISOString()}`;

// Write to out/make directory
const outDir = path.join(__dirname, '../../../out/make');
if (fs.existsSync(outDir)) {
  fs.writeFileSync(path.join(outDir, 'latest.yml'), latestYml);
  console.log('Generated latest.yml for auto-updater');
} else {
  console.log('Out directory not found, skipping latest.yml generation');
}