import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

export default styled(Paper)(({ sent }) => ({
    padding: "0.8rem 1rem",
    maxWidth: "70%",
    borderRadius: sent ? "20px 20px 0 20px" : "20px 20px 20px 0",
    backgroundColor: sent ? "#1976d2" : "#f5f5f5",
    color: sent ? "#fff" : "#000",
    alignSelf: sent ? "flex-end" : "flex-start",
    position: "relative",
    animation: "fadeIn 0.3s ease-in",
    "@keyframes fadeIn": {
        from: { opacity: 0, transform: "translateY(10px)" },
        to: { opacity: 1, transform: "translateY(0)" }
    }
}))