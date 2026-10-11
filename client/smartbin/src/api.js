import axios from 'axios';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://sm-fe78a1f00f944cae95802987df054d40.ecs.ap-south-1.on.aws'
).replace(/\/+$/, '');

export default API_BASE_URL;