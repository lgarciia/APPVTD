document.addEventListener('DOMContentLoaded', () => {
    let chargeId = parseInt(localStorage.getItem('lastChargeId')) || 1;
    let charges = JSON.parse(localStorage.getItem('charges')) || [];
    let totalCartons = parseInt(localStorage.getItem('totalCartons')) || 0;
    let totalPrixTTC = parseFloat(localStorage.getItem('totalPrixTTC')) || 0;
    let cmup = parseFloat(localStorage.getItem('cmup')) || 0;
    let ventes = JSON.parse(localStorage.getItem('ventes')) || []; // Récupération des ventes pour les cartons utilisés

    const chargeTableBody = document.querySelector('#historique-charges tbody');
    const chargeForm = document.getElementById('charge-form');
    const ajouterChargeBtn = document.getElementById('ajouter-charge');
    const prixTTCInput = document.getElementById('prixTTC');
    const nombreCartonsInput = document.getElementById('nombreCartons');
    const prixHTInput = document.getElementById('prixHT');

    // Éléments pour la mise à jour des valeurs dans la carte stock de cartons
    const cmupValue = document.getElementById('cmup-value'); 
    const totalCartonsValue = document.getElementById('total-cartons-value');
    const cartonsUtilisesValue = document.getElementById('cartons-utilises-value');
    const stockCartonsValue = document.getElementById('stock-cartons-value');

    // Calcul du stock de cartons restants et cartons utilisés
    const calculerStockCartons = () => {
        const cartonsUtilises = ventes.reduce((total, vente) => {
            return vente.emballe === 'oui' ? total + 1 : total;  // Un carton utilisé si "emballe" est "oui"
        }, 0);
        const cartonsRestants = totalCartons - cartonsUtilises;

        // Mise à jour des valeurs dans l'UI
        totalCartonsValue.textContent = totalCartons; // Total cartons achetés
        cartonsUtilisesValue.textContent = cartonsUtilises; // Total cartons utilisés
        stockCartonsValue.textContent = cartonsRestants >= 0 ? cartonsRestants : 0;  // Si négatif, afficher 0
    };

    const afficherCharges = () => {
        chargeTableBody.innerHTML = '';
        charges.forEach(charge => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${charge.id}</td>
                <td>${charge.nombreCartons}</td>
                <td>${charge.prixHT.toFixed(2)} €</td>
                <td>${charge.prixTTC.toFixed(2)} €</td>
                <td>${charge.date}</td>
                <td><span class="supprimer" data-id="${charge.id}">&times;</span></td>
            `;
            chargeTableBody.prepend(tr);  // Insère la ligne en haut du tableau
        });

        // Mettre à jour le stock de cartons après l'affichage
        calculerStockCartons();
    };

    const calculerCMUP = () => {
        // Récupérer toutes les charges et calculer le total des prix TTC et des cartons
        const totalPrixTTCCharges = charges.reduce((total, charge) => total + charge.prixTTC, 0);
        const totalCartonsCharges = charges.reduce((total, charge) => total + charge.nombreCartons, 0);

        if (totalCartonsCharges > 0) {
            cmup = totalPrixTTCCharges / totalCartonsCharges;
            localStorage.setItem('cmup', cmup.toFixed(2));  // Sauvegarde le CMUP dans le localStorage
            cmupValue.textContent = cmup.toFixed(2) + " €";  // Mise à jour du CMUP sur la page
        } else {
            cmupValue.textContent = "0.00 €";  // Si aucun carton n'est enregistré
        }
    };

    const ajouterCharge = () => {
        const nombreCartons = parseInt(nombreCartonsInput.value);
        const prixHT = parseFloat(prixHTInput.value);
        const prixTTC = prixHT * 1.2;  // Calcul du prix TTC basé sur un taux de TVA de 20%
        
        // Vérification si tous les champs sont remplis
        if (isNaN(nombreCartons) || isNaN(prixHT) || !prixTTCInput.value) {
            alert("Veuillez remplir tous les champs avant d'ajouter une charge.");
            return; // Empêche l'ajout si des champs sont vides
        }

        // Mise à jour des totaux globaux
        totalCartons += nombreCartons;
        totalPrixTTC += prixTTC;

        const nouvelleCharge = {
            id: chargeId++,
            nombreCartons: nombreCartons,
            prixHT: prixHT,
            prixTTC: prixTTC,
            date: new Date().toLocaleDateString()  // Ajoute la date actuelle
        };

        // Ajouter la charge à la liste des charges
        charges.push(nouvelleCharge);

        // Sauvegarder dans le localStorage
        localStorage.setItem('charges', JSON.stringify(charges));
        localStorage.setItem('lastChargeId', chargeId);
        localStorage.setItem('totalCartons', totalCartons);
        localStorage.setItem('totalPrixTTC', totalPrixTTC);

        // Calculer le CMUP à chaque ajout
        calculerCMUP();

        // Mettre à jour l'affichage
        afficherCharges();
        chargeForm.reset();
    };

    const supprimerCharge = (id) => {
        // Confirmation avant suppression
        if (confirm("Êtes-vous sûr de vouloir supprimer cette charge ?")) {
            const chargeASupprimer = charges.find(charge => charge.id === id);

            // Mise à jour des totaux après suppression
            totalCartons -= chargeASupprimer.nombreCartons;
            totalPrixTTC -= chargeASupprimer.prixTTC;

            // Supprimer la charge
            charges = charges.filter(charge => charge.id !== id);
            localStorage.setItem('charges', JSON.stringify(charges));
            localStorage.setItem('totalCartons', totalCartons);
            localStorage.setItem('totalPrixTTC', totalPrixTTC);

            // Recalculer le CMUP après la suppression
            calculerCMUP();

            // Mettre à jour l'affichage
            afficherCharges();
        }
    };

    // Événement sur le champ Prix HT pour calculer automatiquement le Prix TTC
    prixHTInput.addEventListener('input', () => {
        const prixHT = parseFloat(prixHTInput.value);
        if (!isNaN(prixHT)) {
            const prixTTC = prixHT * 1.2;  // Calcul du TTC avec une TVA de 20%
            prixTTCInput.value = prixTTC.toFixed(2) + " €";
        }
    });

    // Gestion du bouton "Ajouter Charge"
    ajouterChargeBtn.addEventListener('click', ajouterCharge);

    // Gestion de la suppression d'une charge
    chargeTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('supprimer')) {
            const id = parseInt(event.target.dataset.id);
            supprimerCharge(id);
        }
    });

    // Initialiser l'affichage des charges, du CMUP et du stock de cartons
    afficherCharges();
    calculerCMUP();
    calculerStockCartons();  // Appel initial pour calculer et afficher le stock de cartons
});
