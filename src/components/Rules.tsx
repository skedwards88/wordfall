import packageJson from "../../package.json";
import PlayButtons from "@skedwards88/shared-components/src/components/PlayButtons";
import {type DisplayState} from "./App";

export default function Rules({
  setDisplay,
}: {
  setDisplay: React.Dispatch<React.SetStateAction<DisplayState>>;
}): React.JSX.Element {
  return (
    <div className="App info">
      <h1>Wordfall: How to play</h1>
      <p className="infoText">
        <p>Wordfall is a meditative jumbled word search game.</p>
        <p>
          Swipe to connect letters into words. Each letter must be a horizontal,
          vertical, or diagonal neighbor of the previous letter.
        </p>
        <p>Clear all letters of a color to reach the next level.</p>
        <p>Earn bonuses by clearing levels and forming long words.</p>
      </p>
      <PlayButtons
        onClickPlay={() => {
          setDisplay("game");
        }}
        onClickInstall={() => setDisplay("installOverview")}
      ></PlayButtons>
      <small>version {packageJson.version}</small>
    </div>
  );
}
