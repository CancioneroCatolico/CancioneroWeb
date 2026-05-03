import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Portada } from './components/Portada'
import { DetalleCancion } from './components/DetalleCancion'
import { MisListas } from './components/MisListas'
import { BusquedaProvider } from './context/BusquedaContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BusquedaProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Portada />} />
              {/* Ruta deprecada: redirect automático */}
              <Route path="buscar" element={<Navigate to="/" replace />} />
              <Route path="cancion/:id" element={<DetalleCancion />} />
              <Route path="mis-listas" element={<MisListas />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BusquedaProvider>
    </ThemeProvider>
  )
}

export default App