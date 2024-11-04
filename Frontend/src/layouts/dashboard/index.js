import React from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { Grid } from "@mui/material";
import { FaGamepad, FaTrophy, FaStore } from "react-icons/fa";
import { motion } from "framer-motion";
import games from "assets/images/games2.jpg";
import rank from "assets/images/ranking.png";
import shop from "assets/images/shop.png";
// Definizione delle funzionalità per ogni card con immagini di esempio
const features = [
  {
    icon: <FaGamepad />,
    title: "Play for earning points!",
    description: "Playing, you have the possibility to earn points, rising in the rankings.",
    image: games, // Percorso dell'immagine di esempio per il gioco
  },
  {
    icon: <FaTrophy />,
    title: "Weekly Leaderboard!",
    description: "Check your position in relation to other players.",
    image: rank, // Percorso dell'immagine di esempio per la classifica
  },
  {
    icon: <FaStore />,
    title: "Access to the shop!",
    description: "Use credits to buy exclusive products in the shop.",
    image: shop, // Percorso dell'immagine di esempio per lo shop
  },
];

function Dashboard() {
  return (
    <DashboardLayout>
      <Grid container spacing={3} style={{ padding: "1rem" }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                padding: "1.5rem",
                textAlign: "center",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "2rem", color: "#3f51b5", marginBottom: "1rem" }}>
                {feature.icon}
              </div>
              <h3 style={{ margin: "0.5rem 0" }}>{feature.title}</h3>
              <p style={{ color: "#757575" }}>{feature.description}</p>
              {/* Immagine di esempio per ciascuna card */}
              <img
                src={feature.image}
                alt={`${feature.title} example`}
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              />
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </DashboardLayout>
  );
}

export default Dashboard;
