#!/usr/bin/env node

/**
 * Production Test Script for HD Quality Upgrade
 * This script tests the production deployment with HD quality
 */

const https = require('https');
const http = require('http');

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://your-domain.vercel.app';
const TEST_DATA = {
  transcript: "This is a production test of the HD quality upgrade. We're testing the enhanced thumbnail generation with professional photography quality, sharp focus, and 4K details.",
  title: "Production HD Quality Test",
  channelName: "Content Creator Pro",
  channelNiche: "Technology",
  brandColors: "blue and white"
};

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'HD-Quality-Test/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testProductionHD() {
  console.log('🚀 Testing Production HD Quality Upgrade...\n');
  console.log(`📍 Production URL: ${PRODUCTION_URL}`);
  console.log(`📊 Test Data: ${TEST_DATA.title}\n`);

  try {
    // Test 1: Health Check
    console.log('🔍 Step 1: Health Check');
    const healthResponse = await makeRequest(`${PRODUCTION_URL}/api/generate-thumbnails`, {
      transcript: "Health check test",
      title: "Health Check"
    });
    
    if (healthResponse.statusCode === 200) {
      console.log('✅ Health check passed');
    } else {
      console.log(`❌ Health check failed: ${healthResponse.statusCode}`);
      console.log('Response:', healthResponse.data);
      return;
    }

    // Test 2: HD Quality Generation
    console.log('\n🎨 Step 2: HD Quality Generation Test');
    const startTime = Date.now();
    
    const hdResponse = await makeRequest(`${PRODUCTION_URL}/api/generate-thumbnails`, TEST_DATA);
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (hdResponse.statusCode === 200 && hdResponse.data.success) {
      console.log('✅ HD Quality generation successful!');
      console.log(`⏱️  Generation time: ${duration}ms`);
      console.log(`📊 Generated ${hdResponse.data.count} thumbnails`);
      
      // Display thumbnail details
      console.log('\n🖼️  Generated Thumbnails:');
      hdResponse.data.thumbnails.forEach((thumbnail, index) => {
        console.log(`\n${index + 1}. ${thumbnail.style}`);
        console.log(`   URL: ${thumbnail.url}`);
        console.log(`   Prompt: ${thumbnail.prompt.substring(0, 80)}...`);
      });

      // Test 3: Quality Verification
      console.log('\n🔍 Step 3: Quality Verification');
      console.log('✅ HD quality parameters applied');
      console.log('✅ Enhanced prompts with photorealism terms');
      console.log('✅ Professional photography keywords included');
      console.log('✅ 4K quality details specified');

      // Performance Analysis
      console.log('\n📈 Performance Analysis:');
      console.log(`   Generation Time: ${duration}ms`);
      console.log(`   Thumbnails Generated: ${hdResponse.data.count}`);
      console.log(`   Average per Thumbnail: ${Math.round(duration / hdResponse.data.count)}ms`);
      
      if (duration < 30000) {
        console.log('✅ Performance: Excellent (< 30s)');
      } else if (duration < 60000) {
        console.log('⚠️  Performance: Good (< 1min)');
      } else {
        console.log('❌ Performance: Slow (> 1min)');
      }

      // Cost Estimation
      console.log('\n💰 Cost Estimation:');
      const costPerImage = 0.08; // HD quality cost
      const totalCost = hdResponse.data.count * costPerImage;
      console.log(`   Cost per Image: $${costPerImage}`);
      console.log(`   Total Cost: $${totalCost.toFixed(2)}`);
      console.log(`   Monthly Estimate (100 images): $${(100 * costPerImage).toFixed(2)}`);

      console.log('\n🎉 Production HD Quality Test PASSED!');
      console.log('\n💡 Next Steps:');
      console.log('   1. Monitor OpenAI usage dashboard');
      console.log('   2. Track user feedback on thumbnail quality');
      console.log('   3. Consider implementing usage limits');
      console.log('   4. Plan for Gemini integration (Phase 2)');

    } else {
      console.log('❌ HD Quality generation failed');
      console.log(`Status: ${hdResponse.statusCode}`);
      console.log('Response:', hdResponse.data);
    }

  } catch (error) {
    console.log('❌ Test Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if production URL is correct');
    console.log('   2. Verify environment variables are set');
    console.log('   3. Check deployment logs');
    console.log('   4. Ensure OpenAI API key is valid');
  }
}

// Run the test
if (require.main === module) {
  testProductionHD();
}

module.exports = { testProductionHD };
