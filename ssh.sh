ssh-keygen -t ed25519 -C "kyantech254@gmail.com"

eval "$(ssh-agent -s)"

ssh-add ~/.ssh/id_ed25519

cat ~/.ssh/id_ed25519.pub

ssh -T git@github.com

git init 

git add .

git remote add origin git@github.com:KYANTECH254/nova-client.git

git remote -v

git branch -M main

git commit -m "Initial commit"

git push -u origin main