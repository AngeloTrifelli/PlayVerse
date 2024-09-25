import { useState } from "react";

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

function UserRanking() {
  const [users] = useState([
    { name: "Mario Rossi", punteggio: 85 },
    { name: "Luca Bianchi", punteggio: 92 },
    { name: "Sara Verdi", punteggio: 78 },
    { name: "Giulia Neri", punteggio: 88 },
    { name: "Francesco Gialli", punteggio: 65 }
  ]);

  const sortedUsers = [...users].sort((a, b) => b.punteggio - a.punteggio);

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
                  {sortedUsers.map((user, index) => (
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
                              {index + 1}. {user.name}
                            </MDTypography>
                          </MDBox>
                          <MDTypography variant="h6" color="textSecondary">
                            Punteggio: {user.punteggio}
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default UserRanking;
