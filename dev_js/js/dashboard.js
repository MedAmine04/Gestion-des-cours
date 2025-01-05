// Sélection des éléments
const addEntryBtn = document.getElementById('add-entry-btn');
const resetDataBtn = document.getElementById('reset-data-btn');
const tableBody = document.getElementById('table-body');
const tableHead = document.getElementById('table-head');
const navItems = document.querySelectorAll('.nav-item');
const searchBar = document.getElementById('search-bar');
const ITEMS_PER_PAGE = 10; // Nombre d'éléments par page
let currentPage = 1;
let filteredData = [];
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

// Fonction pour créer un formulaire d'ajout
function createAddForm(entityType, existingEntry = null) {
    const form = document.createElement('form');
    form.className = 'add-form';
    
    let fields;
    switch(entityType) {
        case 'etudiants':
            fields = {
                nom: 'Nom',
                prenom: 'Prénom',
                email: 'Email',
                classe: 'Classe'
            };
            break;
        case 'enseignants':
            fields = {
                nom: 'Nom',
                prenom: 'Prénom',
                email: 'Email',
                matiere: 'Matière'
            };
            break;
        case 'classes':
            fields = {
                nom: 'Nom de la classe',
                niveau: 'Niveau',
                capacite: 'Capacité',
                annee: 'Année scolaire'
            };
            break;
        case 'absences':
            fields = {
                etudiant: 'Nom de l\'étudiant',
                date: 'Date',
                motif: 'Motif',
                justifie: 'Justifié (Oui/Non)'
            };
            break;
        case 'cours':
            fields = {
                matiere: 'Matière',
                enseignant: 'Enseignant',
                classe: 'Classe',
                horaire: 'Horaire',
                salle: 'Salle'
            };
            break;
        default:
            return;
    }

    // Créer les champs du formulaire
    Object.entries(fields).forEach(([key, label]) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label for="${key}">${label}:</label>
            <input type="text" id="${key}" name="${key}" required>
        `;
        form.appendChild(div);
    });

    // Ajouter les boutons
    const buttons = document.createElement('div');
    buttons.innerHTML = `
        <button type="submit" class="btn">Sauvegarder</button>
        <button type="button" class="btn btn-cancel">Annuler</button>
    `;
    form.appendChild(buttons);

    // Si c'est une édition, pré-remplir les champs
    if (existingEntry) {
        Object.keys(fields).forEach(key => {
            form.querySelector(`#${key}`).value = existingEntry[key];
        });
    }

    // Modifier la gestion de la soumission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const entryData = {
            id: existingEntry ? existingEntry.id : Date.now(),
            ...Object.fromEntries(formData)
        };

        let currentData = JSON.parse(localStorage.getItem(entityType) || '[]');
        if (existingEntry) {
            // Mise à jour d'une entrée existante
            currentData = currentData.map(item => 
                item.id === existingEntry.id ? entryData : item
            );
        } else {
            // Ajout d'une nouvelle entrée
            currentData.push(entryData);
        }
        
        localStorage.setItem(entityType, JSON.stringify(currentData));
        form.remove();
        displayData(entityType);
    });

    // Gérer l'annulation
    form.querySelector('.btn-cancel').addEventListener('click', () => {
        form.remove();
    });

    // Ajouter le formulaire à la page
    document.querySelector('.content').appendChild(form);
}

