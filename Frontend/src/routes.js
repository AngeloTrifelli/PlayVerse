/** 
  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

import Dashboard from "layouts/dashboard";
import FAQ from "layouts/faq";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Shop from "layouts/shop";
import Profile from "layouts/profile";
import Notifications from "layouts/notifications";
import Games from "layouts/games";
import UserRanking from "layouts/ranking";
// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />
  },
  {
    type: "collapse",
    name: "Games",
    key: "games",
    icon: <Icon fontSize="small">videogame_asset</Icon>,
    route: "/games",
    component: <Games />
  },
  {
    type: "collapse",
    name: "FAQ",
    key: "rtl",
    icon: <Icon fontSize="small">live_help</Icon>,
    route: "/faq",
    component: <FAQ />
  },
  {
    type: "collapse",
    name: "Shop",
    key: "shop",
    icon: <Icon fontSize="small">shopping_bag</Icon>,
    route: "/shop",
    component: <Shop />
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />
  },
  {
    type: "collapse",
    name: "Ranking",
    key: "UserRanking",
    icon: <Icon fontSize="small">leaderboard</Icon>,
    route: "/ranking",
    component: <UserRanking />
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notification",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />
  }
];

export default routes;
