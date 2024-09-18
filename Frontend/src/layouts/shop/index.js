import React, { useState } from "react";
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
  List,
  ListItem,
  ListItemText,
  Divider,
  Icon,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close"; // Import the Close Icon

const products = [
  {
    id: 1,
    name: "Product 1",
    description: "This is the description for product 1",
    price: 10.0,
    image: "https://via.placeholder.com/150",
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
  // State to manage cart items
  const [cart, setCart] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);

  // Function to add product to the cart
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

  // Function to remove product from the cart
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // Calculate the total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  // Function to handle checkout
  const handleCheckout = () => {
    alert(`Total: €${getTotalPrice()}. Thank you for your purchase!`);
    setCart([]); // Clear the cart after checkout
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ marginTop: 4 }}>
        Shop
      </Typography>
      {/* Cart Icon */}
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

      <Grid container spacing={3} sx={{ paddingLeft: "200px" }}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia component="img" height="140" image={product.image} alt={product.name} />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  €{product.price.toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => addToCart(product)}>
                  Add to Cart
                </Button>
                <Button size="small" color="secondary">
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Fixed Cart Box */}
      {isCartOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "300px",
            height: "100%",
            bgcolor: "background.paper",
            boxShadow: 3,
            overflowY: "auto",
            zIndex: 1300,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Cart
            </Typography>
            <IconButton onClick={() => setCartOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          {cart.length === 0 ? (
            <Typography sx={{ padding: 2 }}>Your cart is empty.</Typography>
          ) : (
            <>
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
                <Button
                  variant="contained"
                  color="white"
                  fullWidth
                  onClick={handleCheckout}
                  sx={{ marginTop: 2 }}
                >
                  Checkout
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Shop;
