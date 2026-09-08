---
name: commit-msg
description: Stage all changes, read the staged diff, generate a Conventional-Commits-style message, and run git commit. Use when asked to "make commit", "generate commit", "commit changes", or when /commit-msg is run.
model: haiku
---

# commit-msg — stage, describe, commit

## 1. Stage all changes

```bash
git add -A
```

## 2. Read the staged diff

```bash
git --no-pager diff --staged
```

If the diff is empty, stop and tell the user there is nothing to commit.

## 3. Generate the commit message

Format:

```
type(scope): short subject

- bullet of what changed
- bullet of why
```

Rules:
- `type` is one of: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`.
- `scope` is the affected area (e.g. `auto-experiments`, `statusTabs`, a filename stem). Omit the parentheses only if no scope fits.
- Subject line under 60 characters, imperative mood, no trailing period.
- Body bullets are optional but encouraged: one bullet for *what* changed, one for *why*.
- **Never** include a `Co-Authored-By` trailer or any other trailer.

## 4. Commit

```bash
git commit -m "$(cat <<'EOF'
type(scope): short subject

- bullet of what changed
- bullet of why
EOF
)"
```

Then show the user the resulting `git log -1 --stat`.
