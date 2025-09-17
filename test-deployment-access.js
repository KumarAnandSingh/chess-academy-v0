#!/usr/bin/env node

/**
 * Chess Academy - Deployment Access Tester
 * Tests current deployment URLs and provides solution summary
 */

import https from 'https';

class DeploymentTester {
  async testUrl(url, description) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'HEAD',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      };

      const req = https.request(options, (res) => {
        const status = res.statusCode;
        const success = status === 200;
        console.log(`${success ? '✅' : '❌'} ${description}: HTTP ${status} - ${url}`);

        if (!success && status === 401) {
          console.log(`   🔒 401 Error: Authentication required (Vercel team protection)`);
        }

        resolve({ url, status, success, description });
      });

      req.on('error', (error) => {
        console.log(`❌ ${description}: ERROR - ${error.message} - ${url}`);
        resolve({ url, status: 'ERROR', success: false, description, error: error.message });
      });

      req.on('timeout', () => {
        console.log(`❌ ${description}: TIMEOUT - ${url}`);
        req.destroy();
        resolve({ url, status: 'TIMEOUT', success: false, description });
      });

      req.end();
    });
  }

  async testCurrentDeployments() {
    console.log('🧪 Testing Chess Academy Deployment Access');
    console.log('================================================');
    console.log('');

    const urls = [
      { url: 'https://studyify.in', desc: 'Custom Domain (studyify.in)' },
      { url: 'https://studyify.in/multiplayer', desc: 'Multiplayer Page (studyify.in)' },
      { url: 'https://chess-academy-rho.vercel.app', desc: 'Vercel App Domain' },
      { url: 'https://chess-academy-rho.vercel.app/multiplayer', desc: 'Vercel Multiplayer' }
    ];

    const results = [];
    for (const { url, desc } of urls) {
      const result = await this.testUrl(url, desc);
      results.push(result);
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('');
    console.log('📊 Summary Report');
    console.log('=================');

    const working = results.filter(r => r.success);
    const failing = results.filter(r => !r.success);

    console.log(`✅ Working URLs: ${working.length}`);
    console.log(`❌ Failing URLs: ${failing.length}`);

    if (failing.length > 0) {
      console.log('');
      console.log('🔧 SOLUTION: 401 Errors Detected');
      console.log('================================');
      console.log('');
      console.log('The 401 errors are caused by Vercel team-level password protection.');
      console.log('This cannot be bypassed programmatically.');
      console.log('');
      console.log('✨ IMMEDIATE SOLUTIONS:');
      console.log('');
      console.log('1. 🚀 Deploy to Alternative Platform (RECOMMENDED):');
      console.log('   ./deploy-alternative.sh');
      console.log('   This creates public deployments on Netlify and Surge');
      console.log('');
      console.log('2. 🔄 Create Fresh Vercel Deployment:');
      console.log('   ./deploy-public-vercel.sh');
      console.log('   This uses --public flag to bypass restrictions');
      console.log('');
      console.log('3. 📞 Contact Vercel Support:');
      console.log('   Request removal of team-level password protection');
      console.log('');
      console.log('🎯 RESULT: Public access to multiplayer chess game');
      console.log('');
    }

    if (working.length > 0) {
      console.log('🎉 SUCCESS: These URLs are working:');
      working.forEach(r => {
        console.log(`   ✅ ${r.url}`);
      });
    }

    return results;
  }

  async generateQuickFix() {
    console.log('🛠️  Quick Fix Command');
    console.log('====================');
    console.log('');
    console.log('Run this command to immediately fix the 401 error:');
    console.log('');
    console.log('# Option 1: Alternative Platforms (Recommended)');
    console.log('./deploy-alternative.sh');
    console.log('');
    console.log('# Option 2: Fresh Vercel Deployment');
    console.log('./deploy-public-vercel.sh');
    console.log('');
    console.log('# Option 3: Manual Vercel Fix');
    console.log('node fix-vercel-protection.js');
    console.log('');
  }
}

// Run the tester
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new DeploymentTester();

  console.log('🎯 Chess Academy - Deployment Access Test');
  console.log('==========================================');
  console.log('Date:', new Date().toISOString());
  console.log('');

  tester.testCurrentDeployments()
    .then(() => {
      console.log('');
      return tester.generateQuickFix();
    })
    .catch(console.error);
}

export default DeploymentTester;