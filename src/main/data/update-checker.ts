import { app, dialog, shell } from 'electron';
import { logger } from '../utils/logger';
import * as https from 'https';

const REPO_OWNER = 'the-kido';
const REPO_NAME = 'pomo';

function compareVersions(version1: string, version2: string): boolean {
  // Simple version comparison - returns true if version1 is newer than version2
  const v1parts = version1.replace(/[^\d.-]/g, '').split(/[.-]/).map(x => parseInt(x) || 0);
  const v2parts = version2.replace(/[^\d.-]/g, '').split(/[.-]/).map(x => parseInt(x) || 0);
  
  const maxLength = Math.max(v1parts.length, v2parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) return true;
    if (v1part < v2part) return false;
  }
  
  return false; // versions are equal
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  html_url: string;
  prerelease: boolean;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

function makeRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'PomoTimer-UpdateChecker',
        'Accept': 'application/vnd.github.v3+json'
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkForUpdates(): Promise<void> {
  try {
    logger.info('Checking for updates via GitHub API...');
    
    // First try to get all releases (including prereleases)
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`;
    logger.info(`Requesting: ${url}`);
    
    const responseData = await makeRequest(url);
    logger.debug('GitHub API response received, parsing...');
    
    const releases: GitHubRelease[] = JSON.parse(responseData);
    
    if (!releases || releases.length === 0) {
      logger.info('No releases found in repository');
      return;
    }
    
    // Find the latest release (including prereleases)
    const release = releases[0]; // GitHub returns releases sorted by date (newest first)
    const currentVersion = app.getVersion();
    const latestVersion = release.tag_name.replace(/^v/, ''); // Remove 'v' prefix if present
    
    logger.info(`Current version: ${currentVersion}, Latest version: ${latestVersion}`);
    logger.debug(`Found ${releases.length} releases`);
    logger.debug(`Latest release info:`, { 
      tagName: release.tag_name, 
      prerelease: release.prerelease,
      assetsCount: release.assets?.length || 0 
    });
    
    // Check if there's a newer version available
    if (latestVersion !== currentVersion) {
      const isNewer = compareVersions(latestVersion, currentVersion);
      
      if (isNewer) {
        logger.info(`Update available: ${latestVersion} (${release.prerelease ? 'prerelease' : 'stable'})`);
        
        // Find Windows installer
        const windowsAsset = release.assets.find(asset => 
          asset.name.includes('.exe') || asset.name.includes('Setup')
        );
      
      if (windowsAsset) {
        const result = dialog.showMessageBoxSync({
          type: 'info',
          title: 'Update Available',
          message: `PomoTimer ${latestVersion} is available!`,
          detail: `You're currently running version ${currentVersion}.\n\nWould you like to download the latest version?`,
          buttons: ['Download Update', 'Remind Me Later', 'Skip This Version'],
          defaultId: 0,
          cancelId: 1
        });

        if (result === 0) {
          // Open download page
          shell.openExternal(windowsAsset.browser_download_url);
          logger.info(`Opened download URL: ${windowsAsset.browser_download_url}`);
        } else if (result === 2) {
          logger.info('User chose to skip this version');
          // TODO: Store skipped version in user preferences
        }
        } else {
          logger.warn('No Windows installer found in release assets');
        }
      } else {
        logger.info('Current version is up to date or newer than latest release');
      }
    } else {
      logger.info('Current version matches latest release');
    }
  } catch (error) {
    logger.error('Error checking for updates:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
  }
}

app.on('ready', () => {
  // Check for updates 5 seconds after app is ready
  setTimeout(() => {
    checkForUpdates();
  }, 5000);
});

// Export for manual triggering (e.g., from menu)
export { checkForUpdates };