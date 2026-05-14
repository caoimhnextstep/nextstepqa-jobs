# NextStepQA Worker

Scheduled job ingestion worker. Runs every 6 hours on Railway.

## What it does

1. Fetches all ATS feeds (Greenhouse, Lever, Workable, SmartRecruiters, Ashby)
2. Normalises, deduplicates, classifies
3. Pushes three JSON files to GitHub:
   - `data/jobs-snapshot.json` — all jobs, scored and classified
   - `data/stats.json` — dashboard stats
   - `data/failed-sources.json` — source health monitoring

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Yes | GitHub PAT with `repo` scope |
| `GITHUB_REPO` | No | Default: `caoimhnextstep/nextstepqa-jobs` |
| `GITHUB_BRANCH` | No | Default: `main` |
| `CRON_INTERVAL_HOURS` | No | Set to `6` on Railway for scheduled runs |

## Local development

```bash
npm install
node worker.js   # dry run (no GITHUB_TOKEN = logs only)
```

## Railway deployment

1. Create new Railway project
2. Connect this repo
3. Set environment variables above
4. Add cron schedule: `0 */6 * * *`

## Frontend

The frontend fetches:
```
https://raw.githubusercontent.com/caoimhnextstep/nextstepqa-jobs/main/data/jobs-snapshot.json
```

Static JSON, instant load, no serverless functions needed.
