import React, { useState } from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';

// Dati di esempio dei giochi
const games = [
    {
        id: 1,
        title: 'The Legend of Zelda',
        image: 'https://via.placeholder.com/150',
        description: 'A legendary advgvyvfventure game',
      },
      {
        id: 2,
        title: 'Super Mario Odyssey',
        image: 'https://via.placeholder.com/150',
        description: 'A 3D platforming adventure  Mario',
      },
      {
        id: 3,
        title: 'Minecraft',
        image: 'https://via.placeholder.com/150',
        description: 'A sandbox game about creativity and ',
      },
      {
        id: 4,
        title: 'uhbgwebgug',
        image: 'https://via.placeholder.com/150',
        description: 'A 3D platforming adventure  Mario',
      }];

const GameCatalog = () => {
  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const handleOpen = (game) => {
    setSelectedGame(game);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedGame(null);
  };

  return (
    <>
      <Grid container spacing={4} sx={{ paddingLeft: "300px" }}>
        {games.map((game) => (
          <Grid item key={game.id} xs={12} sm={6} md={4} sx={{ marginTop: 4 }}>
            <Card>
              <CardMedia
                component="img"
                height="150"
                image={game.image}
                alt={game.title}
              />
              <CardContent>
                <Typography variant="h6" component="div">
                  {game.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {game.description}
                </Typography>
                <Button color="primary" style={{ marginTop: 10 }}>
                  Play
                </Button>
                <Button color="secondary" style={{ marginTop: 10 }} onClick={() => handleOpen(game)}>
                  Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedGame && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{selectedGame.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              {selectedGame.description}
            </Typography>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default GameCatalog;
