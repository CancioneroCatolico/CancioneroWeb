import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Portada } from './components/Portada'
import { DetalleCancion } from './components/DetalleCancion'
// IMPORTAMOS EL PROVIDER
import { BusquedaProvider } from './context/BusquedaContext'

function App() {
  return (
    // ENVUELVE TODO CON EL PROVIDER
    <BusquedaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Portada />} />
            <Route path="cancion/:id" element={<DetalleCancion />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </BusquedaProvider>
  )
}

export default App