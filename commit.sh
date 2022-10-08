M=$(cat COMMIT_NOTES.md)


git add --all
git commit -m "$M"
git push origin v1.x.x-beta



sleep 5s