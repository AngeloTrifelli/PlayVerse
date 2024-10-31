// react-routers components
import { Link } from "react-router-dom";

// prop-types is library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";


function ProfileInfoCard({ title, description, info, action, shadow }) {
  const labels = [];
  const values = [];
  
  // Converti l'oggetto `info` filtrato
  Object.keys(info).forEach((el) => {
    if (el.match(/[A-Z\s]+/)) {
      const uppercaseLetter = Array.from(el).find((i) => i.match(/[A-Z]+/));
      const newElement = el.replace(
        uppercaseLetter,
        ` ${uppercaseLetter.toLowerCase()}`
      );
      labels.push(newElement);
    } else {
      labels.push(el);
    }
  });

  // Inserisci i valori filtrati nell'array values
  Object.values(info).forEach((el) => values.push(el));

  // Render degli elementi della card
  const renderItems = labels.map((label, key) => (
    <MDBox key={label} display="flex" py={1} pr={2 }>
      <MDTypography variant="h6"
                    fontWeight="bold"
                    textTransform="capitalize">
          {label}: &nbsp;
      </MDTypography>
      <MDTypography variant="h6" fontWeight="regular" color="text">
          &nbsp;{values[key]}
      </MDTypography>        
    </MDBox>
  ));

  const chunkedRenderItems = [];
  for (let i = 0; i < renderItems.length; i += 2) {
    chunkedRenderItems.push(renderItems.slice(i, i + 2));
  }

  return (
    <Card sx={{ height: "100%", boxShadow: !shadow && "none" }}>
      <MDBox display="flex"
             justifyContent="space-between"
             alignItems="center"
             pt={2}
             px={2}>
        <MDTypography variant="h6"
                      fontWeight="medium"
                      textTransform="capitalize">
            {title}
        </MDTypography>

        <MDTypography component={Link}
                      to={action.route}
                      variant="body2"
                      color="secondary">
          <Tooltip title={action.tooltip} placement="top">
            <Icon>edit</Icon>
          </Tooltip>
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        <MDBox mb={2} lineHeight={1}>
          <MDTypography variant="button" color="text" fontWeight="light">
            {description}
          </MDTypography>
        </MDBox>
        <MDBox opacity={0.3}>
          <Divider />
        </MDBox>
        {/* Render each row with a maximum of two elements */}
        {chunkedRenderItems.map((row, index) => (
          <MDBox key={index} display="flex" flexDirection="row" justifyContent="space-between" gap={35} mb={1}>
            {row}
          </MDBox>
        ))}
      </MDBox>
    </Card>
  );
}

// Setting default props for the ProfileInfoCard
ProfileInfoCard.defaultProps = {
  shadow: true
};

// Typechecking props for the ProfileInfoCard
ProfileInfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  info: PropTypes.objectOf(PropTypes.string).isRequired,
  action: PropTypes.shape({
    route: PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired
  }).isRequired,
  shadow: PropTypes.bool
};

export default ProfileInfoCard;
