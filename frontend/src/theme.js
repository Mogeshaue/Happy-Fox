import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // blue
    },
    secondary: {
      main: '#ff9800', // orange
    },
    background: {
      default: '#f4f6f8',
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#555',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 500 },
    button: { textTransform: 'none' },
  },
  shape: {
    borderRadius: 10,
  },
});

export default theme; 