const IS_PROD = false;

const server = IS_PROD 
  ? "https://bug-tracker-backend-ynti.onrender.com/api" 
  : "http://localhost:5000/api";

export default server;