---
description: Deploy dashboard changes to production via PR workflow
user_invocable: true
command: deploy
---

# Deploy Dashboard

Deploy current changes to the ClawPi Scout Dashboard on Vercel.

## Steps

1. Run `npm run build` to verify the production build passes with no errors.
2. Check `git status` and `git diff` to review all changes.
3. Stage and commit changes with a descriptive commit message.
4. Create a feature branch if not already on one: `git checkout -b feat/description`.
5. Push the branch: `git push -u origin $(git branch --show-current)`.
6. Create a pull request: `gh pr create` with a title and summary.
7. Merge the PR: `gh pr merge --squash --delete-branch`.
8. Verify deployment by checking `curl -s https://clawpi-scout-dashboard.vercel.app/api/stats | head -c 100` returns valid JSON.

## Important

- Never push directly to `main`. Always go through a PR.
- If the build fails, fix the errors before committing.
- Vercel auto-deploys when `main` is updated via the merged PR.
- Deployment typically takes ~30 seconds after merge.