// Fonction pour générer des données aléatoires
function generateFakeData(entityType) {
    const fakeEntries = [];
    for(let i = 0; i < 10; i++) {
        let entry;
        switch(entityType) {
            case 'etudiants':
                entry = {
                    id: Date.now() + i,
                    nom: faker.name.lastName(),
                    prenom: faker.name.firstName(),
                    email: faker.internet.email(),
                    classe: `Classe ${Math.floor(Math.random() * 5) + 1}`
                };
                break;
            case 'enseignants':
                entry = {
                    id: Date.now() + i,
                    nom: faker.name.lastName(),
                    prenom: faker.name.firstName(),
                    email: faker.internet.email(),
                    matiere: ['Mathématiques', 'Français', 'Histoire', 'Sciences'][Math.floor(Math.random() * 4)]
                };
                break;
            case 'classes':
                entry = {
                    id: Date.now() + i,
                    nom: `Classe ${Math.floor(Math.random() * 5) + 1}`,
                    niveau: ['Première', 'Seconde', 'Terminale'][Math.floor(Math.random() * 3)],
                    capacite: Math.floor(Math.random() * 20) + 20,
                    annee: '2023-2024'
                };
                break;
            case 'absences':
                entry = {
                    id: Date.now() + i,
                    etudiant: faker.name.findName(),
                    date: faker.date.recent().toLocaleDateString(),
                    motif: ['Maladie', 'Rendez-vous médical', 'Raison familiale'][Math.floor(Math.random() * 3)],
                    justifie: Math.random() > 0.5 ? 'Oui' : 'Non'
                };
                break;
            case 'cours':
                entry = {
                    id: Date.now() + i,
                    matiere: ['Mathématiques', 'Français', 'Histoire', 'Sciences'][Math.floor(Math.random() * 4)],
                    enseignant: faker.name.findName(),
                    classe: `Classe ${Math.floor(Math.random() * 5) + 1}`,
                    horaire: `${Math.floor(Math.random() * 5) + 8}h-${Math.floor(Math.random() * 5) + 14}h`,
                    salle: `Salle ${Math.floor(Math.random() * 10) + 101}`
                };
                break;
            default:
                continue;
        }
        fakeEntries.push(entry);
    }
    return fakeEntries;
}

// Gestionnaires d'événements pour les boutons
addEntryBtn.addEventListener('click', () => {
    const currentEntity = document.querySelector('.nav-item.active').dataset.entity;
    createAddForm(currentEntity);
});

resetDataBtn.addEventListener('click', () => {
    const currentEntity = document.querySelector('.nav-item.active').dataset.entity;
    if (confirm('Voulez-vous générer 10 nouvelles entrées aléatoires ?')) {
        const fakeData = generateFakeData(currentEntity);
        localStorage.setItem(currentEntity, JSON.stringify(fakeData));
        displayData(currentEntity);
    }
});

// Gestionnaire pour les clics sur les éléments du menu
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        const entityType = item.dataset.entity;
        
        // Mettre à jour le titre
        document.getElementById('entity-title').textContent = 
            entityType.charAt(0).toUpperCase() + entityType.slice(1);
        
        // Basculer entre la vue tableau et la vue graphiques
        const dashboardView = document.getElementById('dashboard-view');
        const tableView = document.getElementById('table-view');
        const searchContainer = document.querySelector('.search-container');
        const actionsContainer = document.querySelector('.actions');
        
        if (entityType === 'dashboard') {
            dashboardView.style.display = 'grid';
            tableView.style.display = 'none';
            searchContainer.style.display = 'none';
            actionsContainer.style.display = 'none';
        } else {
            dashboardView.style.display = 'none';
            tableView.style.display = 'block';
            searchContainer.style.display = 'block';
            actionsContainer.style.display = 'flex';
            displayData(entityType);
        }
        
        // Fermer le menu après la sélection
        sidebar.classList.remove('visible');
        content.classList.remove('sidebar-visible');
    });
});

// Fonction pour afficher les données
function displayData(entityType) {
    let data = JSON.parse(localStorage.getItem(entityType) || '[]');
    
    // Utiliser les données filtrées si une recherche est active
    if (searchBar.value.trim() !== '') {
        data = filteredData;
    }

    // Pagination
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = data.slice(start, start + ITEMS_PER_PAGE);

    // Mise à jour du tableau
    tableBody.innerHTML = '';
    if (data.length > 0) {
        // Créer l'en-tête du tableau
        tableHead.innerHTML = '';
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            tableHead.appendChild(th);
        });
        const thActions = document.createElement('th');
        thActions.textContent = 'Actions';
        tableHead.appendChild(thActions);

        // Remplir le corps du tableau
        paginatedData.forEach(item => {
            const row = document.createElement('tr');
            Object.values(item).forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });
            
            const actionsCell = document.createElement('td');
            actionsCell.innerHTML = `
                <button class="icon-btn">
                    <img src="../images/pen.jpeg" alt="Modifier" class="icon" data-id="${item.id}">
                </button>
                <button class="icon-btn">
                    <img src="../images/pppt.png" alt="Supprimer" class="icon" data-id="${item.id}">
                </button>
            `;
            row.appendChild(actionsCell);
            
            tableBody.appendChild(row);
        });

        // Ajouter les gestionnaires d'événements pour les boutons
        document.querySelectorAll('.icon-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const id = e.target.dataset.id;
                if (e.target.alt === 'Supprimer') {
                    deleteEntry(id, entityType);
                } else if (e.target.alt === 'Modifier') {
                    editEntry(id, entityType);
                }
            });
        });

        // Ajouter la pagination
        createPagination(totalPages);
    }
}

