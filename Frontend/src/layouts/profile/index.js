import { findUser, prepareAuthHeader } from "layouts/authentication/utility/auth-utility";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

import MDBox from "components/MDBox";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import ProfilesList from "examples/Lists/ProfilesList";

// Overview page components
import Header from "layouts/profile/components/Header";


function Profile() {
  const [userInfo, setUserInfo] = useState({});
  const [friendList, setFriendList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const prepareFriendElem = function (elem) {
      return {
        id: elem.id,
        description: elem.name + " " + elem.surname,
        name: elem.username,        
        action: {          
          chatTitle: elem.username,
          color: "info",
          label: "view chat",
        }
      }
    };

    const fetchUser = async () => {
      let userInfo = await findUser();
      
      if (!userInfo) {
        navigate('/dashboard');
      }

      setUserInfo(userInfo);

      try {
        let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/${userInfo.id}/getFriends`;
        let response = await axios.get(endpoint, prepareAuthHeader());

        if (response && response.data) {
          let friendList = response.data.map((friendElem) => {return prepareFriendElem(friendElem)})
          setFriendList(friendList); 
        }      
      } catch (error) {
        console.error(error);
      }      
    };

    fetchUser();  
  }, []);
  

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox mb={2} />

      <Header fullName={userInfo.name + " " + userInfo.surname}>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6} xl={8} sx={{ display: "flex" }}>
              <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />

              <ProfileInfoCard
                title="profile information"                
                info={{
                  fullName: userInfo.name + " " + userInfo.surname,                  
                  'date Of Birth': new Date(userInfo.dateOfBirth).toLocaleDateString('en-GB'),
                  username: userInfo.username,
                  role: userInfo.role,
                  points: userInfo.points,
                  credits: userInfo.credits                                                                                                           
                }}                
                action={{ route: "", tooltip: "Edit Profile" }}
                shadow={false}
              />
              
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>

            <Grid item xs={12} xl={4}>
              <ProfilesList loggedUserId={userInfo.id}
                            title="Friend List"
                            profiles={friendList}
                            shadow={false}/>
            </Grid>
          </Grid>
        </MDBox>
      </Header>
    </DashboardLayout>
  );
}

export default Profile;
