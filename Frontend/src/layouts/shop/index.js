import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  CardActions,
  Badge,
  IconButton,
  Box,
  ListItem,
  ListItemText,
  Divider,
  List,
  Modal
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios"; // Importa Axios per fare richieste HTTP

// Importa i tuoi componenti personalizzati
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import pxToRem from "assets/theme/functions/pxToRem";

const products = [
  {
    id: 1,
    name: "Product 1",
    description: "This is the description for product 1",
    price: 10.0,
    image: "../Backend/images/products/24.jpg",
  },
  {
    id: 2,
    name: "Product 2",
    description: "This is the description for product 2",
    price: 20.0,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Product 3",
    description: "This is the description for product 3",
    price: 30.0,
    image: "https://via.placeholder.com/150",
  },
  // Add more products here
];

const Shop = () => {
  const [cart, setCart] = useState([]); // Stato per il carrello
  const [isCartOpen, setCartOpen] = useState(false); // Stato per aprire/chiudere il carrello
  const [role, setRole] = useState(null); // Stato per memorizzare il ruolo dell'utente
  const [error, setError] = useState(null); // Stato per gestire errori di richiesta
  const [code, setProductCode] = useState(""); // Stato per il codice del prodotto
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null); // Stato per il file dell'immagine
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [missingFields, setMissingFields] = useState({
    code: false,
    price: false,
    image: false,
    description: false,   
  })
  const dataList = {
    code: code,
    price: price,
    image: imageFile,
    description: description,   
  }
  const openModal = function (modalMessage) {
    setShowModal(true);
    setModalMessage(modalMessage);
  };
   
  // Funzione per aggiungere prodotti al carrello
  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Funzione per rimuovere prodotti dal carrello
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // Calcola il prezzo totale
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  // Gestione del checkout
  const handleCheckout = () => {
    alert(`Total: €${getTotalPrice()}. Thank you for your purchase!`);
    setCart([]); // Svuota il carrello dopo il checkout
  };

  // Funzione per controllare il ruolo dell'utente tramite Axios
  const fetchUserRole = async () => {
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/getRole`;
    try {
      const response = await axios.get(`${endpoint}?id=2`); // Sostituisci '1' con l'ID dinamico dell'utente
      console.log(response.data); // Log della risposta
      if (response.data.status === "success") {
        setRole(response.data.role); // Imposta il ruolo dell'utente
      }
    } catch (error) {
      setError("There was an error fetching the user role");
      console.error("Error fetching user role:", error);
    }
  };
  // Funzione per verificare se un campo è vuoto, con controllo specifico per il file
  const isFieldEmpty = (value) => {
    if (value instanceof File) {
      return !value.size; // Ritorna true se il file è vuoto o non esiste
    }
    return value === "" || value === null || (typeof value === 'string' && value.trim() === "");
  };

  const formSubmitted = async (event) => {
    event.preventDefault();

     // Controlla i campi vuoti nel form, tranne imageFile
  let newMissingFields = Object.keys(dataList).reduce((acc, key) => {
    acc[key] = dataList[key] === "" || dataList[key] === null || (typeof dataList[key] === 'string' && dataList[key].trim() === "");
    return acc;
  }, {});

  // Controllo dedicato per il file immagine
  const isImageFileEmpty = !imageFile || imageFile.size === 0;
  if (isImageFileEmpty) {
    newMissingFields.image = true;
  }

  setMissingFields(newMissingFields);

  // Se ci sono campi mancanti, interrompi l'invio del form e mostra il modal
  if (Object.values(newMissingFields).some(value => value)) {
    openModal("Please fill all the required fields!");
    return;
  }
    // Crea il FormData
    const formData = new FormData();
    formData.append("code", code);
    formData.append("price", price);
    formData.append("description", description);
    if (imageFile) {
        formData.append("imageFile", imageFile); // File dell'immagine
    }
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/products`;

    try {
        const response = await axios.post(endpoint, formData);

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

  // Usa useEffect per chiamare fetchUserRole quando il componente si monta
  useEffect(() => {
    fetchUserRole();
  }, []);

  if (error) {
    return <MDTypography color="error">{error}</MDTypography>; // Mostra un messaggio d'errore se la chiamata Axios fallisce
  }

  return (
    <Container>
      {/* Controllo sul ruolo: se admin, mostra il form di inserimento */}
      {role === "ADMIN" ? (
        <Box sx={{ margin: "20px auto", width: "50%", textAlign: "left", marginLeft: "30%" }}>
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
            Enter your product details
          </MDTypography>
        </MDBox>
      
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput
                type="number"
                value={code}
                label="Product Code"
                variant="standard"
                onChange={(event) => setProductCode(event.target.value)}
                fullWidth
                sx={{
                  borderColor: missingFields['code'] ? 'red' : 'default',
                  '& .MuiInput-underline:before': {
                    borderBottomColor: missingFields['code'] ? 'red' : 'inherit'
                  }
                }}
                InputLabelProps={{
                  style: { color: missingFields['code'] ? 'red' : 'inherit' }
                }}
              />
              {missingFields['code'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx={{ color: 'red' }}>Insert Data!</MDTypography>
              }
            </MDBox>
      
            <MDBox mb={2}>
              <MDInput
                type="number"
                value={price}
                label="Price"
                variant="standard"
                onChange={(event) => setPrice(event.target.value)}
                fullWidth
                sx={{
                  borderColor: missingFields['price'] ? 'red' : 'default',
                  '& .MuiInput-underline:before': {
                    borderBottomColor: missingFields['price'] ? 'red' : 'inherit'
                  }
                }}
                InputLabelProps={{
                  style: { color: missingFields['price'] ? 'red' : 'inherit' }
                }}
              />
              {missingFields['price'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx={{ color: 'red' }}>Insert Data!</MDTypography>
              }
            </MDBox>
      
            <MDBox mb={2}>
              <label htmlFor="image-upload">
                <MDButton
                  variant="outlined"
                  component="span"
                  sx={{ margin: "10px 0", backgroundColor: "info.main", color: "white", "&:hover": { backgroundColor: "info.dark" } }}
                >
                  Choose File
                </MDButton>
              </label>
              <input
                id="image-upload"
                type="file"
                name="image"
                accept="image/*" // Consente solo immagini
                style={{ display: "none" }}
                onChange={(event) => {
                  const file = event.target.files[0]; // Ottieni il file selezionato
                  if (file) {
                    setImageFile(file); // Salva il file dell'immagine
                    setFileName(file.name); // Aggiorna il nome del file
                  }else {
                    setImageFile(null);        // Resetta lo stato se nessun file è selezionato
                    setFileName("");           // Resetta il nome del file
                  }
                }}
              />
              {/* Mostra il nome del file accanto al pulsante */}
              {fileName && (
                <MDTypography display="inline" sx={{ marginLeft: "10px" }}>
                  {fileName}
                </MDTypography>
              )}
              {missingFields['image'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx={{ color: 'red' }}>Insert Data!</MDTypography>
              }
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
                  borderColor: missingFields['description'] ? 'red' : 'default',
                  '& .MuiInput-underline:before': {
                    borderBottomColor: missingFields['description'] ? 'red' : 'inherit'
                  }
                }}
                InputLabelProps={{
                  style: { color: missingFields['description'] ? 'red' : 'inherit' }
                }}
              />
              {missingFields['description'] && 
                <MDTypography display="block" my={1} variant="h6" color="red" sx={{ color: 'red' }}>Insert Data!</MDTypography>
              }
            </MDBox>
      
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" onClick={formSubmitted} fullWidth>
                Submit
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>

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
      </Box>
      
      ) : (
        // Altrimenti, mostra la lista dei prodotti
        <>
          <IconButton
            onClick={() => setCartOpen(!isCartOpen)}
            sx={{ position: "fixed", top: 20, right: 20 }}
          >
            <Badge
              badgeContent={cart.reduce((total, item) => total + item.quantity, 0)}
              color="secondary"
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          <MDTypography variant="h4" component="h1" gutterBottom align="center" sx={{ marginTop: 4 }}>
            Shop
          </MDTypography>

          <Grid container spacing={3} sx={{ paddingLeft: "200px" }}>
            {products.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardMedia component="img" height="140" image={product.image} alt={product.name} />
                  <CardContent>
                    <MDTypography gutterBottom variant="h5" component="div">
                      {product.name}
                    </MDTypography>
                    <MDTypography variant="body2" color="text.secondary">
                      {product.description}
                    </MDTypography>
                    <MDTypography variant="h6" color="primary">
                      €{product.price.toFixed(2)}
                    </MDTypography>
                  </CardContent>
                  <CardActions>
                    <MDButton size="small" color="info" onClick={() => addToCart(product)}>
                      Add to Cart
                    </MDButton>
                    <MDButton size="small" color="secondary">
                      View Details
                    </MDButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Carrello */}
      {isCartOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "300px",
            height: "100%",
            backgroundColor: "white",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            zIndex: 1000,
            overflowY: "auto",
          }}
        >
          <IconButton onClick={() => setCartOpen(false)} sx={{ position: "absolute", top: 10, right: 10 }}>
            <CloseIcon />
          </IconButton>
          <Box sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>Your Cart</Typography>
            {cart.length === 0 ? (
              <Typography>Your cart is empty.</Typography>
            ) : (
              <List>
                {cart.map((item) => (
                  <ListItem key={item.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <ListItemText
                      primary={`${item.name} x${item.quantity}`}
                      secondary={`€${(item.price * item.quantity).toFixed(2)}`}
                    />
                    <Button size="small" color="error" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </Button>
                  </ListItem>
                ))}
                <Divider />
                <Box sx={{ padding: 2 }}>
                  <Typography variant="h6">Total: €{getTotalPrice()}</Typography>
                  <MDButton
                    variant="gradient"
                    color="info"
                    fullWidth
                    onClick={handleCheckout}
                    sx={{ marginTop: 2 }}
                  >
                    Checkout
                  </MDButton>
                </Box>
              </List>
            )}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Shop;
