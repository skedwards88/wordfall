# Future work

## Tier 1 (must do)

- add rules
- add styling for large screen and landscape mode
- bonuses-related:
  - for the swap bonus, allow to drag to select the two letters too; highlight the second selected as go
  - for the swap, clicking the same letter should deselect

## Tier 2

- todos in code
- see if should use clonedeep at other places where use ...
- make sure PWA/check lighthouse
- add gtag
- make using saved state in init more robust/specific
- pseudorandomID: could compare to existing IDs to ensure unique? Could string two together for increased randomness?
- update read me and repo side bar to include link to game, to remove construction note
- add to sect games
- endword gets called twice. could use stop propagation to prevent.

## Tier 3

- Only hardcode the numColumns/numRows in one place. Right now, it is in gameInit and in css
- put in google play store
- add tests, eg. for hsl functions and arrayToColumn functions
- end game if no words left?
- would be cool to make an animation for shuffling the letters and for swapping the letters and for disappearing a letter with the bonus
- The animation for shuffling feels off;some don't appear to re-render despite new id
