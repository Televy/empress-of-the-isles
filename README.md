# Introduction
This is a project started by Hiaennyddei and Custy from a joke that spiraled out of control. "Dunwall Management Simulator," we called it. We mainly talked in hypotheticals, with no intention of making it a real game, until it didn't seem so hypothetical. That led us to here. We don't do this because it's easy. We do this because we thought it would be easy.

We are currently working with Twine SugarCube & Tweego, an interactive story development tool and its command prompt compiler.

# Directory Structure

## Current Structure
1. `godot-project`: The Godot main project folder. This is what you load into Godot to work on the game.
2. `twine-archive`: The older project files from when we were using Twine/Tweego/Twee2. I have yet to test if the project can still run or not.

## Old Twine Structure
There are three sub-folders that represent a different Twee project:  
1. `[OLD] twee2-test`: Twee2 is an older version that we were experimenting with. We still have the folder from said experiment to reference code, and will most likely be deleted once it is no longer useful.
2. `[OLD] twine2-exported`: The decompiled version of our initial Twine 2 editor file. This is a fully functional version of the game to also be used as a reference.
3. `tweego-redux`: The current developmental version of the game. This is the project we're working on. Within this folder is:
    - `media` folder: Contains images, videos, etc for use in the game.
    - `src` folder: The main working folder with all of the code.
        - `init` folder: Contains JS files that initialize game variables (equivalent of StoryInit + additional functions).
        - `eoti.tw`: The Tweego file that contains the game's passages.
        - `script.js`: The base game script.
        - `styles.css`: The game's stylesheet.
    - `eoti.html`: The HTML file representing the game. This is what you open to play/test the game.