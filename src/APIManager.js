class APIManager {

  API = "https://ofertadecursos.uniandes.edu.co/api/courses"

  searchQuery = async (query) => {
    return fetch(`${this.API}?nameInput=${query}`)
      .then(response => response.json())
      .then(data => data.map(section => {
        // Algunas secciones tienen NRC repetidos, por lo que se les agrega un sufijo
        let id = section.class + section.course + "-" + section.nrc;
        return {
          ...section,
          id,
        }
      }))
  }

  searchSection = async (id) => {
    let nrc = id.split("-")[1];
    let results = await this.searchQuery(nrc)
      .then(data => data.find(section => section.id === id));
    if (!results) window.dispatchEvent(
      new CustomEvent("customErrorMessage", { detail : `No se encontró la sección: ${id}` })
    );
    return results;
  }

}

export default new APIManager();
