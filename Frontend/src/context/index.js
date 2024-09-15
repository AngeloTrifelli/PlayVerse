import PropTypes from "prop-types";
import { createContext, useContext, useReducer, useMemo } from "react";

const PlayVerseUI = createContext();
PlayVerseUI.displayName = "PlayVerseUIContext";


function reducer(state, action) {
  switch (action.type) {
    case "MINI_SIDENAV": {
      return { ...state, miniSidenav: action.value };
    }   
    case "DIRECTION": {
      return { ...state, direction: action.value };
    }
    case "LAYOUT": {
      return { ...state, layout: action.value };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}


function PlayVerseUIControllerProvider({ children }) {
  const initialState = {
    miniSidenav: false,
    transparentSidenav: false,
    whiteSidenav: false,
    sidenavColor: "info",
    transparentNavbar: true,
    fixedNavbar: true,
    openConfigurator: false,
    direction: "ltr",
    layout: "dashboard",
    darkMode: false,
  };

  const [controller, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(() => [controller, dispatch], [controller, dispatch]);

  return <PlayVerseUI.Provider value={value}>{children}</PlayVerseUI.Provider>;
}

function usePlayVerseUIController() {
  const context = useContext(PlayVerseUI);

  if (!context) {
    throw new Error(
      "usePlayVerseUIController should be used inside the PlayVerseUIControllerProvider."
    );
  }

  return context;
}

PlayVerseUIControllerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Context module functions
const setMiniSidenav = (dispatch, value) => dispatch({ type: "MINI_SIDENAV", value });
const setDirection = (dispatch, value) => dispatch({ type: "DIRECTION", value });
const setLayout = (dispatch, value) => dispatch({ type: "LAYOUT", value });

export {
  PlayVerseUIControllerProvider,
  usePlayVerseUIController,
  setMiniSidenav,
  setDirection,
  setLayout
};
