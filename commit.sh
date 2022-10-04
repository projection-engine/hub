M=$(cat COMMIT_NOTES.md)

git add --all
git commit -m "$M"
git push origin v10.x.x-alpha

sleep 5s