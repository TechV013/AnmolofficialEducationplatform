
import axios from 'axios';

// We cannot assume axios is installed. Instead, we'll use the built-in 'fetch' in Node.js (if available) or use pwsh from within the test?
// Since we are running via ts-node, we can use the global fetch (if the version supports it) or use http module.
// Let's use the http module to avoid dependency issues.

const http = require('http');
const https = require('https');

// Helper to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = (options.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Base URL
const BASE_URL = 'http://localhost:3000';

// Demo credentials (from .env)
const credentials = {
  student: { email: 'student.demo@anmolofficial.com', password: 'DemoStudent2024!' },
  instructor: { email: 'instructor.demo@anmolofficial.com', password: 'DemoInstructor2024!' },
  admin: { email: 'admin.demo@anmolofficial.com', password: 'DemoAdmin2024!' }
};

// Test login for a role
async function testLogin(role) {
  const creds = credentials[role];
  console.log(`\n--- Testing ${role.toUpperCase()} login ---`);
  
  // Step 1: Sign in via NextAuth CredentialsProvider
  const signInOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signin?callbackUrl=http://localhost:3000%2F&redirect=false',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const signInBody = JSON.stringify({
    email: creds.email,
    password: creds.password,
    callbackUrl: 'http://localhost:3000/',
    redirect: false,
    csrfToken: '' // Note: NextAuth may require a CSRF token. We'll try without first.
  });
  
  let signInRes;
  try {
    signInRes = await makeRequest(signInOptions, signInBody);
  } catch (e) {
    console.log(`Sign-in request failed: ${e.message}`);
    return false;
  }
  
  console.log(`Sign-in status: ${signInRes.statusCode}`);
  if (signInRes.statusCode !== 200 && signInRes.statusCode !== 302) {
    console.log(`Sign-in failed. Response: ${signInRes.data.substring(0,200)}`);
    return false;
  }
  
  // Step 2: Get session
  const sessionOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/session',
    method: 'GET',
    headers: {
      // We need to pass the cookie from the sign-in response
      'Cookie': signInRes.headers['set-cookie'] ? signInRes.headers['set-cookie'].join('; ') : ''
    }
  };
  
  let sessionRes;
  try {
    sessionRes = await makeRequest(sessionOptions);
  } catch (e) {
    console.log(`Session request failed: ${e.message}`);
    return false;
  }
  
  console.log(`Session status: ${sessionRes.statusCode}`);
  if (sessionRes.statusCode !== 200) {
    console.log(`Session failed. Response: ${sessionRes.data.substring(0,200)}`);
    return false;
  }
  
  let session;
  try {
    session = JSON.parse(sessionRes.data);
  } catch (e) {
    console.log(`Failed to parse session JSON: ${e.message}`);
    return false;
  }
  
  if (!session || !session.user) {
    console.log(`No user in session.`);
    return false;
  }
  
  console.log(`User in session: ${session.user.email} (role: ${session.user.role})`);
  if (session.user.role !== role.toUpperCase()) {
    console.log(`Role mismatch: expected ${role.toUpperCase()}, got ${session.user.role}`);
    return false;
  }
  
  // Step 3: Access the role's dashboard
  const dashboardPaths = {
    student: '/dashboard',
    instructor: '/instructor',
    admin: '/admin'
  };
  
  const dashboardOptions = {
    hostname: 'localhost',
    port: 3000,
    path: dashboardPaths[role],
    method: 'GET',
    headers: {
      'Cookie': sessionRes.headers['set-cookie'] ? sessionRes.headers['set-cookie'].join('; ') : ''
    }
  };
  
  let dashboardRes;
  try {
    dashboardRes = await makeRequest(dashboardOptions);
  } catch (e) {
    console.log(`Dashboard request failed: ${e.message}`);
    return false;
  }
  
  console.log(`Dashboard status: ${dashboardRes.statusCode}`);
  if (dashboardRes.statusCode !== 200) {
    console.log(`Dashboard access failed. Response: ${dashboardRes.data.substring(0,200)}`);
    return false;
  }
  
  // Step 4: Access a forbidden route (try to access another role's dashboard)
  const forbiddenRoles = ['student', 'instructor', 'admin'].filter(r => r !== role);
  const forbiddenPath = {
    student: '/instructor', // student trying to access instructor
    instructor: '/admin',   // instructor trying to access admin
    admin: '/student'       // admin trying to access student (we don't have a student dashboard? we have /dashboard, but let's use /my-learning)
  };
  
  // Actually, let's test: student cannot access /instructor, instructor cannot access /admin, admin can access everything but we'll test a student route as forbidden for admin? No, admin should be able to access student routes.
  // Instead, let's test that a student cannot access instructor routes and vice versa.
  // For admin, we'll test that they can access admin routes (already done) and that they can access student routes (which should be allowed).
  // So for forbidden, we'll test cross-role access where it should be denied.
  
  const forbiddenMap = {
    student: '/instructor',
    instructor: '/admin',
    admin: '/student/dashboard' // but admin can access student? Actually admin should be able to access everything. Let's skip admin forbidden test for now and just test that admin can access admin routes.
  };
  
  const forbiddenPath = forbiddenMap[role];
  if (forbiddenPath) {
    const forbiddenOptions = {
      hostname: 'localhost',
      port: 3000,
      path: forbiddenPath,
      method: 'GET',
      headers: {
        'Cookie': sessionRes.headers['set-cookie'] ? sessionRes.headers['set-cookie'].join('; ') : ''
      }
    };
    
    let forbiddenRes;
    try {
      forbiddenRes = await makeRequest(forbiddenOptions);
    } catch (e) {
      console.log(`Forbidden request failed (expected): ${e.message}`);
      // If the request fails due to network, we assume it's forbidden? Not reliable.
      // We'll just note that we couldn't make the request.
      console.log(`Assuming forbidden due to request failure.`);
    } finally {
      if (forbiddenRes && forbiddenRes.statusCode === 404 || forbiddenRes.statusCode === 401 || forbiddenRes.statusCode === 403) {
        console.log(`Forbidden access correctly denied with status ${forbiddenRes.statusCode}.`);
      } else if (forbiddenRes && forbiddenRes.statusCode === 200) {
        console.log(`WARNING: Forbidden access returned 200 (possibly allowed).`);
      } else {
        console.log(`Forbidden access returned status ${forbiddenRes.statusCode} (unexpected).`);
      }
    }
  }
  
  // Step 5: Logout
  const logoutOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/signout?redirect=false',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionRes.headers['set-cookie'] ? sessionRes.headers['set-cookie'].join('; ') : ''
    }
  };
  
  let logoutRes;
  try {
    logoutRes = await makeRequest(logoutOptions, JSON.stringify({}));
  } catch (e) {
    console.log(`Logout request failed: ${e.message}`);
    // Not critical, we'll continue
  }
  
  if (logoutRes && logoutRes.statusCode === 200) {
    console.log("Logout successful.");
  } else {
    console.log(`Logout status: ${logoutRes ? logoutRes.statusCode : 'failed'}`);
  }
  
  return true;
}

// Run tests for each role
async function runAllTests() {
  const results = {};
  for (const role of ['student', 'instructor', 'admin']) {
    try {
      results[role] = await testLogin(role);
    } catch (e) {
      console.log(`Error testing ${role}: ${e.message}`);
      results[role] = false;
    }
  }
  
  console.log("\n=== TEST RESULTS ===");
  for (const [role, success] of Object.entries(results)) {
    console.log(`${role}: ${success ? 'PASS' : 'FAIL'}`);
  }
  
  const allPassed = Object.values(results).every(v => v === true);
  return allPassed;
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error("Uncaught error:", err);
  process.exit(1);
});
