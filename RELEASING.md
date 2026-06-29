# Releasing knowledge-os

How to ship a change so the **code, version, tags, GitHub Releases and descriptions** all stay in
sync. We learned this the hard way — follow the checklist.

## The golden rule
**Bumping the version in `plugin.json` / `package.json` is NOT a release.** A version only "exists"
on GitHub when there is a matching **git tag** *and* **GitHub Release**. Code on `main` and the
Releases list are two different things — keep them in lockstep, every time.

## When to bump (semver, pre-1.0)
- **patch** `0.0.x` — bug fix, docs/wording, metadata; no behavior change.
- **minor** `0.x.0` — new feature, command, mechanic, template or engine change.
- Pre-1.0 we don't cut majors; a breaking change ships as a minor with a clear CHANGELOG note.

## Release checklist (every shippable change)
1. Work on a clean `main` (or a branch → PR if collaborating).
2. If engine/behavior changed: `npm test` **and** `node scripts/check-secrets.mjs` — both green.
3. Bump the version in **both** `.claude-plugin/plugin.json` and `package.json` (keep them equal).
4. Add a `## X.Y.Z` section at the top of `CHANGELOG.md`, in user terms.
5. If a feature was added/renamed, refresh the descriptions so they don't drift:
   - `.claude-plugin/plugin.json` → `description` (+ `keywords`)
   - `.claude-plugin/marketplace.json` → `description`
   - GitHub **About** + topics (see below)
   - `README.md` tagline, if needed.
6. Commit: `git commit -m "vX.Y.Z — short summary"` (mind the commit-message pitfall below).
7. Push the code: `git push origin main`.
8. **Tag + Release** (the easy-to-forget step):
   ```sh
   v=X.Y.Z
   git tag -a "v$v" -m "v$v" && git push origin "v$v"
   gh release create "v$v" \
     --title "v$v — short summary" \
     --notes "$(awk -v h="## $v" 'index($0,h)==1{f=1;next} f&&/^## /{exit} f' CHANGELOG.md)" \
     --latest
   ```
9. Verify: `gh release list` shows `vX.Y.Z` as **Latest**, and the About description is current:
   `gh api repos/<owner>/<repo> -q .description`.

## Update GitHub About + topics
```sh
gh repo edit <owner>/<repo> \
  --description "…one-paragraph, current pitch…" \
  --add-topic <topic>
```

## Pitfalls we actually hit (don't repeat them)
- **Version bump ≠ release.** We bumped `0.5.0 → 0.14.0` in files but created no tags, so the
  Releases widget sat at `v0.4.0`. Always do step 8.
- **`gh release create --target <sha>` needs a FULL 40-char SHA.** A short SHA is rejected
  (`target_commitish is invalid`). Simplest: create & push the **tag** first, then
  `gh release create` on the existing tag (no `--target` needed).
- **zsh does not word-split unquoted variables.** `for x in $LIST` runs **once** in zsh. Use
  `while IFS=: read -r a b; do …; done <<'EOF'`, a real array, or `bash -c '…'`.
- **Backticks in `git commit -m "…"`** are executed by the shell (command substitution) and the
  backticked words vanish from the message. Avoid backticks in `-m`; use single quotes or `-F file`.
- **HTTPS push auth.** If `git push` says *"could not read Username for https://github.com"*, run
  `gh auth setup-git` once — it makes git use your `gh` login as the credential helper.
- **Descriptions drift.** `plugin.json`, `marketplace.json`, GitHub About and the README tagline are
  four copies of the pitch — update them together when a feature lands (step 5).

## Re-create a missing release from the CHANGELOG
```sh
v=X.Y.Z
git tag -a "v$v" <full-sha> -m "v$v" && git push origin "v$v"
gh release create "v$v" --title "v$v — $(git log -1 --pretty=%s "v$v")" \
  --notes "$(awk -v h="## $v" 'index($0,h)==1{f=1;next} f&&/^## /{exit} f' CHANGELOG.md)"
```
