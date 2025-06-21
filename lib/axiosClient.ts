import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '', // relative to current domain
  timeout: 15000,
});

export default axiosClient;
