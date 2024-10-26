import { useState } from "react";
import axios from 'axios';

// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import { Modal } from '@mui/material';

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/sfondo-sign-in.jpg";
import pxToRem from "assets/theme/functions/pxToRem";


function SignIn() {  
  const defaultMissingFields = {
    username: false,
    password: false
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [missingFields, setMissingFields] = useState(defaultMissingFields);
  const navigate = useNavigate();

  const dataList = {
    username: username,    
    password: password
  };  

  const openModal = function (modalMessage) {
    setShowModal(true);
    setModalMessage(modalMessage);
  };

  const formSubmitted = async (event) => {
    event.preventDefault();

    setMissingFields(defaultMissingFields);

    if (Object.values(dataList).some(value => value === "" || value === null || (typeof value === 'string' && value.trim() === ""))) {
      let newMissingFields = Object.keys(dataList).reduce((acc, key) => {
        acc[key] = dataList[key] === "" || dataList[key] === null || (typeof dataList[key] === 'string' && dataList[key].trim() === "");
        return acc;
      }, {});

      setMissingFields(newMissingFields);          
      openModal("Please fill all the required fields!")
      return;
    } 

    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/login`;

    try {
      const response = await axios.post(endpoint, dataList);

      if (response.status === 200) {
        localStorage.setItem('token', response.data.access_token);
        navigate('/dashboard', {state: {isAuthenticated: true}});
        openModal("Login successful");
      }
    } catch (error) {
      if (error.response) {
        let errorMessage = error.response.data.error;

        if (errorMessage === undefined && typeof error.response.data === 'string') {
          let parser = new DOMParser();
          let preElement = parser.parseFromString(error.response.data, 'text/html').querySelector('pre');        
          let pElement = parser.parseFromString(error.response.data, 'text/html').querySelector('p');

          if (preElement) {
            errorMessage = preElement.textContent;
          } else if (pElement) {
            errorMessage = pElement.textContent;
          }
        }
      
        openModal(`Login failed: ${errorMessage}`);
      } else if (error.request) {
        openModal(`Login failed: No response from the server`);
      } else {
        openModal(`Login failed: ${error.message}`);
      }  
    }


  };



  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput  type="username"
                        onChange={(event) => setUsername(event.target.value)} 
                        label="Username"                        
                        fullWidth
                        sx={{
                          borderColor: missingFields['username'] ? 'red' : 'default  ', 
                          '& .MuiInput-underline:before': {
                              borderBottomColor: missingFields['username'] ? 'red' : 'inherit'
                          }
                        }}
                        InputLabelProps = {{
                          style: {color: missingFields['username'] ? 'red' : 'inherit'}
                        }} 
              />
              {missingFields['username'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx = {{color: 'red'}}>Insert Data!</MDTypography>
              } 
            </MDBox>
            <MDBox mb={2}>
              <MDInput  type="password"
                        onChange={(event) => setPassword(event.target.value)} 
                        label="Password" 
                        sx={{
                          borderColor: missingFields['password'] ? 'red' : 'default  ', 
                          '& .MuiInput-underline:before': {
                              borderBottomColor: missingFields['password'] ? 'red' : 'inherit'
                          }
                        }}
                        InputLabelProps = {{
                          style: {color: missingFields['password'] ? 'red' : 'inherit'}
                        }} 
                        fullWidth 
              />
              {missingFields['password'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx = {{color: 'red'}}>Insert Data!</MDTypography>
              } 
            </MDBox>           
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" onClick={formSubmitted} fullWidth>
                sign in
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      <Modal open={showModal}
             onClose={() => setShowModal(false)} 
             sx = {{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'                                                
             }}>
            <MDBox textAlign="center"
                   variant="gradient"
                   sx={{
                    borderRadius: 3,
                    paddingLeft: "1%",
                    paddingRight: "1%",
                    paddingTop: "1%",
                    paddingBottom: "2%"
                   }}>
                  <MDTypography variant="h5" component="h2">
                    {modalMessage}
                  </MDTypography>
                  <MDButton onClick={() => setShowModal(false)} variant="contained" color="primary" sx={{marginTop: pxToRem(20)}}>
                    OK
                  </MDButton>
            </MDBox>
      </Modal>
    </BasicLayout>
  );
}

export default SignIn;
