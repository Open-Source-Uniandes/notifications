/* eslint-disable react/prop-types */
import createIcon from './assets/create.svg'
import deleteIcon from './assets/delete.svg'

function SectionDetails({ sectionJSON, btnType, callback }) {

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
    term,
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
          <p><strong>Período: </strong>{term}</p>
          <p><strong>NRC: </strong>{nrc}</p>
          <p><strong>Profesores:</strong> {instructors.join(', ')}</p>
        </section>
        <img src={btnType === "create" ? createIcon : deleteIcon} alt="Toggle Notification" onClick={() => callback(sectionJSON)} />
    </article>
  </details>
  )
}

export { SectionDetails };
