# Push your code to GitHub (all at once)

Don’t use the GitHub website “upload file” button for a whole project—that’s one file at a time. Use **Git in a terminal** to push the whole folder in one go.

---

## 1. Install Git (if you don’t have it)

- **Windows:** Download and run [git-scm.com/download/win](https://git-scm.com/download/win). Use the default options.
- **Mac:** Install Xcode Command Line Tools: open Terminal and run `xcode-select --install`, or install Git from [git-scm.com](https://git-scm.com).
- Check it works: open a **new** terminal and run `git --version`. You should see something like `git version 2.x.x`.

---

## 2. Open a terminal in your project folder

- **Windows:** In File Explorer, go to `Documents\meal-planner`, click the address bar, type `cmd` and press Enter (or right‑click in the folder → “Open in Terminal” / “Open PowerShell window here”).
- **Mac/Linux:** Open Terminal, then run:
  ```bash
  cd ~/Documents/meal-planner
  ```
  (Change the path if your project is somewhere else.)

---

## 3. Turn the folder into a Git repo and add all files

Run these commands **one at a time** (press Enter after each). **Important:** Every Git command must start with **git**—so type `git add .` not just `add .`, and `git commit ...` not just `commit ...`.

```bash
git init
```

```bash
git add .
```
*(The dot means “add everything.” Your `.gitignore` already keeps secrets and build files out.)*

```bash
git commit -m "Initial commit: Meal Planner app"
```

---

## 4. Create a new repository on GitHub

1. Go to [github.com](https://github.com) and log in.
2. Click the **+** (top right) → **New repository**.
3. **Repository name:** e.g. `meal-planner`.
4. Choose **Public**.
5. **Do not** check “Add a README” or “Add .gitignore”—leave the repo **empty**.
6. Click **Create repository**.

---

## 5. Connect your local repo to GitHub and push

GitHub will show a “Quick setup” page with a URL like  
`https://github.com/YOUR_USERNAME/meal-planner.git`  
or  
`git@github.com:YOUR_USERNAME/meal-planner.git`.

In your terminal (still in `meal-planner`), run these, **replacing `YOUR_USERNAME/meal-planner` with your real repo URL**:

```bash
git remote add origin https://github.com/YOUR_USERNAME/meal-planner.git
```

```bash
git branch -M main
```

```bash
git push -u origin main
```

- If GitHub asks you to **log in**, use your GitHub username and a **Personal Access Token** (not your normal password). To create one: GitHub → Settings → Developer settings → Personal access tokens → Generate new token; give it “repo” scope and paste it when Git asks for a password.
- After a successful push, refresh your repo on GitHub—you’ll see all your files there.

---

## Summary (copy-paste)

Once Git is installed and you’re in `meal-planner` in the terminal:

```bash
git init
git add .
git commit -m "Initial commit: Meal Planner app"
git remote add origin https://github.com/YOUR_USERNAME/meal-planner.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME/meal-planner` with your GitHub username and repo name. After this, you can deploy from this repo on Railway and use `git add .` / `git commit` / `git push` for future updates.
