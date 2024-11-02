import { useEffect, useState } from "react";
import { findUser, prepareAuthHeader } from "layouts/authentication/utility/auth-utility";
import axios from 'axios';

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import MDSnackbar from "components/MDSnackbar";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import pxToRem from "assets/theme/functions/pxToRem";

function Notifications() {
  const [userInfo, setUserInfo] = useState({});
  const [notificationList, setNotificationList] = useState([]);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        let userInfo = await findUser();
        setUserInfo(userInfo);

        let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/${userInfo.id}/getNotifications`;
        let response = await axios.get(endpoint, prepareAuthHeader());      

        if (response && response.data) {
          setNotificationList(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [])

  const acceptFriendRequest = async (notificationId) => {
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Notification/${notificationId}/acceptFriendRequest`;

    try {
      let response = await axios.post(endpoint, {}, prepareAuthHeader());

      if (response && response.status === 200) {
        let newNotificationList = notificationList.filter((notification) => {
          return notification.id !== notificationId;
        });

        setNotificationList(newNotificationList);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const refuseFriendRequest = async (notificationId) => {
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Notification/${notificationId}/refuseFriendRequest`;

    try {
      let response = await axios.post(endpoint, {}, prepareAuthHeader());

      if (response && response.status === 200) {
        let newNotificationList = notificationList.filter((notification) => {
          return notification.id !== notificationId;
        });

        setNotificationList(newNotificationList);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h5">Notifications</MDTypography>
              </MDBox>
              <MDBox pt={2} px={2}>
                {notificationList.length === 0 ? (
                  <MDTypography variant="h6" mt={2} mb={3}>There are no new notifications...</MDTypography>
                ) : null}

                {notificationList.map((notification) => (                  
                  <MDAlert color="info"   
                           showButtons
                           dismissible                                                  
                           notificationId={notification.type === 'FRIEND_REQUEST' ? notification.id : null} 
                           acceptCallback={notification.type === 'FRIEND_REQUEST' ? acceptFriendRequest : null} 
                           refuseCallback={notification.type === 'FRIEND_REQUEST' ? refuseFriendRequest : null}>

                    <MDTypography variant="body2" color="white">
                      {notification.description}
                    </MDTypography>                    
                  </MDAlert>
                ))}                
              </MDBox>
            </Card>
          </Grid>          
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Notifications;
