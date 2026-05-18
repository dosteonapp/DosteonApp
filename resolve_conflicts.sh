#!/bin/bash

# Remove all UD files (deleted in origin/develop)
git status --porcelain | grep '^UD ' | awk '{print $2}' | xargs -r git rm

# Move all newly added files in frontend/ and backend/ to apps/frontend/ and apps/backend/
for file in $(git status --porcelain | grep '^A  \|UA ' | awk '{print $2}' | grep '^\(frontend\|backend\)/'); do
  target="apps/$file"
  mkdir -p $(dirname "$target")
  git mv "$file" "$target"
done

# We also have files that git successfully auto-merged but left in frontend/ and backend/
# Wait, actually git didn't auto-merge them if they were just added in origin/develop. They are 'A' or 'UA'.
# Let's also check for 'M' files in frontend/ or backend/ (which shouldn't happen because they were renamed in dev-two, so git auto-merged them into apps/frontend/)
