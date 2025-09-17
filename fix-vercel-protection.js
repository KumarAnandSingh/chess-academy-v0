#!/usr/bin/env node

/**
 * Chess Academy - Vercel Protection Fix
 * Programmatically removes password protection and team restrictions
 */

import { execSync } from 'child_process';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class VercelProtectionFixer {
  constructor() {
    this.projectData = this.loadProjectData();
    this.token = this.getVercelToken();
  }

  loadProjectData() {
    try {
      const projectFile = fs.readFileSync('./.vercel/project.json', 'utf8');
      return JSON.parse(projectFile);
    } catch (error) {
      console.error('❌ Could not load project data. Run "npx vercel link" first.');
      process.exit(1);
    }
  }

  getVercelToken() {
    try {
      // Try to get token from various sources
      const sources = [
        () => process.env.VERCEL_TOKEN,
        () => execSync('npx vercel env pull --environment=production --yes > /dev/null 2>&1 && grep VERCEL_TOKEN .env.production | cut -d"=" -f2', { encoding: 'utf8' }).trim(),
        () => execSync('cat ~/.vercel/auth.json | grep -o \'"token":"[^"]*\' | cut -d\'"\'  -f4', { encoding: 'utf8' }).trim()
      ];

      for (const getToken of sources) {
        try {
          const token = getToken();
          if (token && token.length > 20) {
            return token;
          }
        } catch (e) {
          continue;
        }
      }

      console.log('⚠️  No Vercel token found. Proceeding with CLI-only approach.');
      return null;
    } catch (error) {
      return null;
    }
  }

  async makeApiRequest(path, method = 'GET', data = null) {
    if (!this.token) {
      throw new Error('No token available for API requests');
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.vercel.com',
        path: path,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(result);
            } else {
              reject(new Error(`API Error ${res.statusCode}: ${result.error?.message || body}`));
            }
          } catch (e) {
            reject(new Error(`Parse Error: ${e.message}`));
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async removePasswordProtection() {
    console.log('🔓 Removing password protection...');

    const updateData = {
      passwordProtection: null,
      publicSource: true,
      framework: 'vite'
    };

    try {
      const result = await this.makeApiRequest(
        `/v9/projects/${this.projectData.projectId}`,
        'PATCH',
        updateData
      );
      console.log('✅ Password protection removed via API');
      return true;
    } catch (error) {
      console.log(`⚠️  API method failed: ${error.message}`);
      return false;
    }
  }

  async removeTeamRestrictions() {
    console.log('🌐 Removing team access restrictions...');

    try {
      // Update team settings
      const result = await this.makeApiRequest(
        `/v9/projects/${this.projectData.projectId}`,
        'PATCH',
        {
          teamAccess: false,
          publicAccess: true
        }
      );
      console.log('✅ Team restrictions removed via API');
      return true;
    } catch (error) {
      console.log(`⚠️  Team API method failed: ${error.message}`);
      return false;
    }
  }

  cliRemoveProtection() {
    console.log('🔧 Using CLI method to remove protection...');

    try {
      // Remove environment variables that might enforce protection
      execSync('npx vercel env rm VERCEL_PASSWORD_PROTECTION --yes', { stdio: 'ignore' });
      execSync('npx vercel env rm VERCEL_TEAM_ACCESS --yes', { stdio: 'ignore' });

      // Add public access variable
      execSync('echo "true" | npx vercel env add VERCEL_PUBLIC_ACCESS production', { stdio: 'ignore' });

      console.log('✅ Protection removed via CLI');
      return true;
    } catch (error) {
      console.log(`⚠️  CLI method failed: ${error.message}`);
      return false;
    }
  }

  async deployWithPublicAccess() {
    console.log('🚀 Deploying with public access...');

    try {
      // Build and deploy
      execSync('npm run build', { stdio: 'inherit' });
      execSync('npx vercel deploy --prod --public', { stdio: 'inherit' });

      console.log('✅ Deployment completed');
      return true;
    } catch (error) {
      console.log(`❌ Deployment failed: ${error.message}`);
      return false;
    }
  }

  async verifyAccess() {
    console.log('🧪 Verifying public access...');

    const urls = [
      'https://studyify.in',
      'https://studyify.in/multiplayer'
    ];

    const results = [];

    for (const url of urls) {
      try {
        const response = await this.checkUrl(url);
        results.push({ url, status: response.status, success: response.status === 200 });
        console.log(`${response.status === 200 ? '✅' : '❌'} ${url} - HTTP ${response.status}`);
      } catch (error) {
        results.push({ url, status: 'ERROR', success: false });
        console.log(`❌ ${url} - ${error.message}`);
      }
    }

    return results;
  }

  checkUrl(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'HEAD',
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        resolve({ status: res.statusCode });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  async run() {
    console.log('🎯 Chess Academy - Fixing Vercel 401 Protection');
    console.log(`📁 Project: ${this.projectData.projectName}`);
    console.log(`🆔 Project ID: ${this.projectData.projectId}`);
    console.log('');

    // Try API method first
    if (this.token) {
      console.log('🔑 Token available - using API methods');
      await this.removePasswordProtection();
      await this.removeTeamRestrictions();
    } else {
      console.log('🔧 No token - using CLI methods');
      this.cliRemoveProtection();
    }

    // Deploy with fixes
    await this.deployWithPublicAccess();

    // Verify access
    console.log('');
    const results = await this.verifyAccess();

    console.log('');
    console.log('📊 Summary:');
    const allSuccessful = results.every(r => r.success);
    console.log(`${allSuccessful ? '✅' : '❌'} Public access: ${allSuccessful ? 'WORKING' : 'NEEDS ATTENTION'}`);

    if (!allSuccessful) {
      console.log('');
      console.log('🔧 If issues persist:');
      console.log('1. Wait 5-10 minutes for DNS propagation');
      console.log('2. Check in incognito browser mode');
      console.log('3. Contact Vercel support for team-level restrictions');
      console.log('4. Consider alternative deployment platform');
    }

    console.log('');
    console.log('🌐 Production URLs:');
    console.log('   Main: https://studyify.in');
    console.log('   Multiplayer: https://studyify.in/multiplayer');
  }
}

// Run the fixer
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new VercelProtectionFixer();
  fixer.run().catch(console.error);
}

export default VercelProtectionFixer;