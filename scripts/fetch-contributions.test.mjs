import assert from 'node:assert';
import { buildQuery, parseResponse } from './fetch-contributions.mjs';

{
  const query = buildQuery();
  assert.ok(query.includes('contributionsCollection'));
  assert.ok(query.includes('$username'), 'username must be a GraphQL variable, not interpolated');
  console.log('buildQuery: PASS');
}

{
  const fixture = {
    data: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            weeks: [
              { contributionDays: [{ date: '2025-01-01', contributionCount: 3 }, { date: '2025-01-02', contributionCount: 0 }] },
              { contributionDays: [{ date: '2025-01-08', contributionCount: 5 }] },
            ],
          },
        },
      },
    },
  };
  const days = parseResponse(fixture);
  assert.strictEqual(days.length, 3);
  assert.deepStrictEqual(days[0], { date: '2025-01-01', contributionCount: 3 });
  assert.deepStrictEqual(days[2], { date: '2025-01-08', contributionCount: 5 });
  console.log('parseResponse (success): PASS');
}

{
  const errorFixture = { errors: [{ message: 'Bad credentials' }] };
  assert.throws(() => parseResponse(errorFixture), /Bad credentials/);
  console.log('parseResponse (error): PASS');
}

console.log('Task 3 tests complete');
