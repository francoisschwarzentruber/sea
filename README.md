# sea - Spreadsheet engine for adventures

Create your own adventure game with a spreadsheet! 

<img src="./imgREADME/screenshotsheet.png" height="400"/> <img src="./imgREADME/screenshotgame.png" height="400"/>


## Motivation

Suppose you aim at creating quickly an adventure game (let say for a birthday gift, or whatever). Instead of learning how to program, learning a new framework, learning how to use a map editor... you just use your already installed spreadsheet software (such as Libre Office Calc, Microsoft Excel, etc.). Also, easy and funny to invite many friends to collaborate for the level design.


## How to use the engine

- The map is described in the spreadsheet map.ods. Each cell is a tile.
- Assets are in the corresponding folder. The name of the files are XXX.png where XXX are the labels in the cells of the spreadsheet.
- write player in the cell where the player should start.
- Use upper case for obstacles.
- Lower case for regular decor.
- Greek letters or numbers for passages.
- objXXXX for objects to collect.
- and if you need special scripts, write them in script.js


## Save the progression

For saving your current game session, just copy the URL. Objects and position of the player are directly stored in the URL.

## Roadmap

Coming soon:
- ennemies, at some point...
