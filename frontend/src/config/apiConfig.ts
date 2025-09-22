// Read from window.configs if it exists (Choreo deployment)
// Otherwise fall back to local backend URL
const apiUrl = window?.configs?.apiUrl
  ? window.configs.apiUrl
  : "http://localhost:5000"; // local backend

export default apiUrl;
