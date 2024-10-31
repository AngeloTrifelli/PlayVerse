// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";


import profileIcon from "assets/images/default-profile-icon.jpg";
import backgroundImage from "assets/images/bg-profile.jpeg";

function Header({ children, fullName }) {
  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({
            functions: { rgba, linearGradient },
            palette: { gradients }
          }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden"
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <MDAvatar
              src={profileIcon}
              alt="profile-image"
              size="xl"
              shadow="sm"
            />
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {fullName}
              </MDTypography>              
            </MDBox>
          </Grid>
        </Grid>
        {children}
      </Card>
    </MDBox>
  );
}

// Setting default props for the Header
Header.defaultProps = {
  children: "",
  fullName: ""
};

// Typechecking props for the Header
Header.propTypes = {
  children: PropTypes.node,
  fullName: PropTypes.string.isRequired
};

export default Header;
