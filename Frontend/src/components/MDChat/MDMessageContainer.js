import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export default styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: "1rem",
    height: "70vh",
    overflowY: "auto",
    padding: "1rem",
    "&::-webkit-scrollbar": {
        width: "6px"
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#ccc",
        borderRadius: "3px"
    }    
}));