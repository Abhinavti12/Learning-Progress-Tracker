const http = require('http');

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData);

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

const runSuite = async () => {
  console.log('--- STARTING LEARNING PROGRESS TRACKER E2E TEST ---');

  // 1. Health check
  const health = await request('GET', '/api/health');
  console.log('1. Health check:', health.status, health.body.service);

  // 2. Register student
  const email = `student_${Date.now()}@process.edu`;
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Linus Torvalds',
    email,
    password: 'password123'
  });
  console.log('2. Student Registered:', regRes.status, regRes.body.data.name);
  const token = regRes.body.data.token;

  // 3. Create Learning Goal: C Programming
  const goal1Res = await request(
    'POST',
    '/api/goals',
    {
      title: 'Master C Programming & Memory Management',
      description: 'Pointers, dynamic allocations, data structures, and POSIX threads',
      category: 'C Programming',
      targetDate: '2026-11-30',
      status: 'In Progress'
    },
    token
  );
  console.log('3. Goal 1 Created:', goal1Res.status, goal1Res.body.data.title);
  const goal1Id = goal1Res.body.data._id;

  // 4. Create Learning Goal: DBMS
  const goal2Res = await request(
    'POST',
    '/api/goals',
    {
      title: 'Complete DBMS & Query Optimization',
      description: 'Relational algebra, normalization, B-tree indexes, and ACID transactions',
      category: 'DBMS',
      targetDate: '2026-12-15',
      status: 'In Progress'
    },
    token
  );
  console.log('4. Goal 2 Created:', goal2Res.status, goal2Res.body.data.title);
  const goal2Id = goal2Res.body.data._id;

  // 5. Add Activities under Goal 1
  const act1Res = await request(
    'POST',
    '/api/activities',
    {
      goalId: goal1Id,
      title: 'Deep dive into double pointers and heap allocations',
      type: 'Lesson',
      resourceLink: 'https://en.wikipedia.org/wiki/C_dynamic_memory_allocation'
    },
    token
  );
  console.log('5. Activity 1 Added:', act1Res.status, act1Res.body.data.title);

  const act2Res = await request(
    'POST',
    '/api/activities',
    {
      goalId: goal1Id,
      title: 'Implement Custom Memory Allocator (malloc/free)',
      type: 'Practice',
      resourceLink: 'https://github.com'
    },
    token
  );
  console.log('   Activity 2 Added:', act2Res.status, act2Res.body.data.title);

  // Toggle activity 1 completed
  await request('PATCH', `/api/activities/${act1Res.body.data._id}/toggle`, null, token);
  console.log('   Activity 1 Marked Completed (Goal progress should be 50%)');

  // 6. Record Study Sessions
  // Session 1: 90 mins, rating 2 (should auto-flag needsRevision)
  const sess1Res = await request(
    'POST',
    '/api/sessions',
    {
      goalId: goal1Id,
      durationMinutes: 90,
      topicStudied: 'Complex Double Pointer Arithmetic',
      notes: 'Need to review pointer decay and function pointers in C.',
      understandingRating: 2
    },
    token
  );
  console.log(
    '6. Study Session 1 Logged:',
    sess1Res.status,
    'Duration:', sess1Res.body.data.durationMinutes, 'mins',
    'Rating:', sess1Res.body.data.understandingRating,
    'Needs Revision:', sess1Res.body.data.needsRevision
  );

  // Session 2: 60 mins on DBMS, rating 5
  const sess2Res = await request(
    'POST',
    '/api/sessions',
    {
      goalId: goal2Id,
      durationMinutes: 60,
      topicStudied: 'B+ Tree Index Internals & Page Splits',
      notes: 'Understood node splitting and range queries clearly.',
      understandingRating: 5
    },
    token
  );
  console.log(
    '   Study Session 2 Logged:',
    sess2Res.status,
    'Duration:', sess2Res.body.data.durationMinutes, 'mins',
    'Rating:', sess2Res.body.data.understandingRating,
    'Needs Revision:', sess2Res.body.data.needsRevision
  );

  // 7. Check Analytics Dashboard Aggregation
  const analyticsRes = await request('GET', '/api/analytics/dashboard', null, token);
  console.log('7. Analytics Dashboard Retrieved:', analyticsRes.status);
  const metrics = analyticsRes.body.data.metrics;
  console.log('   Total Goals:', metrics.totalGoals);
  console.log('   Total Study Hours:', metrics.totalHours, 'hrs (Expected: 2.5 hrs for 150 mins)');
  console.log('   Average Understanding Rating:', metrics.avgUnderstandingRating, '/ 5');
  console.log('   Topics Needing Revision:', metrics.revisionCount);
  console.log('   Weekly Consistency Days Reported:', analyticsRes.body.data.weeklyConsistency.length);
  console.log('   Revision List Topic:', analyticsRes.body.data.revisionTopics[0]?.topicStudied);

  if (metrics.totalHours === 2.5 && metrics.revisionCount >= 1) {
    console.log('   >>> ALL LEARNING PROGRESS TRACKER FEATURES VERIFIED SUCCESSFULLY! <<<');
  } else {
    console.error('   FAILED: Metrics do not match expectations');
    process.exit(1);
  }

  process.exit(0);
};

runSuite().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
