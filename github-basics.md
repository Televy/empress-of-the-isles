# Table of Contents
1. [Git Set Up](#how-to-set-up-git--github)
2. [Git Usage](#how-to-use-git)

# How to Set Up Git & GitHub
This will be split into two sections: Sections you can do by yourself, and sections that require me to be awake, since I need to do things on my end to completely set everything up.

## By Yourself
1. Download [Git](https://git-scm.com/downloads), which the actual version control SYSTEM on your computer. 
2. Go to the [GitHub](https://github.com/) website to make an account. GitHub allows you to organize your Git repositories (folders of stuff). 
3. Open the terminal in VS Code. You need to connect your GitHub account to your computer. Enter the following: 
    ```
    git config --global user.name "Penis"
    git config --global user.email "penisemail@gmail.com"
    ``` 
    - Obviously don't type verbatim, replace with a name (could be anything, it doesn't have to match anything) and an email (IMPORTANT, this must match the email you used to register with GitHub).
4. (Optional) Git additionally has its OWN terminal/command prompt line (called Git Bash). The only thing this changes is how the directory is displayed (`\Documents\Code` instead of `~/Documents/Code`). But! If you want to match the syntax used in this guide, you can set your default terminal in VS Code to Git Bash.
    - Open up the Command Palette in VS Code with either `Ctrl + Shift + P` or View > Command Palette in the top left. 
    - Search "terminal" and find "**Terminal:** Select Default Profile." Then, select Git Bash. **There are no differences in commands/code used if you use PowerShell over Git Bash.**

## When I (Tivs) Am Awake
5. Still in the VS Code terminal, navigate to the folder where you want to keep the EOTI repository.   
**Terminal directory basics:**
    - Your current directory is displayed in the terminal after `MINGW64` as `~/Documents` or whatnot.
    - To change directory, use the `cd` command. 
        - The easiest way to do this is by typing `cd` and part of the folder name. If you hit `Tab`, the terminal autofills.
            <details>
            <summary><b>Sample Use</b></summary>
                <pre>
            <code>
                ~/Documents
                $ cd co
                // Hit Tab
                $ cd Code/
                // Hit Enter
                ~/Documents/Code
            </code>
                </pre>
            </details>

        - To go back up a level in the directory, type `cd ..` (two periods).
    - To see what's in a directory, type `ls` and it will display in the terminal.
6. Clone the repository link that I will give you once you give me your GitHub email (and your credit card information, bank account number, etc). To clone, type `git clone` followed by the copied link.
    ```
    git clone www.deeznuts.com
    ```
7. You will be prompted to confirm your account through a selection of options. Just **hit enter** when this happens, as it will use the default of logging in through the browser (the easiest method).
8. After connecting your account, the repository should clone and you will be able to access the files!

# How to Use Git
Let's say, after you've cloned the repository, that you've made some changes. Any sort of change, even just adding one single space in the stylesheet or something. Git does not autosave or autosync. Every time you make changes, you need to **push** your changes to the internet. 
1. Make sure you are in the repository! You can only push Git repositories, which you can check if you are in  a Git repo when the folder has `(main)` after it. 
2. Type in **all** of the following commands in order: 
    ```
    git add .
    git commit -m "This is a message to attach to your commit"
    git push
    ```
    <details>
    <summary><b>Explanation Of These Commands</b></summary>
        <ul>
            <li><b>git add:</b> Adds files onto a "stage."</li>
            <li><b>git commit:</b> Takes all files on the "stage" and "commits" them.</li>
                <ul>
                    <li>The <b>-m "Message"</b> attaches a message to the commit. You can type anything into the quotes.</li>
                </ul>
            <li><b>git push: This is what updates the repository.</b> This "pushes" the changes to the internet, where I can then access the changes.</li>
        </ul>
    </details>
- - - 
Now, let's say that ***I*** made some changes and you want to work on the file. You don't have to ask me if I made changes, Git sorts that out for you! You have to **pull** changes from the repository. 
1. Navigate to the Git repo in the terminal. 
2. Type in `git pull` into the terminal. The terminal will show which files were changed since then. That's it!

A good routine to practice when working on any file is that any time you are going to start working on the file, do `git pull` **FIRST**, make your changes, then commit when you're done working on it for the day. 
    
