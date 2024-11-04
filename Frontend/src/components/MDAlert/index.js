import { useState } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Fade from "@mui/material/Fade";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// Custom styles for the MDAlert
import MDAlertRoot from "components/MDAlert/MDAlertRoot";
import MDAlertCloseIcon from "components/MDAlert/MDAlertCloseIcon";
import pxToRem from "assets/theme/functions/pxToRem";

function MDAlert({ color, dismissible, showButtons, acceptCallback, refuseCallback, closeCallback, notificationId, children, ...rest }) {
  const [alertStatus, setAlertStatus] = useState("mount");

  const handleAlertStatus = () => {
    setAlertStatus("fadeOut");
    closeCallback(notificationId);
  }

  // The base template for the alert
  const alertTemplate = (mount = true) => (
    <Fade in={mount} timeout={300}>
      <MDAlertRoot ownerState={{ color }} {...rest}>
        <MDBox display="flex" alignItems="center" color="white">
          {children}
        </MDBox>
        {dismissible && closeCallback ? (
          <MDAlertCloseIcon onClick={mount ? handleAlertStatus : null}>&times;</MDAlertCloseIcon>
        ) : null}
        {showButtons && acceptCallback && refuseCallback ? (
          <MDBox>
            <MDButton color="light" variant="gradient" sx={{mr: pxToRem(10)}} onClick={() => acceptCallback(notificationId)}>Accept</MDButton>          
            <MDButton color="light" variant="gradient" onClick={() => refuseCallback(notificationId)}>Refuse</MDButton>
          </MDBox>        
        ) : null}
      </MDAlertRoot>
    </Fade>
  );

  switch (true) {
    case alertStatus === "mount":
      return alertTemplate();
    case alertStatus === "fadeOut":
      setTimeout(() => setAlertStatus("unmount"), 400);
      return alertTemplate(false);
    default:
      alertTemplate();
      break;
  }

  return null;
}

// Setting default values for the props of MDAlert
MDAlert.defaultProps = {
  color: "info",
  dismissible: false,
};

// Typechecking props of the MDAlert
MDAlert.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  dismissible: PropTypes.bool,
  showButtons: PropTypes.bool,
  acceptCallback: PropTypes.func,
  refuseCallback: PropTypes.func,
  closeCallback: PropTypes.func,
  notificationId: PropTypes.number,
  children: PropTypes.node.isRequired,
};

export default MDAlert;
