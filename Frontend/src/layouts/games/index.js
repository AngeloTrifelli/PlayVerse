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
  DialogContent,
  Modal // Import Modal from MUI
} from "@mui/material";
import pumpkin from "assets/images/pumpkin.jpg";
import kraft from "assets/images/kraft.jpg";
import nippets from "assets/images/nippets.jpg";
import tanuki from "assets/images/tanuki.jpg";
import truck from "assets/images/truck.jpg";
import vampire from "assets/images/vampire.jpg";
import axios from "axios"; // Import axios

const games = [
  {
    id: 1,
    title: "Pumpkin Cafe",
    image: pumpkin,
    description: "A cozy Halloween themed cooking game",
    gameUrl: "https://ilymeiib.itch.io/pumpkin-cafe" // Game URL
  },
  {
    id: 2,
    title: "Kraft & Slash",
    image: kraft,
    description: "Craft your weapon and fight!",
    gameUrl: "https://purejamgames.itch.io/kraft-slash" // Game URL
  },
  {
    id: 3,
    title: "Nippets",
    image: nippets,
    description: "Hidden Object Game",
    gameUrl: "https://vatnisse-interactive.itch.io/nippets" // Game URL
  },
  {
    id: 4,
    title: "Tanuki Sunset",
    image: tanuki,
    description: "Raccoons riding longboards in this retro themed arcade game",
    gameUrl: "https://rewindgames.itch.io/tanuki-sunset" // Game URL
  },
  {
    id: 5,
    title: "Tiny Truck Racing",
    image: truck,
    description: "Race tiny trucks around tiny tracks!",
    gameUrl: "https://benjames171.itch.io/tiny-truck-racing" // Game URL
  },
  {
    id: 6,
    title: "Vampire Survivors",
    image: vampire,
    description: "Mow thousands of night creatures and survive!",
    gameUrl: "https://poncle.itch.io/vampire-survivors" // Game URL
  }
];

const GameCatalog = () => {
  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showModal, setShowModal] = useState(false); // State for modal
  const [modalMessage, setModalMessage] = useState(""); // State for modal message
  const [gameWindow, setGameWindow] = useState(null); // State for tracking the game window
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();

  let localStartTime = null; // Local variable to track the start time of the game session

  // Opens the dialog with the game details
  const handleOpen = (game) => {
    setSelectedGame(game);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedGame(null);
  };

  // Opens the modal with a specific message
  const openModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Opens the game in a new window and tracks the time played
  const handlePlayClick = (game) => {
    const openedWindow = window.open(game.gameUrl, "_blank"); // Open the game in a new window
    setGameWindow(openedWindow);
    localStartTime = Date.now(); // Set the start time for the game session

    // Monitor the closing of the game window every second
    const interval = setInterval(() => {
      if (openedWindow.closed) {
        clearInterval(interval); // Stop the interval when the window is closed
        setSelectedGame(game);
        handleGameEnd(); // Calculate the playtime
      }
    }, 1000);
  };

  const handleGameEnd = async () => {
    const endTime = Date.now();

    if (localStartTime) {
      const timePlayed = ((endTime - localStartTime) / 1000).toFixed(2);

      // Check if selectedGame is valid
      if (selectedGame) {
        const gameData = {
          game: selectedGame.title, // Use the title from selectedGame
          userId: userInfo.id,
          timePlayed: parseFloat(timePlayed),
          gameEndTime: new Date().toISOString()
        };

        let endpoint = `${process.env.REACT_APP_API_BASE_URL}/Game/PlayedGame`;

        try {
          const response = await axios.post(endpoint, gameData);
          if (response.data.success) {
            openModal(
              `Hai guadagnato ${response.data.total_points_today} punti su 100 massimi giornalieri`
            );
          } else {
            openModal(
              `Errore nel salvataggio del tempo di gioco: ${response.data.message}`
            );
          }
        } catch (error) {
          if (error.response) {
            openModal(`Errore: ${error.response.data.message}`);
          } else if (error.request) {
            openModal("Errore: Nessuna risposta dal server.");
          } else {
            openModal(`Errore: ${error.message}`);
          }
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

  // Use useEffect to call fetchUser when the component mounts
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
                  onClick={() => handlePlayClick(game)} // Start the game
                >
                  Play
                </Button>
                <Button
                  color="secondary"
                  style={{ marginTop: 10 }}
                  onClick={() => handleOpen(game)} // Open details
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

      {/* Modal for displaying messages */}
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
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.3)"
          }}
        >
          <Typography variant="h5" component="h2" textAlign="center">
            {modalMessage}
          </Typography>
          <Button
            onClick={() => setShowModal(false)}
            variant="contained"
            color="primary"
            sx={{ marginTop: 2, color: "white" }} // Impostazione del colore del testo a bianco
          >
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default GameCatalog;
