import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  findUser,
  prepareAuthHeader
} from "layouts/authentication/utility/auth-utility";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography
} from "@mui/material";
import { IconButton } from "@mui/material";

import BlockIcon from "@mui/icons-material/Block";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDBox from "components/MDBox";

import pxToRem from "assets/theme/functions/pxToRem";
const UserModerationPage = () => {
  const [originalUsers, setOriginalUsers] = useState([]);
  const [loggedUserData, setLoggedUserData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState([]); // Stato per i user
  const [error, setError] = useState(null); // Stato per gestire errori di richiesta
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let userInfo = await findUser();

        let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/${userInfo.id}/getUserList`;
        let response = await axios.get(endpoint, prepareAuthHeader());

        if (response && response.data) {
          let userData = processUserResponse(response.data, userInfo);

          setUsers(userData);
          setOriginalUsers(userData);
          setLoggedUserData(userInfo);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const processUserResponse = function (userData, loggedUserData) {
      let processedData = userData.filter((user) => {
        if (loggedUserData.role === "PLAYER" && user.role !== "PLAYER") {
          return false;
        }

        if (loggedUserData.username === user.username) {
          return false;
        }

        return true;
      });

      return processedData;
    };

    fetchUser();
  }, []);

  const handleSearch = () => {
    let filteredUsers = originalUsers.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setUsers(filteredUsers);
  };

  const handleSearchReset = () => {
    setSearchQuery("");
    setUser(originalUsers);
  };
  const handleSuspendToggle = async (event, userId) => {
    const userToUpdate = user.find((u) => u.id === userId);
    const updatedSuspendedValue = !userToUpdate.suspended;

    // Aggiorna lo stato locale
    const updatedUsers = user.map((u) =>
      u.id === userId ? { ...u, suspended: updatedSuspendedValue } : u
    );
    setUser(updatedUsers);

    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/SuspendedUser`;
    try {
      const UserList = {
        id: userId, // Usa il userId passato
        suspended: updatedSuspendedValue // Invia il nuovo stato
      };

      const response = await axios.post(endpoint, UserList);

      if (response.status === 200) {
        console.log(response.data.message); // Mostra il messaggio di successo
        // Puoi decidere se rimanere sulla stessa pagina o navigare altrove
      } else {
        console.warn("Unexpected response:", response);
      }
    } catch (error) {
      if (error.response) {
        console.error("Error:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
    }

    console.log("Edit User:", userId);
  };

  return (
    <TableContainer component={Paper} sx={{ paddingLeft: "300px" }}>
      <Typography variant="h4" component="h2" sx={{ m: 2 }}>
        User List
      </Typography>
      <MDBox mx={2} mb={4} display="flex" flex-direction="row">
        <MDInput
          label="Search username..."
          onChange={(event) => setSearchQuery(event.target.value)}
          value={searchQuery}
          fullWidth
        />
        <MDButton
          variant="gradient"
          color="info"
          size="small"
          onClick={handleSearch}
          sx={{ marginLeft: pxToRem(10), marginRight: pxToRem(10) }}
        >
          Search
        </MDButton>
        <MDButton
          variant="gradient"
          color="error"
          size="small"
          onClick={handleSearchReset}
        >
          Reset
        </MDButton>
      </MDBox>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Full Name</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Is Friend</TableCell>
            <TableCell></TableCell>
            {loggedUserData.role !== "PLAYER" && <TableCell>Action</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.name + " " + user.surname}</TableCell>
              <TableCell>
                {user.suspended || user.banned ? "Suspended" : "Active"}
              </TableCell>
              <TableCell>
                <IconButton color={user.isFriend ? "secondary" : "primary"}>
                  {user.isFriend ? <CheckIcon /> : <CloseIcon />}
                </IconButton>
              </TableCell>
              <TableCell>
                <MDButton
                  variant="gradient"
                  color="info"
                  size="medium"
                  disabled={user.friendRequestSent}
                >
                  {!user.friendRequestSent
                    ? "Send Friend Request"
                    : "Friend Request Sent"}
                </MDButton>
              </TableCell>
              {loggedUserData.role !== "PLAYER" && (
                <TableCell>
                  <IconButton
                    color={
                      user.suspended || user.banned ? "secondary" : "primary"
                    }
                    onClick={() => handleSuspendToggle(user.id)}
                  >
                    {user.suspended || user.banned ? (
                      <CheckIcon />
                    ) : (
                      <BlockIcon />
                    )}
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserModerationPage;
