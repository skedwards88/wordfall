import {type GameState} from "../logic/gameInit";
import {type ReducerPayload} from "../logic/gameReducer";

export default function BonusBar({
  dispatchGameState,
  gameState,
}: {
  dispatchGameState: React.Dispatch<ReducerPayload>;
  gameState: GameState;
}): React.JSX.Element {
  return (
    <div id="bonuses">
      <button
        id={
          gameState.bonuses.shuffle.active
            ? "shuffleBonusButtonActive"
            : "shuffleBonusButton"
        }
        disabled={gameState.bonuses.shuffle.number === 0}
        onClick={(e) => {
          e.stopPropagation();

          dispatchGameState({
            action: "clickBonus",
            bonusType: "shuffle",
          });
        }}
      >
        <div className="bonusCounter" key={gameState.bonuses.shuffle.number}>
          {gameState.bonuses.shuffle.number}
        </div>
      </button>

      <button
        id={
          gameState.bonuses.remove.active
            ? "removeBonusButtonActive"
            : "removeBonusButton"
        }
        disabled={gameState.bonuses.remove.number === 0}
        onClick={(e) => {
          e.stopPropagation();

          dispatchGameState({
            action: "clickBonus",
            bonusType: "remove",
          });
        }}
      >
        <div className="bonusCounter" key={gameState.bonuses.remove.number}>
          {gameState.bonuses.remove.number}
        </div>
      </button>

      <button
        id={
          gameState.bonuses.swap.active
            ? "swapBonusButtonActive"
            : "swapBonusButton"
        }
        disabled={gameState.bonuses.swap.number === 0}
        onClick={(e) => {
          e.stopPropagation();

          dispatchGameState({
            action: "clickBonus",
            bonusType: "swap",
          });
        }}
      >
        <div className="bonusCounter" key={gameState.bonuses.swap.number}>
          {gameState.bonuses.swap.number}
        </div>
      </button>
    </div>
  );
}
