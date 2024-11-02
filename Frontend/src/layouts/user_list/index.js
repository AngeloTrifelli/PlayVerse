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
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import pxToRem from "assets/theme/functions/pxToRem";
const UserModerationPage = () => {
  const [originalUsers, setOriginalUsers] = useState([]);
  const [loggedUserData, setLoggedUserData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState([]); // Stato per i user
  const [error, setError] = useState(null); // Stato per gestire errori di richiesta
  const [suspendDuration, setSuspendDuration] = useState(""); // Stato per la durata della sospensione
  const [suspendUserId, setSuspendUserId] = useState(null); // ID dell'utente da sospendere
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false); // Stato per il dialogo di ban
  const [bannedReason, setBannedReason] = useState("");
  const [BannedUserId, setBannedUserId] = useState(null); // ID dell'utente da bannare
  const [isBannedDialogOpen, setIsBannedDialogOpen] = useState(false); // Stato per il dialogo di ban
  const [moderatorUserId, setModeratorUserId] = useState(null);
  const [isModeratorDialogOpen, setIsModeratorDialogOpen] = useState(false);
  const isAnotherModeratorPresent = user.some(
    (user) => user.role === "MODERATOR" && user.id !== loggedUserData.id
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let userInfo = await findUser();

        let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/${userInfo.id}/getUserList`;
        let response = await axios.get(endpoint, prepareAuthHeader());

        if (response && response.data) {
          let userData = processUserResponse(response.data, userInfo);

          setUser(userData);
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
        if (loggedUserData.role === "MODERATOR" && user.role === "ADMIN") {
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
    setUser(filteredUsers);
  };

  const handleSearchReset = () => {
    setSearchQuery("");
    setUser(originalUsers);
  };
  const handleSuspendToggle = (userId) => {
    const userToToggle = user.find((u) => u.id === userId);
    if (userToToggle) {
      setSuspendUserId(userId);
      setSuspendDuration(""); // Reset della durata
      setIsSuspendDialogOpen(true); // Apri il dialogo senza ritardo
    }
  };
  const handleBANToggle = (userId) => {
    const userToToggle = user.find((u) => u.id === userId);
    if (userToToggle) {
      setBannedUserId(userId);
      setBannedReason(""); // Reset della ragione
      setIsBannedDialogOpen(true); // Apri il dialogo senza ritardo
    }
  };

  const handleBANConfirm = async () => {
    // Trova l'utente corrente
    const userToUpdate = user.find((u) => u.id === BannedUserId);

    if (!userToUpdate) {
      console.error(`Utente con ID ${BannedUserId} non trovato.`);
      return; // Esci se non trovi l'utente
    }

    const isCurrentlyBanned = userToUpdate.banned; // Controlla se l'utente è già bannato
    const updatedBannedValue = !isCurrentlyBanned; // Inverti il valore di ban

    // Aggiorna lo stato locale
    const updatedUsers = user.map((u) =>
      u.id === BannedUserId ? { ...u, banned: updatedBannedValue } : u
    );
    setUser(updatedUsers);

    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/BannedUser`;
    try {
      const UserList = {
        id: BannedUserId, // Usa bannedUserId qui
        banned: updatedBannedValue,
        banReason: updatedBannedValue ? bannedReason : "" // Usa bannedReason solo se l'utente è bannato
      };

      const response = await axios.post(endpoint, UserList);
      if (response.status === 200) {
        console.log(response.data.message);
      } else {
        console.warn("Unexpected response:", response);
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }

    // Chiudi il dialogo di ban
    setIsBannedDialogOpen(false);
    setBannedUserId(null);
    setBannedReason(""); // Reset del valore di ragione
  };

  const handleSuspendConfirm = async () => {
    // Trova l'utente corrente
    const userToUpdate = user.find((u) => u.id === suspendUserId);

    if (!userToUpdate) {
      console.error(`Utente con ID ${suspendUserId} non trovato.`);
      return; // Esci se non trovi l'utente
    }

    const isCurrentlySuspended = userToUpdate.suspended; // Controlla se l'utente è già sospeso
    const updatedSuspendedValue = !isCurrentlySuspended; // Inverti il valore di sospensione

    // Aggiorna lo stato locale
    const updatedUsers = user.map((u) =>
      u.id === suspendUserId ? { ...u, suspended: updatedSuspendedValue } : u
    );
    setUser(updatedUsers);

    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/SuspendedUser`;
    try {
      const UserList = {
        id: suspendUserId,
        suspended: updatedSuspendedValue,
        duration: updatedSuspendedValue ? suspendDuration : 0 // Aggiungi la durata solo se si sta sospendendo
      };

      const response = await axios.post(endpoint, UserList);
      if (response.status === 200) {
        console.log(response.data.message);
      } else {
        console.warn("Unexpected response:", response);
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }

    // Chiudi il dialogo
    setIsSuspendDialogOpen(false);
    setSuspendUserId(null);
    setSuspendDuration(""); // Reset del valore di durata
  };
  const handleMODERATORToggle = (userId) => {
    const userToToggle = user.find((u) => u.id === userId);
    if (userToToggle) {
      setModeratorUserId(userId);
      setIsModeratorDialogOpen(true); // Apri il dialogo senza ritardo
    }
  };

  const handleModerateConfirm = async () => {
    const userToUpdate = user.find((u) => u.id === moderatorUserId);

    if (!userToUpdate) {
      console.error(`Utente con ID ${moderatorUserId} non trovato.`);
      return; // Esci se l'utente non viene trovato
    }

    // Determina il nuovo ruolo in base al ruolo attuale
    const newRole = userToUpdate.role === "MODERATOR" ? "PLAYER" : "MODERATOR";

    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/ModeratorUser`;
    try {
      const UserList = {
        id: moderatorUserId
      };

      const response = await axios.post(endpoint, UserList);
      if (response.status === 200) {
        console.log(response.data.message);
        // Aggiorna lo stato locale per riflettere la modifica
        setUser((prevUsers) =>
          prevUsers.map((u) =>
            u.id === moderatorUserId ? { ...u, role: newRole } : u
          )
        );
      } else {
        console.warn("Risposta inaspettata:", response);
      }
    } catch (error) {
      console.error(
        "Errore:",
        error.response ? error.response.data : error.message
      );
    }

    // Chiudi il dialogo
    setIsModeratorDialogOpen(false);
    setModeratorUserId(null);
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
            {loggedUserData.role === "PLAYER" && (
              <TableCell>Is Friend</TableCell>
            )}
            {loggedUserData.role === "PLAYER" && <TableCell></TableCell>}
            {loggedUserData.role !== "PLAYER" && <TableCell>Suspend</TableCell>}
            {loggedUserData.role !== "PLAYER" && <TableCell>BAN</TableCell>}
            {loggedUserData.role === "ADMIN" && (
              <TableCell>Moderator</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {user.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.name + " " + user.surname}</TableCell>
              <TableCell>
                {user.suspended || user.banned ? "Suspended" : "Active"}
              </TableCell>
              {loggedUserData.role === "PLAYER" && (
                <TableCell>
                  <IconButton color={user.isFriend ? "secondary" : "primary"}>
                    {user.isFriend ? <CheckIcon /> : <CloseIcon />}
                  </IconButton>
                </TableCell>
              )}
              {loggedUserData.role === "PLAYER" && (
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
              )}
              <TableCell>
                {(loggedUserData.role === "ADMIN" ||
                  (loggedUserData.role === "MODERATOR" &&
                    user.role === "PLAYER")) && (
                  <IconButton
                    color={user.suspended ? "secondary" : "primary"}
                    onClick={() => handleSuspendToggle(user.id)}
                  >
                    {user.suspended ? <CheckIcon /> : <BlockIcon />}
                  </IconButton>
                )}
              </TableCell>

              <TableCell>
                {(loggedUserData.role === "ADMIN" ||
                  (loggedUserData.role === "MODERATOR" &&
                    user.role === "PLAYER")) && (
                  <IconButton
                    color={user.banned ? "secondary" : "primary"}
                    onClick={() => handleBANToggle(user.id)}
                  >
                    {user.banned ? <CheckIcon /> : <BlockIcon />}
                  </IconButton>
                )}
              </TableCell>

              {loggedUserData.role === "ADMIN" && (
                <TableCell>
                  <IconButton
                    color={user.role === "MODERATOR" ? "secondary" : "primary"}
                    onClick={() => handleMODERATORToggle(user.id)}
                  >
                    {user.role === "MODERATOR" ? <CheckIcon /> : <BlockIcon />}
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        open={isSuspendDialogOpen}
        onClose={() => setIsSuspendDialogOpen(false)}
      >
        <DialogTitle>
          {user.find((u) => u.id === suspendUserId)?.suspended
            ? "Unsuspend User"
            : "Suspend User"}
        </DialogTitle>
        <DialogContent>
          {user.find((u) => u.id === suspendUserId)?.suspended ? (
            <Typography>
              The user is currently suspended. Would you like to lift the
              suspension?
            </Typography>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              id="duration"
              label="Duration in hours"
              type="number"
              fullWidth
              variant="standard"
              value={suspendDuration}
              onChange={(e) => setSuspendDuration(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSuspendDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSuspendConfirm} color="primary">
            {user.find((u) => u.id === suspendUserId)?.suspended
              ? "Unsuspend"
              : "Suspend"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isBannedDialogOpen}
        onClose={() => setIsBannedDialogOpen(false)}
      >
        <DialogTitle>
          {user.find((u) => u.id === BannedUserId)?.banned
            ? "UnBanned User"
            : "Banned User"}
        </DialogTitle>
        <DialogContent>
          {user.find((u) => u.id === BannedUserId)?.banned ? (
            <Typography>
              The user is currently suspended. Would you like to lift the
              suspension?
            </Typography>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              id="reason"
              label="Banned reason"
              type="text"
              fullWidth
              variant="standard"
              value={bannedReason}
              onChange={(e) => setBannedReason(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBannedDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleBANConfirm} color="primary">
            {user.find((u) => u.id === BannedUserId)?.banned
              ? "UnBanned"
              : "Banned"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isModeratorDialogOpen} // Cambiato da isSuspendDialogOpen a isModeratorDialogOpen
        onClose={() => setIsModeratorDialogOpen(false)} // Cambiato da setIsSuspendDialogOpen a setIsModeratorDialogOpen
      >
        <DialogTitle>
          {user.find((u) => u.id === moderatorUserId)?.role === "MODERATOR"
            ? "Unmoderate User"
            : "Moderate User"}{" "}
        </DialogTitle>
        <DialogContent>
          {user.find((u) => u.id === moderatorUserId)?.role === "MODERATOR" ? ( // Cambiato da suspendUserId a moderatorUserId
            <Typography>
              Do you really want to remove the role "moderator" from the user{" "}
              {moderatorUserId}?
            </Typography>
          ) : (
            <Typography>
              Are you sure you want to promote this user to moderator?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsModeratorDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleModerateConfirm} color="primary">
            {user.find((u) => u.id === moderatorUserId)?.role === "MODERATOR" // Cambiato da suspendUserId a moderatorUserId
              ? "Unmoderate"
              : "Promote to Moderator"}{" "}
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default UserModerationPage;
