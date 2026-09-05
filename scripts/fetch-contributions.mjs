export function buildQuery() {
  return `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;
}

export function parseResponse(json) {
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }
  const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!weeks) {
    throw new Error('Unexpected GraphQL response shape: missing contributionCalendar.weeks');
  }
  return weeks.flatMap((week) => week.contributionDays);
}

async function main() {
  const token = process.env.PROFILE_TOKEN;
  const username = process.env.GITHUB_USERNAME;
  if (!token || !username) {
    console.error('PROFILE_TOKEN and GITHUB_USERNAME environment variables are required');
    process.exit(1);
  }

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: buildQuery(), variables: { username } }),
  });

  if (!res.ok) {
    console.error(`GitHub API request failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const json = await res.json();
  const days = parseResponse(json);
  process.stdout.write(JSON.stringify(days));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
