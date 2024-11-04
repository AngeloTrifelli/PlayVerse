import { findUser } from "layouts/authentication/utility/auth-utility";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import axios from "axios"; // Importa Axios per fare richieste HTTP

// Importa i tuoi componenti personalizzati
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import pxToRem from "assets/theme/functions/pxToRem";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const Shop = () => {
  const [cart, setCart] = useState([]); // Stato per il carrello
  const [isCartOpen, setCartOpen] = useState(false); // Stato per aprire/chiudere il carrello
  const [showForm, setShowForm] = useState(false); // Stato per gestire la visibilità del form
  const [role, setRole] = useState(null); // Stato per memorizzare il ruolo dell'utente
  const [error, setError] = useState(null); // Stato per gestire errori di richiesta
  const [products, setProducts] = useState([]); // Stato per i prodotti
  const [code, setProductCode] = useState(""); // Stato per il codice del prodotto
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null); // Stato per il file dell'immagine
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();
  const [missingFields, setMissingFields] = useState({
    code: false,
    price: false,
    image: false,
    description: false
  });
  const dataList = {
    code: code,
    price: price,
    image: imageFile,
    description: description
  };
  const openModal = function (modalMessage) {
    setShowModal(true);
    setModalMessage(modalMessage);
  };
  // Stato per il prodotto da modificare
  const [editingProduct, setEditingProduct] = useState(null);

  // Funzione per aggiungere prodotti al carrello
  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.code === product.code); // Usa 'code' come identificatore
    if (existingProduct) {
      // Se il prodotto esiste già, aggiorna la quantità
      setCart(
        cart.map((item) =>
          item.code === product.code
            ? { ...item, quantity: item.quantity + 1 } // Aumenta la quantità
            : item
        )
      );
    } else {
      // Altrimenti, aggiungi il nuovo prodotto al carrello
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Funzione per rimuovere prodotti dal carrello
  const removeFromCart = (productCode) => {
    setCart(cart.filter((item) => item.code !== productCode)); // Usa 'code' per rimuovere
  };

  // Calcola il prezzo totale
  const getTotalPrice = () => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = async () => {
    // Calcola il prezzo totale
    const totalPrice = getTotalPrice();

    // Controlla se i crediti dell'utente sono sufficienti
    if (userInfo.credits < totalPrice) {
      alert("Insufficient credits to complete the purchase.");
      return; // Ferma l'esecuzione della funzione se i crediti non sono sufficienti
    }

    // Prepara i dati da inviare al backend
    const orderData = {
      total_price: totalPrice, // Aggiungi il prezzo totale qui
      items: cart.map((item) => ({
        userid: userInfo.id,
        code: item.code,
        quantity: item.quantity
      }))
    };

    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Product/Checkout`;

    try {
      // Invia una richiesta POST al backend per aggiornare i valori della tabella
      const response = await axios.post(endpoint, orderData);

      // Gestisci la risposta dal backend
      if (response.data.success) {
        alert(
          `Order placed successfully! Total: $${totalPrice}. Thank you for your purchase!`
        );
        setCart([]); // Svuota il carrello dopo il checkout
        setCartOpen(false); // Chiude il carrello dopo il checkout
      } else {
        alert("There was an issue placing your order. Please try again.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert(
        "An error occurred while placing your order. Please try again later."
      );
    }
  };

  // Funzione per mostrare la descrizione corrispondente
  const handleViewDetails = (description) => {
    setSelectedDescription(description);
  };
  // Funzione per controllare il ruolo dell'utente tramite Axios
  const fetchUserRole = async () => {
    let userInfo = await findUser();

    if (!userInfo) {
      navigate("/dashboard");
    }

    setUserInfo(userInfo);
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/User/getRole`;
    try {
      const response = await axios.get(`${endpoint}?id=${userInfo.id}`); // Sostituisci '1' con l'ID dinamico dell'utente
      console.log(response.data); // Log della risposta
      if (response.data.status === "success") {
        setRole(response.data.role); // Imposta il ruolo dell'utente
      }
    } catch (error) {
      setError("There was an error fetching the user role");
      console.error("Error fetching user role:", error);
    }
  };
  // Funzione per ottenere la lista dei prodotti
  const fetchProducts = async () => {
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Product/getAllProducts`;
    try {
      const response = await axios.get(endpoint); // Chiama l'API
      const productsData = response.data.products.map((product) => ({
        code: product.code, // Usa 'code' come identificativo
        description: product.description, // Usa 'description' per il nome
        price: product.price, // Mantieni 'price'
        image: product.photo || "https://via.placeholder.com/150" // Usa 'photo', fallback se non disponibile
      }));
      setProducts(productsData); // Aggiorna lo stato con i prodotti mappati
    } catch (error) {
      setError("There was an error fetching products");
      console.error("Error fetching products:", error);
    }
  };
  const formSubmitted = async (event) => {
    event.preventDefault();

    // Controlla i campi vuoti nel form, tranne imageFile
    let newMissingFields = Object.keys(dataList).reduce((acc, key) => {
      acc[key] =
        dataList[key] === "" ||
        dataList[key] === null ||
        (typeof dataList[key] === "string" && dataList[key].trim() === "");
      return acc;
    }, {});

    // Controllo dedicato per il file immagine
    const isImageFileEmpty = !imageFile || imageFile.size === 0;
    if (isImageFileEmpty) {
      newMissingFields.image = true;
    }

    setMissingFields(newMissingFields);

    // Se ci sono campi mancanti, interrompi l'invio del form e mostra il modal
    if (Object.values(newMissingFields).some((value) => value)) {
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
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Product/insert_product`;

    try {
      const response = await axios.post(endpoint, formData);

      if (response.status === 201) {
        openModal("Product inserted successfully");
        window.location.href = "/shop"; // Reindirizza alla pagina shop
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
  const editProduct = async (event, product) => {
    // Popola il form con i dati del prodotto
    setEditingProduct(product);
    setProductCode(product.code);
    setPrice(product.price);
    setDescription(product.description);
    setFileName(product.image);
    setShowForm(true); // Mostra il form per la modifica
    event.preventDefault(); // Previene il comportamento predefinito

    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Product/UpdateProduct`;

    try {
      const formData = new FormData();
      formData.append("code", product.code); // Usa il codice del prodotto da modificare
      formData.append("price", price);
      formData.append("description", description);
      if (imageFile) {
        formData.append("imageFile", imageFile); // Aggiungi il file dell'immagine se esiste
      }

      const response = await axios.post(endpoint, formData);

      if (response.status === 200) {
        console.log(response.data.message); // Mostra il messaggio di successo
        window.location.href = "/shop"; // Reindirizza alla pagina shop
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

    console.log("Edit product:", product);
  };

  const deleteProduct = async (event, productCode) => {
    event.preventDefault(); // Previene il comportamento predefinito, se necessario (es. per un form)
    let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Product/DeleteProduct`;
    try {
      // Prepara il payload
      const payload = { code: productCode }; // Crea un oggetto con il codice del prodotto

      const response = await axios.post(endpoint, payload);

      if (response.status === 200) {
        console.log(response.data.message); // Mostra il messaggio di successo
        // Reindirizza alla pagina shop
        window.location.href = "/shop";
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
    console.log("Delete product with code:", productCode);
  };

  // Usa useEffect per chiamare fetchUserRole quando il componente si monta
  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    // Controlla se il ruolo è stato impostato e se l'utente non è admin
    if (role !== "admin") {
      fetchProducts(); // Fetch dei prodotti solo se l'utente non è admin
    }
  }, [role]); // Esegui la fetchProducts quando userRole cambia

  if (error) {
    return <MDTypography color="error">{error}</MDTypography>; // Mostra un messaggio d'errore se la chiamata Axios fallisce
  }

  return (
    <Container>
      {/* Bottone INSERT PRODUCT visibile solo se l'utente è admin */}
      {role?.trim() === "ADMIN" && !showForm && (
        <IconButton
          onClick={() => {
            setShowForm(true); // Apertura del form al click
            setEditingProduct(null); // Imposta a null se stai inserendo un nuovo prodotto
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
          <AddIcon sx={{ marginRight: "5px" }} /> INSERT PRODUCT
        </IconButton>
      )}

      {/* Form di inserimento prodotto, visualizzato solo se showForm è true */}
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
              Enter your product details
            </MDTypography>
          </MDBox>

          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form">
              {/* Input per Product Code */}
              <MDBox mb={2}>
                <MDInput
                  type="number"
                  value={code}
                  label="Product Code"
                  variant="standard"
                  onChange={(event) => setProductCode(event.target.value)}
                  fullWidth
                  disabled={editingProduct !== null} // Disabilita se stai modificando
                  sx={{
                    borderColor: missingFields["code"] ? "red" : "default",
                    "& .MuiInput-underline:before": {
                      borderBottomColor: missingFields["code"]
                        ? "red"
                        : "inherit"
                    }
                  }}
                  InputLabelProps={{
                    style: { color: missingFields["code"] ? "red" : "inherit" }
                  }}
                />
                {missingFields["code"] && (
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

              {/* Input per Price */}
              <MDBox mb={2}>
                <MDInput
                  type="number"
                  value={price}
                  label="Price"
                  variant="standard"
                  onChange={(event) => setPrice(event.target.value)}
                  fullWidth
                  sx={{
                    borderColor: missingFields["price"] ? "red" : "default",
                    "& .MuiInput-underline:before": {
                      borderBottomColor: missingFields["price"]
                        ? "red"
                        : "inherit"
                    }
                  }}
                  InputLabelProps={{
                    style: { color: missingFields["price"] ? "red" : "inherit" }
                  }}
                />
                {missingFields["price"] && (
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

              {/* Input per Immagine */}
              <MDBox mb={2}>
                <label htmlFor="image-upload">
                  <MDButton
                    variant="outlined"
                    component="span"
                    sx={{
                      margin: "10px 0",
                      backgroundColor: "info.main",
                      color: "white",
                      "&:hover": { backgroundColor: "info.dark" }
                    }}
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
                    } else {
                      setImageFile(null); // Resetta lo stato se nessun file è selezionato
                      setFileName(""); // Resetta il nome del file
                    }
                  }}
                />
                {/* Mostra il nome del file accanto al pulsante */}
                {fileName && (
                  <MDTypography display="inline" sx={{ marginLeft: "10px" }}>
                    {fileName}
                  </MDTypography>
                )}
                {missingFields["image"] && (
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

              {/* Input per Descrizione */}
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
                    // Imposta la funzione da chiamare in base a editingProduct
                    if (editingProduct) {
                      editProduct(event, {
                        code,
                        price,
                        description,
                        imageFile
                      }); // Passa i parametri necessari
                    } else {
                      formSubmitted(event);
                    }
                  }}
                  fullWidth
                >
                  {editingProduct ? "Modify" : "Submit"}{" "}
                  {/* Cambia il testo del bottone */}
                </MDButton>
              </MDBox>

              {/* Bottone per tornare indietro */}
              <MDBox mt={2}>
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={() => setShowForm(false)} // Chiude il form
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

      {/* Lista dei prodotti visibile anche per gli admin, non visibile se il form è aperto */}
      {!showForm && (
        <>
          <MDTypography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ marginTop: 4 }}
          >
            Products
          </MDTypography>

          <Grid container spacing={3} sx={{ paddingLeft: "200px" }}>
            {products.map((product) => (
              <Grid item key={product.code} xs={12} sm={6} md={4}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    //src={`../products/${product.image}`}
                    src={`http://localhost:5000/images/products/${product.image}`}
                    alt={product.code}
                  />

                  <CardContent>
                    <MDTypography gutterBottom variant="h5" component="div">
                      {product.code}
                    </MDTypography>
                    <MDTypography variant="body2" color="text.secondary">
                      {product.description}
                    </MDTypography>
                    <MDTypography variant="h6" color="primary">
                      {product.price.toFixed(2)}
                    </MDTypography>
                  </CardContent>
                  <CardActions>
                    {/* Controllo del ruolo per mostrare bottoni diversi */}
                    {role?.trim() === "ADMIN" ? (
                      <>
                        <MDButton
                          size="small"
                          color="success"
                          onClick={(event) => editProduct(event, product)} // Funzione per modificare il prodotto
                        >
                          Edit Product
                        </MDButton>
                        <MDButton
                          size="small"
                          color="error"
                          onClick={(event) =>
                            deleteProduct(event, product.code)
                          } // Funzione per eliminare il prodotto
                        >
                          Delete Product
                        </MDButton>
                      </>
                    ) : (
                      <>
                        <MDButton
                          size="small"
                          color="info"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </MDButton>
                        <MDButton
                          size="small"
                          color="secondary"
                          onClick={() => handleViewDetails(product.description)}
                        >
                          View Details
                        </MDButton>
                      </>
                    )}
                    {/* Dettagli visualizzati a schermo fisso se è selezionato */}
                    {selectedDescription && (
                      <MDBox
                        sx={{
                          position: "fixed",
                          top: "50%", // Centra verticalmente
                          left: "50%", // Centra orizzontalmente
                          transform: "translate(-50%, -50%)", // Sposta indietro per centrare esattamente
                          backgroundColor: "rgba(255, 255, 255, 0.9)", // Colore di sfondo opaco
                          border: "2px solid #ccc",
                          padding: 4, // Aumenta il padding
                          width: "500px", // Larghezza fissa
                          maxWidth: "90%", // Limita la larghezza massima
                          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)", // Ombra per visibilità
                          zIndex: 1000,
                          borderRadius: "8px" // Aggiunge bordi arrotondati
                        }}
                      >
                        <MDTypography variant="h6">Details</MDTypography>
                        <MDTypography variant="body1">
                          {selectedDescription}
                        </MDTypography>
                        <MDButton
                          size="small"
                          color="primary"
                          onClick={() => setSelectedDescription(null)} // Pulsante per chiudere la descrizione
                        >
                          Close
                        </MDButton>
                      </MDBox>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Box>
        {/* Icona del carrello con badge per il numero di articoli */}
        {role?.trim() !== "ADMIN" && ( // Controlla se non è un amministratore
          <IconButton
            onClick={() => setCartOpen(!isCartOpen)}
            sx={{ position: "absolute", top: 10, right: 20 }} // Modificato il valore di top
          >
            <Badge badgeContent={cart.length} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        )}

        {/* Carrello, visibile solo se ci sono articoli */}
        {isCartOpen && (
          <Box
            sx={{
              position: "fixed",
              top: "10px", // Sposta il box ancora più in alto
              right: "20px",
              width: "300px",
              backgroundColor: "rgba(255, 255, 255, 1)",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              padding: "16px",
              zIndex: 1000,
              opacity: 1
            }}
          >
            <IconButton
              onClick={() => setCartOpen(false)} // Chiudi il carrello
              sx={{ position: "absolute", top: 5, right: 5 }} // Posizionamento dell'icona di chiusura
            >
              <CloseIcon /> {/* Icona di chiusura */}
            </IconButton>
            <Typography variant="h6" gutterBottom>
              Cart
            </Typography>
            {/* Visualizzazione del contenuto del carrello */}
            {cart.length > 0 ? (
              cart.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                    backgroundColor: "white", // Sfondo non trasparente per ogni prodotto
                    padding: "8px", // Padding per ogni prodotto
                    borderRadius: "4px", // Angoli arrotondati
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)" // Ombra leggera per ogni prodotto
                  }}
                >
                  <Typography>
                    {item.name} (Code: {item.code}) x {item.quantity}
                  </Typography>{" "}
                  {/* Mostra il nome e il codice del prodotto */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => removeFromCart(item.code)}
                    sx={{ color: "white", backgroundColor: "red" }} // Pulsante rimuovi rosso
                  >
                    Remove
                  </Button>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Your cart is empty.
              </Typography>
            )}
            {/* Mostra il prezzo totale */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total: {getTotalPrice()}
            </Typography>
            {/* Pulsante per il checkout */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckout}
              sx={{ mt: 2 }}
            >
              Checkout
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Shop;
