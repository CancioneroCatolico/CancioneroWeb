import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Portada } from './components/Portada'
import { Resultados } from './components/Resultados'
import { DetalleCancion } from './components/DetalleCancion'
// IMPORTAMOS EL PROVIDER
import { BusquedaProvider } from './context/BusquedaContext'

import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    // ENVUELVE TODO CON EL PROVIDER
    <ThemeProvider>
      <BusquedaProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Portada />} />
              <Route path="buscar" element={<Resultados />} />
              <Route path="cancion/:id" element={<DetalleCancion />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BusquedaProvider>
    </ThemeProvider>
  )
}

export default App