// Fonction pour supprimer une entrée
function deleteEntry(id, entityType) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
        let data = JSON.parse(localStorage.getItem(entityType) || '[]');
        data = data.filter(item => item.id != id);
        localStorage.setItem(entityType, JSON.stringify(data));
        displayData(entityType);
    }
}

// Fonction pour éditer une entrée
function editEntry(id, entityType) {
    let data = JSON.parse(localStorage.getItem(entityType) || '[]');
    const entry = data.find(item => item.id == id);
    if (entry) {
        createAddForm(entityType, entry); // Passer l'entrée existante au formulaire
    }
}

// Ajouter la fonction de recherche
searchBar.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const currentEntity = document.querySelector('.nav-item.active').dataset.entity;
    const allData = JSON.parse(localStorage.getItem(currentEntity) || '[]');
    
    filteredData = allData.filter(item => 
        Object.values(item).some(value => 
            value.toString().toLowerCase().includes(searchTerm)
        )
    );
    
    currentPage = 1;
    displayData(currentEntity);
});

// Ajouter la fonction de pagination
function createPagination(totalPages) {
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    
    // Bouton précédent
    if (totalPages > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Précédent';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                const currentEntity = document.querySelector('.nav-item.active').dataset.entity;
                displayData(currentEntity);
            }
        });
        paginationDiv.appendChild(prevButton);
    }

    // Boutons des pages
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            const currentEntity = document.querySelector('.nav-item.active').dataset.entity;
            displayData(currentEntity);
        });
        paginationDiv.appendChild(pageButton);
    }

    // Bouton suivant
    if (totalPages > 1) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Suivant';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                const currentEntity = document.querySelector('.nav-item.active').dataset.entity;
                displayData(currentEntity);
            }
        });
        paginationDiv.appendChild(nextButton);
    }

    // Ajouter la pagination après le tableau
    const tableContainer = document.querySelector('.table-container');
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    tableContainer.after(paginationDiv);
}

// Ajouter cette fonction pour initialiser les graphiques
function initializeCharts() {
    // Graphique des heures par enseignant
    new Chart(document.getElementById('teacherHours'), {
        type: 'bar',
        data: {
            labels: ['Dubois', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Richard'],
            datasets: [{
                label: 'Heures de cours',
                data: [18, 15, 20, 16, 14, 19],
                backgroundColor: '#4BC0C0',
                borderColor: '#4BC0C0',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Heures de cours par enseignant',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre d\'heures'
                    }
                }
            }
        }
    });

    // Graphique des absences par mois
    new Chart(document.getElementById('absencesTrend'), {
        type: 'bar',
        data: {
            labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
            datasets: [{
                label: 'Nombre d\'absences',
                data: [45, 39, 28, 35, 26, 30],
                backgroundColor: '#FF6384',
                borderColor: '#FF6384',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Absences par mois',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre d\'absences'
                    }
                }
            }
        }
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Gestionnaire du menu hamburger
    menuBtn.addEventListener('click', () => {
        console.log('Menu clicked'); // Pour déboguer
        sidebar.classList.toggle('visible');
        content.classList.toggle('sidebar-visible');
    });

    // Initialisation avec la vue dashboard
    document.getElementById('entity-title').textContent = 'Dashboard';
    document.getElementById('dashboard-view').style.display = 'grid';
    document.getElementById('table-view').style.display = 'none';
    document.querySelector('.search-container').style.display = 'none';
    document.querySelector('.actions').style.display = 'none';
    
    initializeCharts();
}); 
function logout() {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
      window.location.href = "login.html"; // Redirection vers la page de connexion
    }
  }
  document.getElementById("logout-btn").onclick = logout;  