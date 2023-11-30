# Future work

## Tier 1 (must do)

- ios animation is wrong. also could adjust so that the new letters start higher off the board and are staggered

## Tier 2

- update read me and repo side bar to include link to game, to remove construction note
- add to sect games

## Tier 3

- Only hardcode the numColumns/numRows in one place. Right now, it is in gameInit and in css
- put in google play store
- add tests, eg. for hsl functions and arrayToColumn functions
- end game if no words and no bonuses left?
- would be cool to make an animation for shuffling the letters and for swapping the letters and for disappearing a letter with the bonus
- The animation for shuffling feels off; some don't appear to re-render despite new id
- for the swap bonus, allow to drag to select the two letters too; highlight the second selected as go
- add screenshot of game to readme
- verify gtag
- could make getPseudoRandomID more robust
- arrayToColumns: handle case for irregular number of columns or fewer array items than num columns
- padArray: handle case where array longer than size
- replaceIndexes: make this function more generic and put in logic package?
- getDistinctHSL: instead of hardcoding the excluded ranges, could pass as input

## Else

- for other games, add the hostname check in index.html
- for other games,
