#!/usr/bin/env python3
"""
Script to pin GitHub Actions to their commit SHAs.

This script scans GitHub Actions workflow files and replaces version tags
(like @v4) with their corresponding commit SHAs (like @abc123...).

Usage:
    python scripts/pin-github-actions.py .github/workflows/
    python scripts/pin-github-actions.py .github/workflows/my-workflow.yml
"""

import re
import sys
import requests
from pathlib import Path
from typing import Dict, Optional


def get_commit_sha_for_tag(repo: str, tag: str) -> Optional[str]:
    """
    Get the commit SHA for a given tag in a GitHub repository.

    Args:
        repo: Repository in format 'owner/repo' or 'owner/repo/subpath'
        tag: Tag name (e.g., 'v4', 'v5.0.1')

    Returns:
        Commit SHA or None if not found
    """
    # Extract owner/repo from potential subpaths
    parts = repo.split('/')
    if len(parts) >= 2:
        owner_repo = f"{parts[0]}/{parts[1]}"
    else:
        print(f"Invalid repo format: {repo}")
        return None

    # Try to get the tag reference
    url = f"https://api.github.com/repos/{owner_repo}/git/refs/tags/{tag}"
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Warning: Could not find tag {tag} for {owner_repo}")
        return None

    data = response.json()
    sha = data.get('object', {}).get('sha')
    obj_type = data.get('object', {}).get('type')

    # If it's a tag object, we need to dereference it to get the commit
    if obj_type == 'tag':
        tag_url = f"https://api.github.com/repos/{owner_repo}/git/tags/{sha}"
        tag_response = requests.get(tag_url)
        if tag_response.status_code == 200:
            tag_data = tag_response.json()
            sha = tag_data.get('object', {}).get('sha')

    return sha


def get_version_for_commit_sha(repo: str, sha: str) -> Optional[str]:
    """
    Get the version tag for a given commit SHA in a GitHub repository.

    Args:
        repo: Repository in format 'owner/repo' or 'owner/repo/subpath'
        sha: Commit SHA

    Returns:
        Version tag (e.g., 'v4.0.0') or None if not found
    """
    # Extract owner/repo from potential subpaths
    parts = repo.split('/')
    if len(parts) >= 2:
        owner_repo = f"{parts[0]}/{parts[1]}"
    else:
        print(f"Invalid repo format: {repo}")
        return None

    # Get all tags for the repo
    url = f"https://api.github.com/repos/{owner_repo}/git/refs/tags"
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Warning: Could not fetch tags for {owner_repo}")
        return None

    tags = response.json()

    # Find tags that point to this SHA
    matching_tags = []
    for tag in tags:
        tag_name = tag['ref'].replace('refs/tags/', '')
        tag_sha = tag['object']['sha']
        tag_type = tag['object']['type']

        # If it's a tag object, dereference it
        if tag_type == 'tag':
            tag_url = f"https://api.github.com/repos/{owner_repo}/git/tags/{tag_sha}"
            tag_response = requests.get(tag_url)
            if tag_response.status_code == 200:
                tag_data = tag_response.json()
                tag_sha = tag_data.get('object', {}).get('sha')

        if tag_sha == sha:
            matching_tags.append(tag_name)

    if not matching_tags:
        return None

    # Prefer version tags (v1, v2, v3, etc.) over specific versions
    # Sort to get the shortest/simplest version tag
    version_tags = [t for t in matching_tags if re.match(r'^v\d+(\.\d+)*$', t)]
    if version_tags:
        # Sort by version number (prefer v4 over v4.0.0)
        version_tags.sort(key=lambda x: (len(x.split('.')), x))
        return version_tags[0]

    return matching_tags[0] if matching_tags else None


