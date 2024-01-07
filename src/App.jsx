/* eslint-disable react/prop-types */
import { useState } from 'react'
import logo from '/logo.jpeg'
import createIcon from './assets/create.svg'
import './App.css'

const API = "https://ofertadecursos.uniandes.edu.co/api/courses"

function SectionDetails({ sectionJSON }) {

  let { 
    nrc,
    class: classcode,
    course,
    section,
    credits,
    title,
    instructors,
    maxenrol,
    enrolled,
  } = sectionJSON

  // Capitalize first letter of each word
  title = title.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
  instructors = instructors.map(instructor =>
    instructor.name.trim().toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
  )

  return (
  <details>
    <summary>
      <span>
        {`${classcode}-${course} Sección ${section}: `}
      </span>
      {`${title}`}
    </summary>
      <article>
        <section>
          <h3>{ title }</h3>
          <p><strong>{`${credits} créditos - ${maxenrol - enrolled} cupos`}</strong></p>
          <p><strong>NRC: </strong>{nrc}</p>
          <p><strong>Profesores:</strong> {instructors.join(', ')}</p>
        </section>
        <img src={ createIcon } alt="Create Notification" />
    </article>
  </details>
)}

function App() {

  const [searchedSections, setSearchedSections] = useState(null);

  return (
    <>
      <div className="logo-container">
        <a href="https://open-source-uniandes.github.io/Mi-Horario-Uniandes/" target="_blank" rel="noreferrer">
          <img src={logo} className="logo" alt="Open Source Uniandes logo" />
        </a>
        <h1>Mi Horario Uniandes</h1>
      </div>
      <p className="highlight">
        Este servicio de notificaciones es <strong>experimental</strong> y nos encontramos desarrollándolo
        <br/>
        Por favor cuéntanos tu experiencia al correo <a href="mailto:opensource@uniandes.edu.co">opensource@uniandes.edu.co
          </a>
      </p>

      <main>
        <details className='card'>
          <summary className='card-summary'>Revisa tus notificaciones</summary>
        </details>
        
        <details className='card'>
          <summary className='card-summary'>Agrega una nueva notificación</summary>
          <p className="highlight">Consultaremos Banner cada 5 minutos y te notificaremos cuando tus secciones guardadas tengan menos de 5 cupos disponibles.</p>
          <hr />
          <form onSubmit={
            (event) => {
              event.preventDefault()
              const query = event.target.elements.query.value.trim().toUpperCase();
              fetch(`${API}?nameInput=${query}`)
                .then(response => response.json())
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
                  <li key={section.llave}>
                    <SectionDetails sectionJSON={section} />
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
