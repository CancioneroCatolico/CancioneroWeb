import { useRegisterSW } from 'virtual:pwa-register/react'

export function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error: Error) {
            console.log('SW registration error', error)
        },
    })

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    return (
        <div className="ReloadPrompt-container">
            {(offlineReady || needRefresh)
                && <div className="ReloadPrompt-toast">
                    <div className="ReloadPrompt-message">
                        {offlineReady
                            ? <span>Esta app está lista para usarse sin conexión.</span>
                            : <span>Hay una nueva versión del cancionero disponible.</span>
                        }
                    </div>
                    <div className="ReloadPrompt-buttons">
                        {needRefresh && <button onClick={() => updateServiceWorker(true)}>Actualizar</button>}
                        <button onClick={() => close()}>Cerrar</button>
                    </div>
                </div>
            }
        </div>
    )
}
