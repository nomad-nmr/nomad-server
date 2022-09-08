import axios from 'axios'

const instance = axios.create({
  // nomad-nmrium needs to use /data route which is set to handle large files
  // api is only use by nomad-frontend to avoid confusion with React Router using same routes
  baseURL: import.meta.env.VITE_APP_API_URL
})
//     import.meta.env.MODE === 'production'
//       ? import.meta.env.VITE_APP_API_URL + '/api'
//       : import.meta.env.VITE_APP_API_URL
// })

export default instance
