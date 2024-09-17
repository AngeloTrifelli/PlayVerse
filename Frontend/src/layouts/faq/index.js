import { useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Stack from "@mui/material/Stack";
// Data

// faq components

// Material Dashboard 2 React contexts
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
function faq() {
  

  return (
    <DashboardLayout>
      <Stack direction="row" spacing={10} sx={{ justifyContent: "center", alignItems: "center" }}>
        <LiveHelpIcon sx={{ fontSize: 100 }}  />
      </Stack>
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox mb={3}>
              <Typography variant="h4" fontWeight="medium" align="center">
                Frequently Asked Questions (FAQ)
              </Typography>
            </MDBox>
            {/* FAQ Section */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Qual è la politica di reso?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  La nostra politica di reso permette di restituire i prodotti entro 30 giorni dall
                  acquisto
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Come posso tracciare il mio ordine?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Puoi tracciare il tuo ordine utilizzando il numero di tracciamento che ti è stato
                  inviato via email
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Quali metodi di pagamento accettate?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Accettiamo pagamenti con carta di credito, PayPal, e bonifico bancario...
                </Typography>
              </AccordionDetails>
            </Accordion>
            {/* Aggiungi altre domande FAQ qui */}
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default faq;
