import { useState, useEffect } from 'react';
import axios from 'axios';

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
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


function Cover() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [missingFields, setMissingFields] = useState({
    name: false,
    surname: false,
    dateOfBirth: false,
    username: false,
    email: false,
    password: false    
  })

  const dataList = {
    name: name,
    surname: surname, 
    dateOfBirth: dateOfBirth, 
    username: username, 
    email: email, 
    password: password
  };  
  

  const openModal = function (modalMessage) {
    setShowModal(true);
    setModalMessage(modalMessage);
  };

  const formSubmitted = async (event) => {
    event.preventDefault();

    if (!termsAccepted) {
      openModal("Please accept the terms and conditions to continue");      
      return;
    }
      
    if (Object.values(dataList).some(value => value === "" || value === null || (typeof value === 'string' && value.trim() === ""))) {
      let newMissingFields = Object.keys(dataList).reduce((acc, key) => {
        acc[key] = dataList[key] === "" || dataList[key] === null || (typeof dataList[key] === 'string' && dataList[key].trim() === "");
        return acc;
      }, {});

      setMissingFields(newMissingFields);          
      openModal("Please fill all the required fields!")
      return;
    } 
    
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/register`;

    try {
      const response = await axios.post(endpoint, dataList);

      if (response.status === 201) {
        openModal("Registration successful");
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
      
        openModal(`Registration failed: ${errorMessage}`);
      } else if (error.request) {
        openModal(`Registration failed: No response from the server`);
      } else {
        openModal(`Registration failed: ${error.message}`);
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
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your personal data to register
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput 
                type="text" 
                value={name} 
                label="Name" 
                variant="standard" 
                onChange={(event) => setName(event.target.value)} 
                fullWidth 
                sx={{
                  borderColor: missingFields['name'] ? 'red' : 'default  ', 
                  '& .MuiInput-underline:before': {
                      borderBottomColor: missingFields['name'] ? 'red' : 'inherit'
                  }
                }}
                InputLabelProps = {{
                  style: {color: missingFields['name'] ? 'red' : 'inherit'}
                }}
              />
              {missingFields['name'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx = {{color: 'red'}}>Insert Data!</MDTypography>
              }              
            </MDBox>

            <MDBox mb={2}>
              <MDInput 
                type="text"
                value={surname} 
                label="Surname" 
                variant="standard" 
                onChange={(event) => setSurname(event.target.value)} 
                fullWidth
                sx={{
                  borderColor: missingFields['surname'] ? 'red' : 'default  ', 
                  '& .MuiInput-underline:before': {
                      borderBottomColor: missingFields['name'] ? 'red' : 'inherit'
                  }
                }}
                InputLabelProps = {{
                  style: {color: missingFields['surname'] ? 'red' : 'inherit'}
                }}
              />
              {missingFields['surname'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx = {{color: 'red'}}>Insert Data!</MDTypography>
              }      
            </MDBox>

            <MDBox mb={2}>
              <MDInput 
                type="date"
                value={dateOfBirth} 
                label="" 
                variant="standard" 
                onChange={(event) => setDateOfBirth(event.target.value)}
                fullWidth
                sx={{
                  borderColor: missingFields['dateOfBirth'] ? 'red' : 'default  ', 
                  '& .MuiInput-underline:before': {
                      borderBottomColor: missingFields['dateOfBirth'] ? 'red' : 'inherit'
                  }
                }}
              />
              {missingFields['dateOfBirth'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx = {{color: 'red'}}>Insert Data!</MDTypography>
              }      
            </MDBox>
            
            <MDBox mb={2}>
              <MDInput 
                type="text" 
                value={username}
                label="Username" 
                variant="standard"
                onChange={(event) => setUsername(event.target.value)}
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
              <MDInput 
                type="email" 
                value={email}
                label="Email" 
                variant="standard" 
                onChange={(event) => setEmail(event.target.value)}
                fullWidth 
                sx={{
                  borderColor: missingFields['email'] ? 'red' : 'default  ', 
                  '& .MuiInput-underline:before': {
                      borderBottomColor: missingFields['email'] ? 'red' : 'inherit'
                  }
                }}
                InputLabelProps = {{
                  style: {color: missingFields['email'] ? 'red' : 'inherit'}
                }}
              />
              {missingFields['email'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx = {{color: 'red'}}>Insert Data!</MDTypography>
              }      
            </MDBox>

            <MDBox mb={2}>
              <MDInput 
                type="password"
                value={password} 
                label="Password" 
                variant="standard"
                onChange={(event) => setPassword(event.target.value)} 
                fullWidth 
                sx={{
                  borderColor: missingFields['password'] ? 'red' : 'default  ', 
                  '& .MuiInput-underline:before': {
                      borderBottomColor: missingFields['password'] ? 'red' : 'inherit'
                  }
                }}
                InputLabelProps = {{
                  style: {color: missingFields['password'] ? 'red' : 'inherit'}
                }}
              />
              {missingFields['password'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx = {{color: 'red'}}>Insert Data!</MDTypography>
              }      
            </MDBox>

            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />            
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;I agree the&nbsp;
              </MDTypography>

              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>

            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" onClick={formSubmitted} fullWidth>
                sign up
              </MDButton>
            </MDBox>

            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
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

export default Cover;
