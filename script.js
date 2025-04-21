let backupFileName = "Movie_backup.json"; // Valeur par défaut

// Boutons
const openBtn = document.getElementById("openSettingsBtn");
const settingsModal = document.getElementById("settingsModal");
const saveBtn = document.getElementById("saveSettingsBtn");
const input = document.getElementById("backupNameInput");

// Initialisation de la base Dexie
const db = new Dexie("filmseDB");
db.version(1).stores({
  films: "++id, title, type, genres, platform, priority, status, date"
});

// Ajouter un film
document.getElementById("filmForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const newFilm = {
    title: title.value.trim(),
    type: type.value,
    genres: [genres.value],
    platform: platform.value,
    priority: priority.value,
    status: statu.value,
    date: parseInt(date.value)
  };

  await db.films.add(newFilm);
  filmForm.reset();
  renderFilms();
  showNotification("élement ajouter a la liste ✅");
});

function getStatusClass(status) {
    // alert(status.toLowerCase())
    switch (status.toLowerCase()) {
      case "vue":
        return "vue";
      case "en cour":
        return "encour";
      case "a voir":
        return "avoir";
      default:
        return "arret";
    }
  }
  

// Affichage des films dans le tableau
async function renderFilms() {
  console.log("rendu");
  const films = await db.films.toArray();
  const tbody = document.querySelector("#filmTable tbody");
  tbody.innerHTML = "";

  films.forEach((film) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${film.title}</td>
      <td>${film.type}</td>
      <td>${film.genres}</td>
      <td>${film.platform}</td>
      <td>${film.priority}</td>
      <td><span class="status ${getStatusClass(film.status)}">${film.status}</span></td>
      <td>${film.date}</td>
      <td>
        <button class="edit-btn">✏️</button>
        <button class="delete-btn" onclick="deleteFilm(${film.id})">🗑️</button>
        </td>
    `;

    tbody.appendChild(tr);
    const editButton = tr.querySelector(".edit-btn");
    editButton.addEventListener("click", () => startEdit(tr, film));
  });
  await updateFilters();

}

async function updateFilters() {
    const allFilms = await db.films.toArray();
  
    const sets = {
      type: new Set(),
      platform: new Set(),
      priority: new Set(),
      status: new Set(),
      date: new Set()
    };
  
    allFilms.forEach(f => {
      sets.type.add(f.type);
      sets.platform.add(f.platform);
      sets.priority.add(f.priority);
      sets.status.add(f.status);
      sets.date.add(f.date); // à activer si tu veux gérer la date
    });
  
    updateSelect(filterType, sets.type, 'Tous types');
    updateSelect(filterPlatform, sets.platform, 'Toutes plateformes');
    updateSelect(filterPriority, sets.priority, 'Toutes priorités');
    updateSelect(filterStatus, sets.status, 'Tous statuts');
    updateSelect(filterDate, sets.date, 'Toutes dates');
  }
  
  function updateSelect(select, set, defaultText) {
    const cur = select.value;
    select.innerHTML = `<option value="">${defaultText}</option>`;
    [...set].sort().forEach(v => {
      const option = document.createElement('option');
      option.value = v;
      option.textContent = v;
      select.append(option);
    });
    select.value = cur;
  }  
  function startEdit(tr, film) {
    tr.innerHTML = '';
  
    const keys = ['title', 'type', 'genres', 'platform', 'priority', 'status', 'date'];
    const inputs = {};
  
    keys.forEach(key => {
      const td = document.createElement('td');
      const input = document.createElement('input');
  
      input.value = Array.isArray(film[key]) ? film[key].join(", ") : film[key];
      
      if (key === 'date') {
        input.type = 'number';
        input.min = 2000;
        input.max = 2100;
        inputs[key] = input;
        td.appendChild(input);
        tr.appendChild(td);
      }
      else if(key == 'title'){
        inputs[key] = input;
        td.appendChild(input);
        tr.appendChild(td);
      }
      else{
        const select = document.createElement('select');
        if(key == "type"){
          select.innerHTML = `
            <option>Film</option>
            <option>Serie</option>
            <option>Anime</option>
          `;
          select.value = Array.isArray(film[key]) ? film[key].join(", ") : film[key];
        }else if(key == "genres"){
          select.innerHTML = `
            <option>action</option>
            <option>aventures</option>
            <option>catastrophe</option>
            <option>drame</option>
            <option>cinéma </option>
            <option>fantasy</option>
            <option>horreur</option>
            <option>science-fiction</option>
            <option>thriller</option>
            <option>comédie</option>
            <option>criminel</option>
          `;
          select.value = Array.isArray(film[key]) ? film[key].join(", ") : film[key];
        }else if(key == "platform"){
          select.innerHTML = `
            <option>Netflix</option>
            <option>Amazon Prime Video</option>
            <option>Disney+</option>
            <option>Apple TV+</option>
            <option>Paramount+</option>
            <option>Canal+</option>
            <option>OCS</option>
            <option>HBO Max</option>
            <option>Arte.tv</option>
            <option>Crunchyroll</option>
            <option>Plex / Pluto TV</option>
            <option>Autres</option>
          `;
          select.value = Array.isArray(film[key]) ? film[key].join(", ") : film[key];
        }else if(key == "priority"){
          select.innerHTML = `
            <option>Basse</option>
            <option>Moyenne</option>
            <option>Haute</option>
            <option>Légende</option>
          `;
          select.value = Array.isArray(film[key]) ? film[key].join(", ") : film[key];
        }else if(key == "status"){
          select.innerHTML = `
            <option>Arret</option>
            <option>Vue</option>
            <option>En cour</option>
            <option>A voir</option>
          `;
          select.value = Array.isArray(film[key]) ? film[key].join(", ") : film[key];
        }
        inputs[key] = select;
        td.appendChild(select);
        tr.appendChild(td);
      }

    });
  
    const tdActions = document.createElement('td');
  
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾';
    saveBtn.className = 'save-btn';
  
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '❌';
    cancelBtn.className = 'cancel-btn';
  
    tdActions.appendChild(saveBtn);
    tdActions.appendChild(cancelBtn);
    tr.appendChild(tdActions);
  
    // Enregistrer
    saveBtn.addEventListener('click', () => saveEdit(tr, film));
  
    // Annuler
    cancelBtn.addEventListener('click', () => renderFilms());
  }
  
  
  async function saveEdit(tr, film) {
    const inputs = tr.querySelectorAll('input');
    const selects = tr.querySelectorAll('select');    
    const updated = {
      id: film.id,
      title: inputs[0].value,
      type: selects[1-1].value,
      genres: selects[2-1].value,
      platform: selects[3-1].value,
      priority: selects[4-1].value,
      status: selects[5-1].value,
      date: parseInt(inputs[1].value)
    };
  
    await db.films.put(updated); // ← version avec Dexie
    await renderFilms();
    showNotification("Modification sauvegarder ✅");
  }
  

// Supprimer un film
async function deleteFilm(id) {
  await db.films.delete(id);
  renderFilms();
  showNotification("Un element a été suprimer","error");
}
  
// Vider toute la liste
async function clearAllFilms() {
  if (confirm("Effacer tous les films ?")) {
    await db.films.clear();
    renderFilms();
    showNotification("Toute les données ont été éffacer","error");
  }
}

// Exporter en JSON
async function exportJSON() {
  const films = await db.films.toArray();
  const blob = new Blob([JSON.stringify(films, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = backupFileName;
  a.click();
  URL.revokeObjectURL(url);
  showNotification("Exportation reussie ✅");
}

// Importer JSON
document.getElementById("importInput").addEventListener("change", async function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  const films = JSON.parse(text);

  await db.films.clear();
  for (let film of films) {
    await db.films.add(film);
  }
  renderFilms();
  showNotification("Importation reussie ✅");
});

// Filtres
["filterType", "filterPlatform", "filterPriority", "filterStatus", "filterDate", "filterTitre"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderFilmsWithFilters);
});

async function renderFilmsWithFilters() {
  const filters = {
    type: filterType.value,
    platform: filterPlatform.value,
    priority: filterPriority.value,
    status: filterStatus.value,
    date: filterDate.value,
    titre: filterTitre.value.trim().toLowerCase()
  };

  const films = await db.films.toArray();
  const filtered = films.filter((f) => {
    return (!filters.type || f.type === filters.type) &&
           (!filters.platform || f.platform === filters.platform) &&
           (!filters.priority || f.priority === filters.priority) &&
           (!filters.status || f.status === filters.status) &&
           (!filters.date || f.date.toString() === filters.date) &&
           (!filters.titre || f.title.toLowerCase().includes(filters.titre));
  });

  const tbody = document.querySelector("#filmTable tbody");
  tbody.innerHTML = "";
  filtered.forEach((film) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${film.title}</td>
      <td>${film.type}</td>
      <td>${film.genres}</td>
      <td>${film.platform}</td>
      <td>${film.priority}</td>
      <td><span class="status ${getStatusClass(film.status)}">${film.status}</span></td>
      <td>${film.date}</td>
      <td>
        <button class="edit-btn">✏️</button>
        <button class="delete-btn" onclick="deleteFilm(${film.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
    const editButton = tr.querySelector(".edit-btn");
    editButton.addEventListener("click", () => startEdit(tr, film));
  });
}


function showNotification(message, type = 'success') {
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
  
    // Personnalisation du message et du type
    notificationMessage.textContent = message;
    notification.className = ''; // Réinitialise les classes existantes
    notification.classList.add(type); // Ajoute la classe 'success', 'error' ou 'warning'
  
    // Affichage de la notification avec animation
    notification.style.display = "block";
    notification.style.top = "20px"; // Apparaît à 20px du haut de l'écran
    notification.style.opacity = "1"; // Rendre visible
  
    // Masquer la notification après 3 secondes avec une animation
    setTimeout(() => {
      notification.style.top = "-100px"; // Cache la notification en remontant
      notification.style.opacity = "0"; // Rendre transparent
    }, 950); // Disparaît après 3 secondes
  }
  
// Ouvrir/fermer la modale
openBtn.addEventListener("click", () => {
    input.value = backupFileName;
    settingsModal.style.display = settingsModal.style.display === "none" ? "block" : "none";
    
});

// Fermer le modal si on clique en dehors
document.addEventListener("click", function (event) {
    const isClickInsideModal = settingsModal.contains(event.target);
    const isClickOnButton = openBtn.contains(event.target);
  
    if (!isClickInsideModal && !isClickOnButton) {
      settingsModal.style.display = "none";
    }
  });
  

// Sauvegarder le nouveau nom
saveBtn.addEventListener("click", () => {
    const newName = input.value.trim();
    if (newName) {
        backupFileName = newName.endsWith(".json") ? newName : `${newName}.json`;
        showNotification("Nom du fichier backup mis à jour ✅", "success");
        settingsModal.style.display = "none";
    } else {
        showNotification("Le nom ne peut pas être vide ❌", "error");
    }
});
  


// Boutons
document.getElementById("exportBtn").addEventListener("click", exportJSON);
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importInput").click();
});

// Lancement
window.onload = () => renderFilms();
