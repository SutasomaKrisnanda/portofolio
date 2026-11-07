## 2026-11-05T14:10:46Z
You are teamwork_explorer 2 for Milestone 1 Iteration 3: package.json Script Deduplication Architect.
Your working directory is: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it3_2\
Parent orchestrator conversation ID: 514f318a-382e-4a4c-bf5e-58e0d0eff1f1

MANDATORY FIRST STEP:
Read the user request at:
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md
Also read:
w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\orchestrator\GATE_STATUS.md
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\reviewer_m1_it2_2\handoff.md
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\challenger_m1_it2_2\handoff.md

MISSION:
Gate for Milestone 1 Iteration 2 reported a double-clean race condition in `package.json`:
`"prebuild"` runs `node scripts/clean.js`, and `"build"` also ran `node scripts/clean.js && ...`.
Your task:
1. Examine `package.json` scripts and define the cleanest, standard build script configuration:
   - `"clean": "node scripts/clean.js"`
   - `"prebuild": "node scripts/clean.js"`
   - `"build": "node -r ./patch-fs.js node_modules/next/dist/bin/next build"`
2. Verify how npm lifecycle scripts execute `"prebuild"` before `"build"`, eliminating race conditions.
3. Detail exact instructions for the Worker.

OUTPUT:
Write your recommendation report to:
`w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it3_2\recommendations.md`
and write `handoff.md`. Notify orchestrator via send_message.
