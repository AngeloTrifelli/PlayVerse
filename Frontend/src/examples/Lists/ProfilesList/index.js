import { useEffect, useState } from "react";

// react-routers components
import { Link } from "react-router-dom";

// prop-types is library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDButton from "components/MDButton";
import MDChat from "components/MDChat";

function ProfilesList({ loggedUserId, title, profiles, shadow }) {
  const [chatTitle, setChatTitle] = useState("");
  const [secondUserId, setSecondUserId] = useState(null);
  const [openChat, setOpenChat] = useState(false);

  const handleShowChat = (chatTitle, secondUserId) => {
    setChatTitle(chatTitle);
    setSecondUserId(secondUserId);
    setOpenChat(true);
  };

  const handleCloseChat = () => {
    setChatTitle("");
    setSecondUserId(null);
    setOpenChat(false);
  }
 
  const renderProfiles = profiles.map(({ image, id, name, description, action }) => (
    <MDBox key={name} component="li" display="flex" alignItems="center" py={1} mb={1}>
      <MDBox mr={2}>
        <MDAvatar src={image} alt="something here" shadow="md" />
      </MDBox>
      <MDBox display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center">
        <MDTypography variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          {description}
        </MDTypography>
      </MDBox>
      <MDBox ml="auto">
          <MDButton onClick={() => handleShowChat(action.chatTitle, id)} variant="text" color="info">
            {action.label}
          </MDButton>        
      </MDBox>
    </MDBox>
  ));

  return (
    <Card sx={{ height: "100%", boxShadow: !shadow && "none" }}>
      <MDBox pt={2} px={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          {title}
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
          {renderProfiles}
        </MDBox>
      </MDBox>

      {openChat && (
        <MDBox style={customChatStyle}>
          <MDChat chatTitle={chatTitle} loggedUserId={loggedUserId} secondUserId={secondUserId} closeCallback={handleCloseChat} />
        </MDBox>
      )}
    </Card>    
  );
}

// Setting default props for the ProfilesList
ProfilesList.defaultProps = {
  shadow: true,
};

// Typechecking props for the ProfilesList
ProfilesList.propTypes = {
  loggedUserId: PropTypes.number.isRequired,  
  title: PropTypes.string.isRequired,
  profiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  shadow: PropTypes.bool,
};

const customChatStyle = {
  position: 'fixed',
  bottom: '60px',
  right: '0.02vw',  
  width: '70vh',
  height: '400px',
  zIndex: 1000,
};

export default ProfilesList;
