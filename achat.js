document.addEventListener('DOMContentLoaded', () => {
    let achatId = parseInt(localStorage.getItem('lastAchatId')) || 1;
    let achats = JSON.parse(localStorage.getItem('achats')) || [];
    let stocks = JSON.parse(localStorage.getItem('stocks')) || [];

    const achatTableBody = document.querySelector('#historique-achats tbody');
    const stockTableBody = document.querySelector('#historique-stocks tbody');
    const achatForm = document.getElementById('achat-form');
    const ajouterAchatBtn = document.getElementById('ajouter-achat');

    // Remplir les listes déroulantes pour les lieux, fournisseurs et modes de paiement
    const remplirListesDeroulantes = () => {
        const lieux = JSON.parse(localStorage.getItem('lieux')) || [];
        const fournisseurs = JSON.parse(localStorage.getItem('fournisseurs')) || [];
        const paiements = JSON.parse(localStorage.getItem('paiements')) || [];

        const lieuSelect = document.getElementById('lieu');
        const fournisseurSelect = document.getElementById('fournisseur');
        const paiementSelect = document.getElementById('paiement');

        // Remplir les lieux
        lieuSelect.innerHTML = '<option value="">Sélectionnez un lieu</option>'; // Réinitialiser les options
        lieux.forEach(lieu => {
            const option = document.createElement('option');
            option.value = lieu;
            option.textContent = lieu;
            lieuSelect.appendChild(option);
        });

        // Remplir les fournisseurs
        fournisseurSelect.innerHTML = '<option value="">Sélectionnez un fournisseur</option>'; // Réinitialiser les options
        fournisseurs.forEach(fournisseur => {
            const option = document.createElement('option');
            option.value = fournisseur;
            option.textContent = fournisseur;
            fournisseurSelect.appendChild(option);
        });

        // Remplir les modes de paiement
        paiementSelect.innerHTML = '<option value="">Sélectionnez un mode de paiement</option>'; // Réinitialiser les options
        paiements.forEach(paiement => {
            const option = document.createElement('option');
            option.value = paiement;
            option.textContent = paiement;
            paiementSelect.appendChild(option);
        });
    };
    // Appeler la fonction pour remplir les listes déroulantes
    remplirListesDeroulantes();

    // Affichage des achats avec les nouvelles colonnes
    const afficherAchats = () => {
        achatTableBody.innerHTML = '';
        achats.forEach(achat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${achat.id}</td>
                <td>${achat.modele}</td>
                <td>${achat.reference}</td>
                <td>${achat.taille}</td>
                <td>${achat.lieu}</td>
                <td>${achat.prix} €</td>
                <td>${achat.fournisseur}</td>
                <td>${achat.paiement}</td>
                <td><a href="${achat.suivi}" class="link-truncate">${achat.suivi}</a></td>
                <td>${achat.commande}</td>
                <td data-statut="${achat.statut}">${achat.statut}</td>
                <td>${achat.date}</td>
                <td><span class="supprimer" data-id="${achat.id}">&times;</span></td>
            `;
            // Marquer en violet pastel les articles vendus
            if (achat.statut === 'vendu') {
                tr.style.backgroundColor = '#d4efdf'; // Violet pastel
            }
            achatTableBody.prepend(tr);  // Insère la ligne en haut du tableau
        });
        mettreAJourTotalPrix(); // Met à jour le total des prix lors de l'affichage
    };

    // Affichage des stocks
    const afficherStocks = () => {
        stockTableBody.innerHTML = '';
        stocks.forEach(stock => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${stock.id}</td>
                <td>${stock.modele}</td>
                <td>${stock.reference}</td>
                <td>${stock.taille}</td>
                <td>${stock.lieu}</td>
                <td>${stock.prix} €</td>
                <td>${stock.fournisseur}</td>
                <td data-statut="${stock.statut}">${stock.statut}</td>
                <td data-disponibilite="${stock.disponibilite}">${stock.disponibilite}</td>
                <td>${stock.date}</td>
                <td><span class="supprimer" data-id="${stock.id}">&times;</span></td>
            `;
            // Marquer en violet pastel les articles vendus
            if (stock.statut === 'vendu') {
                tr.style.backgroundColor = '#d4efdf'; // Violet pastel
            }
            stockTableBody.prepend(tr);  // Insère la ligne en haut du tableau
        });
    };

    // Ajouter un nouvel achat
    const ajouterAchat = () => {
        const date = document.getElementById('date').value;
        const modele = document.getElementById('modele').value;
        const reference = document.getElementById('reference').value;
        const taille = document.getElementById('taille').value;
        const lieu = document.getElementById('lieu').value;
        const prix = parseFloat(document.getElementById('prix').value); // Conversion en nombre flottant
        const fournisseur = document.getElementById('fournisseur').value;
        const paiement = document.getElementById('paiement').value;  // Mode de Paiement ajouté
        const suivi = document.getElementById('suivi').value;  // Lien de Suivi ajouté
        const commande = document.getElementById('commande').value;  // N° Commande ajouté
        const statut = document.getElementById('statut').value;

        // Vérification si tous les champs sont remplis
        if (!date || !modele || !reference || !taille || !lieu || isNaN(prix) || !fournisseur || !paiement || !suivi || !commande || !statut) {
            alert("Veuillez remplir tous les champs avant d'ajouter un achat.");
            return; // Empêche l'ajout si des champs sont vides
        }

        // Déterminer la disponibilité en fonction du statut
        let disponibilite = 'indisponible';
        if (statut === 'recu') {
            disponibilite = 'disponible';
        } else if (statut === 'en_cours') {
            disponibilite = 'en_cours';
        }

        const nouvelAchat = {
            id: achatId++,
            date: date,
            modele: modele,
            reference: reference,
            taille: taille,
            lieu: lieu,
            prix: prix.toFixed(2),
            fournisseur: fournisseur,
            paiement: paiement,
            suivi: suivi,
            commande: commande,
            statut: statut,
            disponibilite: disponibilite
        };

        // Ajouter l'achat aux achats et aux stocks
        achats.push(nouvelAchat);
        stocks.push(nouvelAchat);

        // Sauvegarder les données dans le localStorage
        localStorage.setItem('achats', JSON.stringify(achats));
        localStorage.setItem('stocks', JSON.stringify(stocks));
        localStorage.setItem('lastAchatId', achatId);

        afficherAchats();
        afficherStocks();
        achatForm.reset();
    };

    // Fonction pour mettre à jour le total des prix
    function mettreAJourTotalPrix() {
        const prixCells = document.querySelectorAll('#historique-achats tbody tr td:nth-child(6)');
        let totalPrix = 0;

        prixCells.forEach(cell => {
            totalPrix += parseFloat(cell.textContent);
        });

        document.getElementById('total-prix').textContent = totalPrix.toFixed(2);
    }

    // Mettre à jour le statut "vendu"
    const mettreAJourStatutVendu = (id) => {
        const achat = achats.find(achat => achat.id === id);
        if (achat) {
            achat.statut = 'vendu';
        }

        const stock = stocks.find(stock => stock.id === id);
        if (stock) {
            stock.statut = 'vendu';
            stock.disponibilite = 'indisponible';
        }

        localStorage.setItem('achats', JSON.stringify(achats));
        localStorage.setItem('stocks', JSON.stringify(stocks));
        afficherAchats();
        afficherStocks();
    };

    // Supprimer un achat
    const supprimerAchat = (id) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet achat ?")) {
            achats = achats.filter(achat => achat.id !== id);
            stocks = stocks.filter(stock => stock.id !== id);
            localStorage.setItem('achats', JSON.stringify(achats));
            localStorage.setItem('stocks', JSON.stringify(stocks));
            afficherAchats();
            afficherStocks();
        }
    };

    // Gestion du bouton "Ajouter Achat"
    ajouterAchatBtn.addEventListener('click', ajouterAchat);

    // Gestion de la suppression d'un achat
    achatTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('supprimer')) {
            const id = parseInt(event.target.dataset.id);
            supprimerAchat(id);
        }
    });

    // Fonction pour déployer ou masquer le formulaire
    const formToggleBtn = document.getElementById('form-toggle-btn');
    const purchaseSection = document.querySelector('.purchase-section');
    let formVisible = false;  // L'état initial du formulaire est caché

    // Cacher le formulaire au chargement
    purchaseSection.style.display = 'none';

    formToggleBtn.addEventListener('click', () => {
        formVisible = !formVisible;  // Inverser l'état de visibilité

        if (formVisible) {
            purchaseSection.style.display = 'block';
            formToggleBtn.innerHTML = '&#9660; Masquer le formulaire';  // Modifier l'icône
        } else {
            purchaseSection.style.display = 'none';
            formToggleBtn.innerHTML = '&#9654; Afficher le formulaire';  // Modifier l'icône
        }
    });

    // Initialiser l'affichage des achats et des stocks
    afficherAchats();
    afficherStocks();
});
