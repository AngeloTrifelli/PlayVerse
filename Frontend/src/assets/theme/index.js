// @mui material components
import { createTheme } from "@mui/material/styles";

import colors from "assets/theme/base/colors";
import breakpoints from "assets/theme/base/breakpoints";
import typography from "assets/theme/base/typography";
import boxShadows from "assets/theme/base/boxShadows";
import borders from "assets/theme/base/borders";
import globals from "assets/theme/base/globals";

import button from "assets/theme/components/button";
import buttonBase from "assets/theme/components/buttonBase";
import container from "assets/theme/components/container";
import divider from "assets/theme/components/divider";
import icon from "assets/theme/components/icon";
import sidenav from "assets/theme/components/sidenav";


//Card components
import card from "assets/theme/components/card";
import cardMedia from "assets/theme/components/card/cardMedia";
import cardContent from "assets/theme/components/card/cardContent";

//Form components
import inputLabel from "assets/theme/components/form/inputLabel";
import inputOutlined from "assets/theme/components/form/inputOutlined";
import textField from "assets/theme/components/form/textField";
import switchButton from "assets/theme/components/form/switchButton";
import select from "assets/theme/components/form/select";
import formControlLabel from "assets/theme/components/form/formControlLabel";
import formLabel from "assets/theme/components/form/formLabel";
import checkbox from "assets/theme/components/form/checkbox";
import radio from "assets/theme/components/form/radio";
import autocomplete from "assets/theme/components/form/autocomplete";

//List components
import list from "assets/theme/components/list";
import listItem from "assets/theme/components/list/listItem";
import listItemText from "assets/theme/components/list/listItemText";

import boxShadow from "assets/theme/functions/boxShadow";
import hexToRgb from "assets/theme/functions/hexToRgb";
import linearGradient from "assets/theme/functions/linearGradient";
import pxToRem from "assets/theme/functions/pxToRem";
import rgba from "assets/theme/functions/rgba";

export default createTheme({
  breakpoints: { ...breakpoints },
  palette: { ...colors },
  typography: { ...typography },
  boxShadows: { ...boxShadows },
  borders: { ...borders },
  functions: {
    boxShadow,
    hexToRgb,
    linearGradient,
    pxToRem,
    rgba,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ...globals,
        ...container
      },
    },
    MuiButton: { ...button },
    MuiButtonBase: { ...buttonBase },
    MuiDivider: { ...divider},
    MuiIcon: { ...icon },
    MuiDrawer: { ...sidenav },
    MuiCard: { ...card },
    MuiCardMedia: { ...cardMedia },
    MuiCardContent: { ...cardContent },
    MuiInputLabel: { ...inputLabel},
    MuiOutlinedInput: { ...inputOutlined},
    MuiTextField: { ...textField},
    MuiSwitch: { ...switchButton},
    MuiSelect: { ...select},
    MuiFormControlLabel: { ...formControlLabel },
    MuiFormLabel: { ...formLabel },
    MuiCheckbox: { ...checkbox },
    MuiRadio: { ...radio },
    MuiAutocomplete: { ...autocomplete },
    MuiList: { ...list },
    MuiListItem: { ...listItem },
    MuiListItemText: { ...listItemText },
  },
});
