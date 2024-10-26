import routes from "routes";
import { isAuthenticated } from "layouts/authentication/utility/auth-utility";

import Sidenav from "examples/Sidenav";

import theme from "assets/theme";
import brandWhite from "assets/images/logo-ct.png";


// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { usePlayVerseUIController, setMiniSidenav } from "context";

export default function App() {
  const [controller, dispatch] = usePlayVerseUIController();
  const {
    miniSidenav,
    direction,
    layout,
    sidenavColor
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [filteredRoutes, setFilteredRoutes] = useState([]);  
  const { pathname } = useLocation();

  
  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };


  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);


  useEffect(() => {
    const fetchRoutes = async () => {
      let isUserAuthenticated = await isAuthenticated();
      let routesToShow = routes.filter(route => {
        if (route.authRequired && !isUserAuthenticated) {
          return false;
        }

        if (route.hideWithAuth && isUserAuthenticated) {
          return false;
        }

        return true;
      });
      setFilteredRoutes(routesToShow);
    };
  
    fetchRoutes()  
  }, [pathname]);

 
  const getRoutes = (allRoutes) =>   
    allRoutes.map((route) => {    
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  return (<ThemeProvider theme={theme}>
    <CssBaseline />
    {layout === "dashboard" && (
      <>
        <Sidenav
          color={sidenavColor}
          brand={brandWhite}
          brandName="PlayVerse"
          routes={filteredRoutes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      </>
    )}
    <Routes>
      {getRoutes(filteredRoutes)}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  </ThemeProvider>
  )
   
}
