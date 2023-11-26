# Future work

## Tier 1 (must do)

- add rules
- add styling for large screen and landscape mode
- rename repo/game (word-rush, wordRush, Word Rush). maybe wordfall?
- todos in code
- bonuses-related:
  - when bonus is active, when start making word, activate the bonus instead
  - for the swap bonus, allow to drag to select the two letters too; highligh the second selected as go
  - for the swap bonus, style the first letter picked to indicate picked
  - clicking anywhere besides the board should also cancel the bonus

## Tier 2

- add gtag
- make sure PWA/check lighthouse
- see if should use clonedeep at other places where use ...
- pseudorandomID: could compare to existing IDs to ensure unique? Could string two together for increased randomness?
- make using saved state in init more robust/specific

## Tier 3

- Only hardcode the numColumns/numRows in one place. Right now, it is in gameInit and in css
- put in google play store
- add tests, eg. for hsl functions and arrayToColumn functions
- end game if no words left?
- would be cool to make an animation for shuffling the letters and for swapping the letters and for disappearing a letter with the bonus
- The animation for shuffling feels off;some don't appear to re-render despite new id
