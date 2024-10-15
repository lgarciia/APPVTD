document.addEventListener('DOMContentLoaded', () => {
    let stocks = JSON.parse(localStorage.getItem('stocks')) || [];
    let achats = JSON.parse(localStorage.getItem('achats')) || [];

    const stockTableBody = document.querySelector('#stock-table tbody');

    // Fonction pour afficher les stocks
    const afficherStocks = () => {
        stockTableBody.innerHTML = '';
        stocks.forEach((stock) => {
            const tr = document.createElement('tr');
            let disponibilite = stock.statut === 'recu' ? 'disponible' : (stock.statut === 'en_cours' ? 'en cours' : 'indisponible');

            if (stock.statut === 'vendu') {
                disponibilite = 'non disponible'; // Mise à jour si vendu
            }

            tr.innerHTML = `
                <td>${stock.id}</td>
                <td>${stock.modele}</td>
                <td>${stock.reference}</td>
                <td>${stock.taille}</td>
                <td>${stock.lieu}</td>
                <td>${stock.prix} €</td>
                <td>${stock.fournisseur}</td>
                <td>
                    <select class="modifier-statut" data-id="${stock.id}" ${stock.statut === 'vendu' ? 'disabled' : ''}>
                        <option value="non_recu" ${stock.statut === 'non_recu' ? 'selected' : ''}>Non Reçu</option>
                        <option value="en_cours" ${stock.statut === 'en_cours' ? 'selected' : ''}>En Cours</option>
                        <option value="recu" ${stock.statut === 'recu' ? 'selected' : ''}>Reçu</option>
                        <option value="vendu" ${stock.statut === 'vendu' ? 'selected' : ''}>Vendu</option>
                    </select>
                </td>
                <td>${stock.date}</td>
                <td data-disponibilite="${disponibilite}">${disponibilite}</td>
            `;

            // Appliquer des couleurs de fond en fonction du statut et de la disponibilité
            if (stock.statut === 'recu') {
                tr.style.backgroundColor = 'rgba(248, 249, 249)'; // Vert clair pour reçu
            } else if (stock.statut === 'en_cours') {
                tr.style.backgroundColor = 'rgba(243, 156, 18, 0.2)'; // Orange clair pour en cours
            } else if (stock.statut === 'non_recu') {
                tr.style.backgroundColor = 'rgba(231, 76, 60, 0.2)'; // Rouge clair pour non reçu
            } else if (stock.statut === 'vendu') {
                tr.style.backgroundColor = 'rgba(212, 239, 223)'; // Violet clair pour vendu
            }

            stockTableBody.prepend(tr);
        });
    };

    // Fonction pour mettre à jour le statut dans les stocks et les achats
    const mettreAJourStatut = (id, nouveauStatut) => {
        // Mise à jour dans les stocks
        stocks = stocks.map(stock => {
            if (stock.id === id) {
                stock.statut = nouveauStatut;
                stock.disponibilite = nouveauStatut === 'recu' ? 'disponible' : (nouveauStatut === 'en_cours' ? 'en cours' : (nouveauStatut === 'vendu' ? 'non disponible' : 'indisponible'));
            }
            return stock;
        });
        localStorage.setItem('stocks', JSON.stringify(stocks));

        // Mise à jour dans les achats
        achats = achats.map(achat => {
            if (achat.id === id) {
                achat.statut = nouveauStatut;
            }
            return achat;
        });
        localStorage.setItem('achats', JSON.stringify(achats));

        afficherStocks(); // Rafraîchir l'affichage
    };

    // Gestion du changement de statut via la liste déroulante
    stockTableBody.addEventListener('change', (event) => {
        if (event.target.classList.contains('modifier-statut')) {
            const id = parseInt(event.target.dataset.id);
            const nouveauStatut = event.target.value;
            mettreAJourStatut(id, nouveauStatut);
        }
    });

    afficherStocks();
});
