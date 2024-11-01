import { findUser } from "layouts/authentication/utility/auth-utility";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui/material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import axios from "axios"; // Importa Axios per fare richieste HTTP

function UserRanking() {
  const [user, setUser] = useState([]); // Stato per i user
  const [error, setError] = useState(null); // Stato per gestire errori di richiesta
  const sortedUsers = [...user].sort((a, b) => b.points - a.points);
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();

  // Definiamo le icone e colori per il podio (oro, argento, bronzo)
  const getMedalIcon = (index) => {
    if (index === 0) return "emoji_events"; // Trofeo per l'oro
    if (index === 1) return "military_tech"; // Distintivo per l'argento
    if (index === 2) return "star"; // Stella per il bronzo
    return null; // Nessuna icona per altri utenti
  };

  const getMedalColor = (index) => {
    if (index === 0) return "gold"; // Oro
    if (index === 1) return "silver"; // Argento
    if (index === 2) return "#cd7f32"; // Bronzo
    return "default";
  };

  const getBoxShadow = (index) => {
    if (index === 0) return "0px 4px 20px rgba(255, 215, 0, 0.6)"; // Ombra oro
    if (index === 1) return "0px 4px 20px rgba(192, 192, 192, 0.6)"; // Ombra argento
    if (index === 2) return "0px 4px 20px rgba(205, 127, 50, 0.6)"; // Ombra bronzo
    return "0px 2px 10px rgba(0, 0, 0, 0.1)"; // Ombra di default
  };

  const fetchUser = async () => {
    let userInfo = await findUser();

    if (!userInfo) {
      navigate("/dashboard");
    }

    setUserInfo(userInfo);
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/getAllUser`;
    try {
      const response = await axios.get(endpoint);
      const UserData = response.data
        .filter((user) => user.role?.trim() === "PLAYER" && !user.suspended) // Filtra solo utenti con ruolo "USER" senza spazi e non sospesi
        .map((user) => ({
          id: user.id,
          username: user.username,
          role: user.role?.trim(), // Applica trim per uniformità
          points: user.points
        }));

      setUser(UserData);
    } catch (error) {
      setError("There was an error fetching users");
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
    }
  };

  // Usa useEffect per chiamare fetchUserRole quando il componente si monta
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h5">Classifica Utenti</MDTypography>
              </MDBox>
              <MDBox pt={2} px={2} pb={2}>
                <Grid container spacing={2}>
                  {/* Mostra solo i primi 10 utenti */}
                  {sortedUsers.slice(0, 10).map((user, index) => (
                    <Grid item xs={12} key={index}>
                      <Card
                        sx={{
                          boxShadow: getBoxShadow(index), // Ombre per i primi tre posti
                          borderRadius: "12px"
                        }}
                      >
                        <MDBox
                          p={2}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <MDBox display="flex" alignItems="center">
                            {index < 3 && (
                              <Icon
                                fontSize="small"
                                sx={{
                                  color: getMedalColor(index), // Colore icona
                                  marginRight: "8px"
                                }}
                              >
                                {getMedalIcon(index)} // Icona del podio
                              </Icon>
                            )}
                            <MDTypography variant="h6">
                              {index + 1}. {user.username}
                            </MDTypography>
                          </MDBox>
                          <MDTypography variant="h6" color="textSecondary">
                            Punteggio: {user.points}
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>
              {/* Mostra l'utente loggato se non è nei primi 10 */}
              {!sortedUsers
                .slice(0, 10)
                .some((user) => user.id === userInfo.id) && (
                <MDBox mt={3} pb={2} textAlign="center">
                  <Card
                    sx={{
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                      borderRadius: "12px",
                      backgroundColor: "#f0f0f0"
                    }}
                  >
                    <MDBox
                      p={2}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <MDBox display="flex" alignItems="center">
                        <MDTypography variant="h6" color="primary">
                          {userInfo.username}
                        </MDTypography>
                      </MDBox>
                      <MDTypography variant="h6" color="textSecondary">
                        Punteggio: {userInfo.points}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </MDBox>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default UserRanking;
