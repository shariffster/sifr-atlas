import { spawnSync } from 'node:child_process';
import { readExecutionProfile } from './execution-profile.mjs';

// The managed installer depends on Linux locking tools. Portable checkouts use
// the same pinned package manager and lockfile through its native installer.
const managed = readExecutionProfile() === 'managed-linux';
const result = spawnSync(managed ? 'bash' : 'pnpm', managed
  ? ['scripts/install-pnpm.sh']
  : ['install', '--frozen-lockfile'], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
