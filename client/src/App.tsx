import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Layout } from './components/Layout'
import { Portada } from './components/Portada'
import { DetalleCancion } from './components/DetalleCancion'
import { MisListas } from './components/MisListas'
import { BusquedaProvider } from './context/BusquedaContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  // El hook de PWA maneja el registro y las actualizaciones
  const { updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      // Verificar actualizaciones cada 60 minutos incluso si la app está abierta
      r && setInterval(() => {
        r.update()
      }, 60 * 60 * 1000)
    }
  })

  useEffect(() => {
    // Cuando el usuario vuelve a la app, forzamos una búsqueda de actualización de código
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateServiceWorker(true)
      }
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [updateServiceWorker])

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