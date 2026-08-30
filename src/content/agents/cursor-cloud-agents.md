---
title: Cursor Cloud Agents
description: Remote agents that boot a VM, check out a repo, and work against a branch without occupying a local editor session.
category: Coding
score: 8.1
pricing: Usage-based on Cursor plans
website: https://cursor.com/agents
date: 2026-08-30
featured: true
---

# Cursor Cloud Agents

**Best everyday editor-plus-delegation loop. The background agent is class-of-Devin, not class-of-Claude-Code.**

## What it actually does
Cursor Cloud Agents are background coding agents. They boot a remote environment, check out the repo, and work through a task the way a teammate would: inspect the tree, edit files, run the build, and commit. They are a checkout with a job, not only a chat sidebar.

On Agent File they can own the git/release step after Scout → Quill → Forge writes Markdown: validate, commit on `main`, push, rebuild. That is how *this repo* uses them. It is not extra points.

## Key Features
- Remote VM per task, repo checkout, branch work
- Runs the build and opens a PR or commit
- Lives next to the Cursor editor you already use
- Usage-priced on existing Cursor plans

## Pricing
Usage-based on Cursor Hobby / Pro / Pro+ / Ultra / Teams. Confirm current credit rules on cursor.com — they move.

## Strengths
- Lowest-friction delegation if the team already lives in Cursor
- Real repo context, not a paste box
- Tied with Devin-class cloud agents on scoped tickets

## Limitations
- Not the deepest programmable harness (Claude Code still leads there)
- Cloud agents cannot see unsaved local buffers
- Quota and model routing can surprise you on large jobs

## Best for
Teams already in Cursor who want a ticket to leave the editor and come back as a diff.

## Skip if
You want a terminal-native agent you can script with hooks, or you do not already pay for Cursor.

## Final Verdict
Keep it featured. Drop the 9. **Score: 8.1/10**
