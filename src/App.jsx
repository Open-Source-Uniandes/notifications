import './App.css'
import logo from '/logo.jpeg'
import { useState, useEffect } from 'react'
import { SectionDetails } from './SectionDetails.jsx'
import APIManager from './APIManager.js'
import NotificationManager from './NotificationManager.js';

function App() {

  // Secciones guardadas
  const [savedSections, setSavedSections] = useState(() => {
    const previouslySavedSections = JSON.parse(localStorage.getItem('notifications/v1/sections')) || [];
    return previouslySavedSections;
  });

  const createSection = (section) => { 
    if (savedSections.some(savedSection => savedSection.id === section.id)) return;
    setSavedSections([...savedSections, section])
  }

  const deleteSection = async (section) => {
    setSavedSections(savedSections.filter(savedSection => savedSection.id !== section.id))
  }

  const updateSections = (newSections) => { 
    setSavedSections(newSections);
  }

  // Manejo de notificaciones

  NotificationManager.setCallback(updateSections);

  // Manejo de searchedSections

  const [searchedSections, setSearchedSections] = useState(null);

  // Manejo de errores

  const [errors, setErrors] = useState(() => {
    window.onunhandledrejection = (event) => {
      setErrors([...errors, event.reason.message])
    }
    window.onerror = (message) => { 
      setErrors([...errors, message])
    }
    return [];
  });

  // Sincronización 

  useEffect(() => {
    localStorage.setItem('notifications/v1/sections', JSON.stringify(savedSections));
    NotificationManager.update(savedSections.map(section => section.id));
  }, [savedSections]);

  // User Interface

  return (
    <>
      <div className="logo-container">
        <a href="https://open-source-uniandes.github.io/Mi-Horario-Uniandes/" target="_blank" rel="noreferrer">
          <img src={logo} className="logo" alt="Open Source Uniandes logo" />
        </a>
        <h1>Mi Horario Uniandes</h1>
      </div>
      <p className="highlight">
        Este servicio de notificaciones es <strong>experimental</strong>. Puede no funcionar en todos los navegadores. Debes mantener la aplicación abierta en una pestaña aparte.
        <br/>
        Por favor cuéntanos tu experiencia al correo <a href="mailto:opensource@uniandes.edu.co">opensource@uniandes.edu.co</a>
      </p>

      <div className='error-container'>
        { errors.map((error, i) => <p key={`error-${i}`} className='error'>{error.message}</p>) }
      </div>

      <main>
        {
          savedSections.length == 0 ? null :
            <details className='card'>
              <summary className='card-summary'>Revisa tus notificaciones</summary>
              <p className="highlight">Elimina aquí las notificaciones que ya no necesites</p>
              <hr />
              <ul>
                {
                  savedSections.map(section => (
                    <li key={section.id}>
                      <SectionDetails sectionJSON={section} btnType="delete" callback={ deleteSection } />
                    </li>
                  ))
                }
              </ul>
            </details>
        }
        
        <details className='card'>
          <summary className='card-summary'>Agrega una nueva notificación</summary>
          <p className="highlight">Consultaremos Banner cada 5 minutos y te notificaremos cuando tus secciones guardadas tengan menos de 5 cupos disponibles.</p>
          <hr />
          <form onSubmit={
            (event) => {
              event.preventDefault()
              const query = event.target.elements.query.value.trim().toUpperCase();
              if (query === '') return;
              APIManager.searchQuery(query)
                .then(setSearchedSections)
            }
          }>
            <label htmlFor="query">NRC, Código o Nombre:</label>
            <input type="text" id="query" name="query" placeholder="Ej. MATE1204" />
          </form>
          <ul>
            {
              searchedSections == null ? null:
              searchedSections.length == 0 ?
                <p>No encontramos resultados para tu búsqueda</p>
                : searchedSections.map(section => (
                  <li key={section.id}>
                    <SectionDetails sectionJSON={section} btnType="create" callback={ createSection } />
                  </li>
                ))
            }
          </ul>
        </details>
      </main>
    </>
  )
}

export default App