def process_workflow_file(file_path: Path, dry_run: bool = False) -> int:
    """
    Process a single workflow file and pin actions to commit SHAs.

    Args:
        file_path: Path to the workflow file
        dry_run: If True, only print changes without modifying files

    Returns:
        Number of actions pinned
    """
    print(f"DEBUG: Starting to process {file_path}")

    # Pattern to match version tags: uses: owner/repo/path@version
    version_pattern = re.compile(r'(\s+uses:\s+)([\w-]+/[\w-]+(?:/[\w-]+)*?)@(v?\d+(?:\.\d+)*(?:\.\d+)?)\s*(#.*)?$')
    # Pattern to match SHA pins: uses: owner/repo/path@sha
    sha_pattern = re.compile(r'(\s+uses:\s+)([\w-]+/[\w-]+(?:/[\w-]+)*?)@([a-f0-9]{40})\s*(#.*)?$')

    with open(file_path, 'r') as f:
        content = f.read()

    lines = content.split('\n')
    modified_lines = []
    changes_made = 0

    print(f"Processing {len(lines)} lines...")

    for line in lines:
        # Check if it's already pinned to a SHA
        sha_match = sha_pattern.match(line)
        if sha_match:
            prefix = sha_match.group(1)
            repo = sha_match.group(2)
            sha = sha_match.group(3)
            comment = sha_match.group(4)

            # If there's no version comment, try to look it up
            # Check for None or empty/whitespace-only comment
            if not comment or not comment.strip() or comment.strip() == '#':
                print(f"Found pinned action without version: {repo}@{sha}")
                version = get_version_for_commit_sha(repo, sha)
                if version:
                    new_line = f"{prefix}{repo}@{sha}  # {version}"
                    modified_lines.append(new_line)
                    changes_made += 1
                    print(f"  → Added version comment: {version}")
                else:
                    modified_lines.append(line)
                    print(f"  → Could not find version tag for this SHA")
            else:
                modified_lines.append(line)
            continue

        # Check if it's a version tag that needs to be pinned
        version_match = version_pattern.match(line)
        if version_match:
            prefix = version_match.group(1)
            repo = version_match.group(2)
            version = version_match.group(3)
            comment = version_match.group(4) or ''

            print(f"Found: {repo}@{version}")
            sha = get_commit_sha_for_tag(repo, version)

            if sha:
                new_comment = f"  # {version}" if not comment else comment
                new_line = f"{prefix}{repo}@{sha}{new_comment}"
                modified_lines.append(new_line)
                changes_made += 1
                print(f"  → Pinned to {sha}")
            else:
                modified_lines.append(line)
                print(f"  → Skipped (could not resolve)")
        else:
            modified_lines.append(line)

    if changes_made > 0 and not dry_run:
        with open(file_path, 'w') as f:
            f.write('\n'.join(modified_lines))
        print(f"\n✅ Updated {file_path} ({changes_made} actions pinned)")
    elif changes_made > 0:
        print(f"\n🔍 Would update {file_path} ({changes_made} actions)")
    else:
        print(f"\n✓ No changes needed for {file_path}")

    return changes_made


def main():
    if len(sys.argv) < 2:
        print("Usage: python pin-github-actions.py <workflow-file-or-directory> [--dry-run]")
        sys.exit(1)

    path = Path(sys.argv[1])
    dry_run = '--dry-run' in sys.argv

    if dry_run:
        print("🔍 DRY RUN MODE - No files will be modified\n")

    total_changes = 0

    if path.is_file():
        total_changes = process_workflow_file(path, dry_run)
    elif path.is_dir():
        workflow_files = list(path.glob('*.yml')) + list(path.glob('*.yaml'))
        for workflow_file in workflow_files:
            print(f"\n{'='*60}")
            print(f"Processing: {workflow_file}")
            print('='*60)
            total_changes += process_workflow_file(workflow_file, dry_run)
    else:
        print(f"Error: {path} is not a valid file or directory")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"Total actions pinned: {total_changes}")
    print('='*60)


if __name__ == '__main__':
    main()

