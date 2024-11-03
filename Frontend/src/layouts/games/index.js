import { findUser } from "layouts/authentication/utility/auth-utility";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent
} from "@mui/material";
import pumpkin from "assets/images/pumpkin.jpg";
import kraft from "assets/images/kraft.jpg";
import nippets from "assets/images/nippets.jpg";
import tanuki from "assets/images/tanuki.jpg";
import truck from "assets/images/truck.jpg";
import vampire from "assets/images/vampire.jpg";
import axios from "axios"; // Assicurati di aver importato axios
const games = [
  {
    id: 1,
    title: "Pumpkin Cafe",
    image: pumpkin,
    description: "A cozy Halloween themed cooking game",
    gameUrl: "https://ilymeiib.itch.io/pumpkin-cafe" // URL del gioco
  },
  {
    id: 2,
    title: "Kraft & Slash",
    image: kraft,
    description: "Craft your weapon and fight!",
    gameUrl: "https://purejamgames.itch.io/kraft-slash" // URL del gioco
  },
  {
    id: 3,
    title: "Nippets",
    image: nippets,
    description: "Hidden Object Game",
    gameUrl: "https://vatnisse-interactive.itch.io/nippets" // URL del gioco
  },
  {
    id: 4,
    title: "Tanuki Sunset",
    image: tanuki,
    description:
      "Raccoons riding longboards on this retro themed relaxing arcade game",
    gameUrl: "https://rewindgames.itch.io/tanuki-sunset" // URL del gioco
  },
  {
    id: 5,
    title: "Tiny Truck Racing",
    image: truck,
    description: "Race tiny trucks around tiny tracks!",
    gameUrl: "https://benjames171.itch.io/tiny-truck-racing" // URL del gioco
  },
  {
    id: 6,
    title: "Vampire Survivors",
    image: vampire,
    description: "Mow thousands of night creatures and survive!",
    gameUrl: "https://poncle.itch.io/vampire-survivors" // URL del gioco
  }
];

const GameCatalog = () => {
  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameWindow, setGameWindow] = useState(null); // Stato per tracciare la finestra del gioco
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();

  let localStartTime = null; // Variabile locale per tracciare l'inizio della sessione di gioco

  // Apre il dialogo con i dettagli del gioco
  const handleOpen = (game) => {
    setSelectedGame(game);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedGame(null);
  };

  // Apre il gioco in una nuova finestra e traccia il tempo
  const handlePlayClick = (game) => {
    const openedWindow = window.open(game.gameUrl, "_blank"); // Apre il gioco in una nuova finestra
    setGameWindow(openedWindow);
    localStartTime = Date.now(); // Imposta il tempo di inizio della sessione di gioco con una variabile locale

    // Monitora la chiusura della finestra del gioco ogni secondo
    const interval = setInterval(() => {
      if (openedWindow.closed) {
        clearInterval(interval); // Ferma l'intervallo quando la finestra è chiusa
        setSelectedGame(game);

        handleGameEnd(); // Calcola il tempo giocato
      }
    }, 1000);
  };

  const handleGameEnd = async (game) => {
    const endTime = Date.now();

    if (localStartTime) {
      const timePlayed = ((endTime - localStartTime) / 1000).toFixed(2);

      // Controlla se selectedGame è valido
      if (selectedGame) {
        console.log("Selected Game:", selectedGame); // Log per controllare i dati
        const gameData = {
          game: selectedGame.title, // Usa il titolo dal selectedGame
          userId: userInfo.id,
          timePlayed: parseFloat(timePlayed),
          gameEndTime: new Date().toISOString()
        };

        let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Game/PlayedGame`;
        console.log("Invio dati a:", endpoint);

        try {
          const response = await axios.post(endpoint, gameData);
          if (response.data.success) {
            console.log("Tempo di gioco salvato con successo!");
          } else {
            console.error(
              "Errore nel salvataggio del tempo di gioco:",
              response.data.message
            );
          }
          alert(
            `Hai guadagnato ${response.data.total_points_today} su 100 massimi giornalieri`
          );
        } catch (error) {
          console.error(
            "Errore durante la chiamata al server:",
            error.response || error.message
          );
        }
        setGameWindow(null);
      } else {
        console.error("Errore: selectedGame è null.");
      }
    } else {
      console.error(
        "Errore: il tempo di inizio non è stato registrato correttamente."
      );
    }
  };

  const fetchUser = async () => {
    let userInfo = await findUser();

    if (!userInfo) {
      navigate("/dashboard");
    }

    setUserInfo(userInfo);
  };
  // Usa useEffect per chiamare fetchUserRole quando il componente si monta
  useEffect(() => {
    fetchUser();
  }, []);

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
                <Button
                  color="primary"
                  style={{ marginTop: 10 }}
                  onClick={() => handlePlayClick(game)} // Avvio del gioco
                >
                  Play
                </Button>
                <Button
                  color="secondary"
                  style={{ marginTop: 10 }}
                  onClick={() => handleOpen(game)} // Apertura dettagli
                >
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
            <Typography variant="body1">{selectedGame.description}</Typography>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default GameCatalog;
