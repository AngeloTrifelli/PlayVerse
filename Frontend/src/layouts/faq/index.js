import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Modal,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from "@mui/material";

// Importa altri componenti personalizzati o di librerie
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import pxToRem from "assets/theme/functions/pxToRem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import axios from "axios"; // Importa Axios per fare richieste HTTP
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";

const FAQ = () => {
  const [role, setRole] = useState(null); // Stato per memorizzare il ruolo dell'utente
  const [error, setError] = useState(null); // Stato per gestire errori di richiesta
  const [showForm, setShowForm] = useState(false); // Stato per gestire la visibilità del form
  const [faq, setFAQ] = useState([]); // Stato per i prodotti
  const [title, setTitle] = useState(""); // Stato per il codice del prodotto
  const [description, setDescription] = useState("");
  const [id, setID] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [missingFields, setMissingFields] = useState({
    title: false,
    description: false
  });

  const faqList = {
    title: title,
    description: description
  };

  const openModal = function (modalMessage) {
    setShowModal(true);
    setModalMessage(modalMessage);
  };
  // Stato per il prodotto da modificare
  const [editingFAQ, setEditingFAQ] = useState(null);

  // Funzione per controllare il ruolo dell'utente tramite Axios
  const fetchUserRole = async () => {
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/getRole`;
    try {
      const response = await axios.get(`${endpoint}?id=1`); // Sostituisci '1' con l'ID dinamico dell'utente
      console.log(response.data); // Log della risposta
      if (response.data.status === "success") {
        setRole(response.data.role); // Imposta il ruolo dell'utente
      }
    } catch (error) {
      setError("There was an error fetching the user role");
      console.error("Error fetching user role:", error);
    }
  };
  const fetchFAQ = async () => {
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/FAQ/getAllFAQ`;
    try {
      const response = await axios.get(endpoint);
      const FAQData = response.data.map((faq) => ({
        id: faq.id,
        title: faq.title,
        description: faq.description
      }));
      setFAQ(FAQData);
    } catch (error) {
      setError("There was an error fetching faqs");
      console.error(
        "Error fetching faqs:",
        error.response?.data || error.message
      );
    }
  };

  const formSubmitted = async (event) => {
    event.preventDefault();

    if (
      Object.values(faqList).some(
        (value) =>
          value === "" ||
          value === null ||
          (typeof value === "string" && value.trim() === "")
      )
    ) {
      let newMissingFields = Object.keys(faqList).reduce((acc, key) => {
        acc[key] =
          faqList[key] === "" ||
          faqList[key] === null ||
          (typeof faqList[key] === "string" && faqList[key].trim() === "");
        return acc;
      }, {});

      setMissingFields(newMissingFields);
      openModal("Please fill all the required fields!");
      return;
    }
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/FAQ/insert_faq`;

    try {
      const response = await axios.post(endpoint, faqList);

      if (response.status === 201) {
        openModal("Registration successful");
        window.location.href = "/faq"; // Reindirizza alla pagina shop
      }
    } catch (error) {
      if (error.response) {
        let errorMessage = error.response.data.error;

        if (
          errorMessage === undefined &&
          typeof error.response.data === "string"
        ) {
          let parser = new DOMParser();
          let preElement = parser
            .parseFromString(error.response.data, "text/html")
            .querySelector("pre");
          let pElement = parser
            .parseFromString(error.response.data, "text/html")
            .querySelector("p");

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
  // Definizione delle funzioni
  const editFAQ = async (event, faq) => {
    // Popola il form con i dati del prodotto
    setEditingFAQ(faq);
    setID(faq.id);
    setTitle(faq.title);
    setDescription(faq.description);
    setShowForm(true); // Mostra il form per la modifica
    event.preventDefault(); // Previene il comportamento predefinito

    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/FAQ/UpdateFAQ`;

    try {
      const faqList = {
        id: id,
        title: title,
        description: description
      };

      const response = await axios.post(endpoint, faqList);

      if (response.status === 200) {
        console.log(response.data.message); // Mostra il messaggio di successo
        window.location.href = "/faq"; // Reindirizza alla pagina shop
      } else {
        console.warn("Unexpected response:", response);
      }
    } catch (error) {
      if (error.response) {
        console.error("Error:", error.response.data); // Mostra l'errore dal server
      } else if (error.request) {
        console.error("No response received:", error.request); // Nessuna risposta dal server
      } else {
        console.error("Request setup error:", error.message); // Errore di configurazione della richiesta
      }
    }

    console.log("Edit faq:", faq);
  };

  const deleteFAQ = async (event, id) => {
    event.preventDefault(); // Previene il comportamento predefinito, se necessario (es. per un form)
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/FAQ/DeleteFAQ`;
    try {
      // Prepara il payload
      const payload = { id: id }; // Crea un oggetto con il codice del prodotto

      const response = await axios.post(endpoint, payload);

      if (response.status === 200) {
        console.log(response.data.message); // Mostra il messaggio di successo
        // Reindirizza alla pagina shop
        window.location.href = "/faq";
        // Puoi aggiornare lo stato o eseguire altre azioni qui
      } else {
        console.warn("Unexpected response:", response);
      }
    } catch (error) {
      if (error.response) {
        console.error("Error:", error.response.data); // Errore dal server
      } else if (error.request) {
        console.error("No response received:", error.request); // Nessuna risposta dal server
      } else {
        console.error("Request setup error:", error.message); // Errore di configurazione della richiesta
      }
    }
    console.log("Delete faq with id:", id);
  };
  useEffect(() => {
    fetchUserRole();
    if (role !== "ADMIN") {
      fetchFAQ();
    }
  }, [role]);

  if (error) {
    return <MDTypography color="error">{error}</MDTypography>;
  }

  return (
    <Container>
      {/* Bottone INSERT faq visibile solo se l'utente è admin */}
      {role?.trim() === "ADMIN" && !showForm && (
        <IconButton
          onClick={() => {
            setShowForm(true); // Apertura del form al click
            setEditingFAQ(null); // Imposta a null se stai inserendo un nuovo prodotto
          }}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            backgroundColor: "#1976d2", // Cambia il colore di sfondo
            color: "info",
            "&:hover": {
              backgroundColor: "#1976d2" // Colore di sfondo al passaggio del mouse
            },
            borderRadius: "8px", // Aggiungi un bordo arrotondato
            padding: "10px 20px", // Aggiungi padding per un aspetto più carino
            boxShadow: 3 // Aggiungi ombra
          }}
        >
          <AddIcon sx={{ marginRight: "5px" }} /> INSERT faq
        </IconButton>
      )}
      {showForm && (
        <Box
          sx={{
            margin: "20px auto",
            width: "50%",
            textAlign: "left",
            marginLeft: "30%"
          }}
        >
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
              Admin Form
            </MDTypography>
            <MDTypography display="block" variant="button" color="white" my={1}>
              Enter your FAQ details
            </MDTypography>
          </MDBox>

          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              {/* Form input fields and buttons */}
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  value={title}
                  label="FAQ Title"
                  variant="standard"
                  onChange={(event) => setTitle(event.target.value)}
                  fullWidth
                  sx={{
                    borderColor: missingFields["title"] ? "red" : "default",
                    "& .MuiInput-underline:before": {
                      borderBottomColor: missingFields["title"]
                        ? "red"
                        : "inherit"
                    }
                  }}
                  InputLabelProps={{
                    style: { color: missingFields["title"] ? "red" : "inherit" }
                  }}
                />
                {missingFields["title"] && (
                  <MDTypography
                    display="block"
                    my={1}
                    variant="h6"
                    color="red"
                    sx={{ color: "red" }}
                  >
                    Insert Data!
                  </MDTypography>
                )}
              </MDBox>

              <MDBox mb={2}>
                <MDInput
                  label="Description"
                  multiline
                  rows={4}
                  value={description}
                  variant="standard"
                  onChange={(event) => setDescription(event.target.value)}
                  fullWidth
                  sx={{
                    borderColor: missingFields["description"]
                      ? "red"
                      : "default",
                    "& .MuiInput-underline:before": {
                      borderBottomColor: missingFields["description"]
                        ? "red"
                        : "inherit"
                    }
                  }}
                  InputLabelProps={{
                    style: {
                      color: missingFields["description"] ? "red" : "inherit"
                    }
                  }}
                />
                {missingFields["description"] && (
                  <MDTypography
                    display="block"
                    my={1}
                    variant="h6"
                    color="red"
                    sx={{ color: "red" }}
                  >
                    Insert Data!
                  </MDTypography>
                )}
              </MDBox>

              <MDBox mt={4} mb={1}>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={(event) => {
                    if (editingFAQ) {
                      editFAQ(event, { id, title, description });
                    } else {
                      formSubmitted(event);
                    }
                  }}
                  fullWidth
                >
                  {editingFAQ ? "Modify" : "Submit"}
                </MDButton>
              </MDBox>

              <MDBox mt={2}>
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={() => setShowForm(false)}
                  fullWidth
                >
                  Back
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
          <Modal
            open={showModal}
            onClose={() => setShowModal(false)}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <MDBox
              textAlign="center"
              variant="gradient"
              sx={{
                borderRadius: 3,
                paddingLeft: "1%",
                paddingRight: "1%",
                paddingTop: "1%",
                paddingBottom: "2%"
              }}
            >
              <MDTypography variant="h5" component="h2">
                {modalMessage}
              </MDTypography>
              <MDButton
                onClick={() => setShowModal(false)}
                variant="contained"
                color="primary"
                sx={{ marginTop: pxToRem(20) }}
              >
                OK
              </MDButton>
            </MDBox>
          </Modal>
        </Box>
      )}
      {!showForm && (
        <DashboardLayout>
          {/* Lista delle FAQ con pulsanti di modifica ed eliminazione per ADMIN */}
          <Stack
            direction="row"
            spacing={10}
            sx={{ justifyContent: "center", alignItems: "center" }}
          >
            <LiveHelpIcon sx={{ fontSize: 100 }} />
          </Stack>
          <MDBox py={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDBox mb={3}>
                  <Typography variant="h4" fontWeight="medium" align="center">
                    Frequently Asked Questions (FAQ)
                  </Typography>
                </MDBox>
                {faq.map((faq, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{faq.title}</Typography>
                      {/* Pulsanti "Modifica" e "Elimina" visibili solo se l'utente è ADMIN */}
                      {role?.trim() === "ADMIN" && (
                        <MDBox
                          sx={{ marginLeft: "auto", display: "flex", gap: 1 }}
                        >
                          <MDButton
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={(event) => editFAQ(event, faq)}
                          >
                            Edit
                          </MDButton>
                          <MDButton
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={(event) => deleteFAQ(event, faq.id)}
                          >
                            Delete
                          </MDButton>
                        </MDBox>
                      )}
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>{faq.description}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
            </Grid>
          </MDBox>
        </DashboardLayout>
      )}
    </Container>
  );
};

export default FAQ;
