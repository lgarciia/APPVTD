document.addEventListener('DOMContentLoaded', () => {
    let ventes = JSON.parse(localStorage.getItem('ventes')) || [];
    let stocks = JSON.parse(localStorage.getItem('stocks')) || [];
    let achats = JSON.parse(localStorage.getItem('achats')) || [];
    let cmup = parseFloat(localStorage.getItem('cmup')) || 0;

    const venteTableBody = document.querySelector('#historique-ventes tbody');
    const venteForm = document.getElementById('vente-form');
    const numeroStock = document.getElementById('numeroStock');
    const cmupMsg = document.getElementById('cmup-msg');
    const cmupValue = document.getElementById('cmup-value');
    const prixVenteInput = document.getElementById('prixVente');
    const beneficeValue = document.getElementById('benefice-value');
    const emballeSelect = document.getElementById('emballe');

    // Ajout des nouvelles références
    const referenceInput = document.getElementById('reference');
    const suiviInput = document.getElementById('suivi');
    const paiementInput = document.getElementById('paiement');
    const dateVenteInput = document.getElementById('dateVente');

    // Remplir la liste des articles en stock (exclure les articles déjà vendus)
    const remplirListeStocks = () => {
        numeroStock.innerHTML = ''; // Réinitialiser la liste

        stocks.forEach(stock => {
            // Inclure uniquement les articles dont le statut n'est pas "vendu"
            if (stock.statut !== 'vendu') {
                const option = document.createElement('option');
                option.value = stock.id; // ID de l'article
                option.textContent = stock.id; // Afficher l'ID de l'article
                numeroStock.appendChild(option); // Ajouter l'option à la liste
            }
        });
    };

    // Remplir les listes d'acheteurs, de modes de paiement et de transporteurs
    const remplirOptions = (selectElement, key) => {
        selectElement.innerHTML = '<option value="">Sélectionnez une option</option>'; // Réinitialiser le contenu
        const items = JSON.parse(localStorage.getItem(key)) || [];
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    };

    // Appeler la fonction pour remplir les listes
    const acheteurSelect = document.getElementById('acheteur');
    const paiementSelect = document.getElementById('paiement');
    const transporteurSelect = document.getElementById('transporteur');

    remplirOptions(acheteurSelect, 'acheteurs');
    remplirOptions(paiementSelect, 'paiements');
    remplirOptions(transporteurSelect, 'transporteurs');

    // Mettre à jour le formulaire en fonction de l'article sélectionné
    const mettreAJourFormulaire = () => {
        const articleId = parseInt(numeroStock.value);
        const article = stocks.find(stock => stock.id === articleId);
        if (article) {
            document.getElementById('nomModele').value = article.modele;
            document.getElementById('prixAchat').value = article.prix + ' €';
            document.getElementById('disponibilite').value = article.disponibilite;
            referenceInput.value = article.reference;  // Mise à jour de la référence
        }
    };

    // Écouteur d'événements pour le changement de sélection d'article
    if (numeroStock) { // Vérifiez que numeroStock existe
        numeroStock.addEventListener('change', mettreAJourFormulaire);
    }

    // Remplir la liste des stocks au chargement de la page
    remplirListeStocks();

    // Vérification du CMUP
    if (cmup > 0) {
        cmupMsg.style.display = 'block'; // Afficher le message si le CMUP est défini
        cmupValue.textContent = cmup + ' €';
    } else {
        cmupMsg.style.display = 'none'; // Cacher le message si le CMUP n'est pas défini
    }

    // Ajouter d'autres initialisations si nécessaire...
    // Par exemple : gérer l'envoi du formulaire, etc.


    // Calculer la marge et le taux de marge
    const calculerMarge = () => {
        const prixAchat = parseFloat(document.getElementById('prixAchat').value.replace(' €', ''));
        const prixVente = parseFloat(prixVenteInput.value);
        const emballageImpact = emballeSelect.value === 'oui' ? cmup : 0;
        const marge = prixVente - prixAchat - emballageImpact;
        const tauxMarge = (marge / prixVente) * 100;

        beneficeValue.textContent = marge.toFixed(2) + ' €';

        return { marge, tauxMarge };
    };

    // Afficher ou cacher le message du CMUP en fonction de l'emballage
    emballeSelect.addEventListener('change', () => {
        if (emballeSelect.value === 'oui') {
            cmupMsg.style.display = 'block';
            cmupValue.textContent = cmup.toFixed(2) + ' €';
        } else {
            cmupMsg.style.display = 'none';
        }
        calculerMarge();
    });

    // Mettre à jour le statut dans le stock et les achats
    const mettreAJourStatutStockEtAchats = (articleId) => {
        const stock = stocks.find(item => item.id === articleId);
        if (stock) {
            stock.statut = 'vendu';
            stock.disponibilite = 'non disponible';
        }

        const achat = achats.find(item => item.id === articleId);
        if (achat) {
            achat.statut = 'vendu';
        }

        localStorage.setItem('stocks', JSON.stringify(stocks));
        localStorage.setItem('achats', JSON.stringify(achats));

        // Mettre à jour la liste déroulante après modification du statut
        remplirListeStocks();
    };

    // Vérifier si tous les champs sont remplis
    const tousChampsRemplis = () => {
        return (
            numeroStock.value &&
            acheteurSelect.value &&
            prixVenteInput.value &&
            paiementInput.value &&
            transporteurSelect.value &&
            dateVenteInput.value
        );
    };

    // Ajouter la vente et mettre à jour l'historique
    const ajouterVente = () => {
        if (!tousChampsRemplis()) {
            alert('Veuillez remplir tous les champs avant d\'ajouter une vente.'); // Alerte si des champs sont vides
            return; // Ne pas continuer si des champs ne sont pas remplis
        }

        const articleId = parseInt(numeroStock.value);

        const nouvelVente = {
            id: articleId,  // Utiliser l'ID de l'article comme numéro de vente
            numeroStock: articleId,
            modele: document.getElementById('nomModele').value,
            reference: referenceInput.value,  // Enregistrer la référence
            acheteur: document.getElementById('acheteur').value,
            prixAchat: parseFloat(document.getElementById('prixAchat').value.replace(' €', '')),
            prixVente: parseFloat(prixVenteInput.value),
            paiement: paiementInput.value,       // Enregistrer le mode de paiement
            transporteur: document.getElementById('transporteur').value,
            emballe: emballeSelect.value,        // Enregistrer Emballé avec carton
            paiementRecu: document.getElementById('paiementRecu').value,
            expedie: document.getElementById('expedie').value,
            suivi: suiviInput.value,             // Enregistrer le lien de suivi
            dateVente: dateVenteInput.value,    // Enregistrer la date de vente
            ...calculerMarge()
        };

        ventes.push(nouvelVente);
        localStorage.setItem('ventes', JSON.stringify(ventes));

        // Mettre à jour le statut de l'article dans les stocks et les achats
        mettreAJourStatutStockEtAchats(articleId);

         // Remplir à nouveau la liste des stocks après la vente
    remplirListeStocks(); // <--- Ajoutez cette ligne

    afficherVentes();
    venteForm.reset();
};





// Afficher les ventes dans le tableau et indiquer les produits vendus
const afficherVentes = () => {
    venteTableBody.innerHTML = '';
    let totalPrixAchat = 0;
    let totalPrixVente = 0;
    let totalMarge = 0;

    ventes.forEach(vente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vente.id}</td>
            <td>${vente.modele}</td>
            <td>${vente.reference}</td>
            <td>${vente.prixAchat.toFixed(2)} €</td>
            <td>${vente.prixVente.toFixed(2)} €</td>
            <td>${vente.acheteur}</td>
            <td>${vente.transporteur}</td>
            <td>${vente.paiement}</td>        <!-- Mode de paiement affiché -->
            <td>${vente.suivi}</td>           <!-- Lien de suivi affiché -->
            <td>${vente.emballe}</td>         <!-- Emballé avec carton affiché -->
            <td>${vente.dateVente}</td>       <!-- Afficher la date de vente -->
            <td>
                <select class="modifier-paiement" data-id="${vente.id}" ${vente.paiementRecu === 'oui' && vente.expedie === 'oui' ? 'disabled' : ''}>
                    <option value="non" ${vente.paiementRecu === 'non' ? 'selected' : ''}>Non</option>
                    <option value="oui" ${vente.paiementRecu === 'oui' ? 'selected' : ''}>Oui</option>
                </select>
            </td>
            <td>
                <select class="modifier-expedie" data-id="${vente.id}" ${vente.paiementRecu === 'oui' && vente.expedie === 'oui' ? 'disabled' : ''}>
                    <option value="non" ${vente.expedie === 'non' ? 'selected' : ''}>Non</option>
                    <option value="oui" ${vente.expedie === 'oui' ? 'selected' : ''}>Oui</option>
                </select>
            </td>
            <td>${vente.marge.toFixed(2)} €</td>
            <td>${vente.tauxMarge.toFixed(2)} %</td>
            <td><span class="supprimer" data-id="${vente.id}">&times;</span></td>
        `;

        if (vente.paiementRecu === 'oui' && vente.expedie === 'oui') {
            tr.style.backgroundColor = '#d4efdf'; // Violet pastel
        }

        venteTableBody.appendChild(tr);

        // Accumuler les totaux
        totalPrixAchat += vente.prixAchat;
        totalPrixVente += vente.prixVente;
        totalMarge += vente.marge;
    });

    // Calculer et afficher les totaux dans le tfoot
    document.getElementById('totalPrixAchat').textContent = totalPrixAchat.toFixed(2) + ' €';
    document.getElementById('totalPrixVente').textContent = totalPrixVente.toFixed(2) + ' €';
    document.getElementById('totalMarge').textContent = totalMarge.toFixed(2) + ' €';
    const totalTauxMarge = (totalPrixVente > 0) ? (totalMarge / totalPrixVente) * 100 : 0;
    document.getElementById('totalTauxMarge').textContent = totalTauxMarge.toFixed(2) + ' %';
};
 // Gestion de la suppression d'une vente
    venteTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('supprimer')) {
            const id = parseInt(event.target.dataset.id);
            ventes = ventes.filter(vente => vente.id !== id);
            localStorage.setItem('ventes', JSON.stringify(ventes));

            // Remettre à jour le statut du produit dans le stock
            const stock = stocks.find(stock => stock.id === id);
            if (stock) {
                stock.statut = 'recu'; // Mettre à jour le statut à "recu" pour le rendre modifiable
                localStorage.setItem('stocks', JSON.stringify(stocks)); // Mettre à jour le stockage
            }

            // Mettre à jour le statut de l'achat associé
            const achat = achats.find(achat => achat.id === id);
            if (achat) {
                achat.statut = 'recu'; // Remettre le statut de l'achat à "recu"
                localStorage.setItem('achats', JSON.stringify(achats)); // Mettre à jour le stockage
            }

            afficherVentes();
            // Mettre à jour la liste des articles en stock
            remplirListeStocks();
        }
    });

    // Gestion des modifications du paiement et de l'expédition
    venteTableBody.addEventListener('change', (event) => {
        const id = parseInt(event.target.dataset.id);
        const venteModifiee = ventes.find(vente => vente.id === id);

        if (event.target.classList.contains('modifier-paiement')) {
            venteModifiee.paiementRecu = event.target.value;
        } else if (event.target.classList.contains('modifier-expedie')) {
            venteModifiee.expedie = event.target.value;
        }

        localStorage.setItem('ventes', JSON.stringify(ventes));
        afficherVentes();
    });

    // Gestion de la sélection du numéro de stock
    numeroStock.addEventListener('change', mettreAJourFormulaire);

    // Gestion du calcul de la marge à l'entrée du prix de vente
    prixVenteInput.addEventListener('input', calculerMarge);

    // Gestion du bouton d'ajout de vente
    document.getElementById('ajouter-vente').addEventListener('click', ajouterVente);

    // Initialisation
    remplirListeStocks();
    afficherVentes();
});

// Gestion du déploiement du formulaire de vente
const formToggleBtn = document.getElementById('form-toggle-btn');
const venteSection = document.getElementById('vente-section');
let formVisible = false;

formToggleBtn.addEventListener('click', () => {
    formVisible = !formVisible;

    if (formVisible) {
        venteSection.style.display = 'block';
        formToggleBtn.innerHTML = '&#9650; Masquer le formulaire';
    } else {
        venteSection.style.display = 'none';
        formToggleBtn.innerHTML = '&#9660; Afficher le formulaire';
    }
});
// Récupération des éléments
const historiqueTitle = document.getElementById('historique-ventes-title');
const popup = document.getElementById('popup');

// Afficher la pop-up au survol avec un effet de transition
historiqueTitle.addEventListener('mouseover', () => {
    popup.classList.add('show'); // Ajoute la classe pour afficher la pop-up
});

// Cacher la pop-up lorsque la souris quitte le titre
historiqueTitle.addEventListener('mouseout', () => {
    popup.classList.remove('show'); // Retire la classe pour cacher la pop-up
});
