import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {Auth0Provider} from '@auth0/auth0-react'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-ecmx143cjy36oshj.us.auth0.com"
      clientId="tUUTNjIGwuqbmM311tpasn33U37AvCxs"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience:"https://api-app-semana1-auth0/"}
      }
      //Config para guardar token en local storage
      cacheLocation='localstorage'
      useRefreshTokens={true}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
)
