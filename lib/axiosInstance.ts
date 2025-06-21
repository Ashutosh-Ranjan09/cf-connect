import axios from 'axios';

const axiosInstance = axios.create({
  timeout: 15000,
});

export default axiosInstance;
