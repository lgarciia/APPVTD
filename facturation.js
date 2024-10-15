document.addEventListener('DOMContentLoaded', () => {
    let produitsFactures = [];
    let totalFacture = 0;
    let stocks = JSON.parse(localStorage.getItem('stocks')) || [];

    const numeroStockSelect = document.getElementById('numeroStock');
    const factureTableBody = document.querySelector('#table-facture tbody');
    const totalFactureElement = document.getElementById('total-facture');
    const clientInput = document.getElementById('client');

    // Remplir la liste des articles en stock
    const remplirListeStocks = () => {
        numeroStockSelect.innerHTML = '';
        stocks.forEach(stock => {
            if (stock.statut === 'recu') { // Seulement les articles disponibles
                const option = document.createElement('option');
                option.value = stock.id;
                option.textContent = `${stock.modele} - ${stock.prix} €`;
                numeroStockSelect.appendChild(option);
            }
        });
    };

    // Ajouter un produit à la facture
    const ajouterProduit = () => {
        const numeroStock = parseInt(numeroStockSelect.value);
        const quantite = parseInt(document.getElementById('quantite').value);
        const client = clientInput.value;

        if (!client) {
            alert('Veuillez entrer le nom du client.');
            return;
        }

        const produit = stocks.find(stock => stock.id === numeroStock);
        if (produit) {
            const totalLigne = produit.prix * quantite;
            produitsFactures.push({ ...produit, quantite, totalLigne });

            totalFacture += totalLigne;

            // Affichage du produit dans l'aperçu
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${produit.modele}</td>
                <td>${quantite}</td>
                <td>${produit.prix.toFixed(2)} €</td>
                <td>${totalLigne.toFixed(2)} €</td>
            `;
            factureTableBody.appendChild(tr);

            // Mettre à jour le total
            totalFactureElement.textContent = totalFacture.toFixed(2) + " €";
        }
    };

    // Télécharger la facture en PDF (implémentation simple)
    const telechargerFacture = () => {
        let contenuFacture = `
            <h1>Facture</h1>
            <p>Client : ${clientInput.value}</p>
            <table>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix Unitaire</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        produitsFactures.forEach(produit => {
            contenuFacture += `
                <tr>
                    <td>${produit.modele}</td>
                    <td>${produit.quantite}</td>
                    <td>${produit.prix.toFixed(2)} €</td>
                    <td>${produit.totalLigne.toFixed(2)} €</td>
                </tr>
            `;
        });

        contenuFacture += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3">Total Facture :</td>
                        <td>${totalFacture.toFixed(2)} €</td>
                    </tr>
                </tfoot>
            </table>
        `;

        const fenetreFacture = window.open('', '_blank');
        fenetreFacture.document.write(contenuFacture);
        fenetreFacture.document.close();
        fenetreFacture.print();
    };

    // Fonction d'envoi par email (simulé)
    const envoyerFacture = () => {
        alert(`Facture envoyée à l'adresse e-mail du client : ${clientInput.value}`);
        // Implémenter une logique réelle avec un backend pour envoyer des emails
    };

    // Initialisation
    remplirListeStocks();

    // Gestion du bouton "Ajouter au Panier"
    document.getElementById('ajouter-produit').addEventListener('click', ajouterProduit);

    // Gestion du bouton "Télécharger Facture"
    document.getElementById('telecharger-facture').addEventListener('click', telechargerFacture);

    // Gestion du bouton "Envoyer par Email"
    document.getElementById('envoyer-facture').addEventListener('click', envoyerFacture);
});
