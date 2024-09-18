import React from 'react';
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button, CardActions } from '@mui/material';

const products = [
  {
    id: 1,
    name: 'Product 1',
    description: 'This is the description for product 1',
    price: '€10.00',
    image: 'https://via.placeholder.com/150'
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'This is the description for product 2',
    price: '€20.00',
    image: 'https://via.placeholder.com/150'
  },
  {
    id: 3,
    name: 'Product 3',
    description: 'This is the description for product 3',
    price: '€30.00',
    image: 'https://via.placeholder.com/150'
  },
  // Aggiungi altri prodotti qui
];

const Shop = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ marginTop: 4 }}>
        Shop
      </Typography>
      <Grid container spacing={3} sx={{ paddingLeft: '200px' }}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={product.image}
                alt={product.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  {product.price}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
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
    </Container>
  );
};

export default Shop;
