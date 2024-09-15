import PropTypes from "prop-types";
import Link from "@mui/material/Link";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer({ links }) {

  const renderLinks = () =>
    links.map((link) => (
      <MDBox key={link.name} component="li" px={2} lineHeight={1}>
        <Link href={link.href} target="_blank">
          <MDTypography variant="button" fontWeight="regular" color="text">
            {link.name}
          </MDTypography>
        </Link>
      </MDBox>
    ));

  return (
    <MDBox
      width="100%"
      display="flex"
      flexDirection={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems="center"
      px={1.5}
    >
      <MDBox
        component="ul"
        sx={({ breakpoints }) => ({
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          listStyle: "none",
          mt: 3,
          mb: 0,
          p: 0,

          [breakpoints.up("lg")]: {
            mt: 0,
          },
        })}
      >
        {renderLinks()}
      </MDBox>
    </MDBox>
  );
}

// Setting default values for the props of Footer
Footer.defaultProps = {
  links: [
    { href: "http://localhost:3000", name: "About Us" },
    { href: "http://localhost:3000", name: "Blog" },
    { href: "http://localhost:3000", name: "License" },
  ],
};

// Typechecking props for the Footer
Footer.propTypes = {
  links: PropTypes.arrayOf(PropTypes.object),
};

export default Footer;
