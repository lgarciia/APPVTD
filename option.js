document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les boutons d'ajout
    const ajouterLieuBtn = document.querySelector('#nouveau-lieu + .ajouter-option');
    const ajouterFournisseurBtn = document.querySelector('#nouveau-fournisseur + .ajouter-option');
    const ajouterPaiementBtn = document.querySelector('#nouveau-paiement + .ajouter-option');
    const ajouterAcheteurBtn = document.querySelector('#nouveau-acteur + .ajouter-option');
    const ajouterTransporteurBtn = document.querySelector('#nouveau-transporteur + .ajouter-option');

    // Récupérer le container pour afficher les options
    const optionsContainer = document.querySelector('.options-container');

    // Récupérer les valeurs depuis localStorage ou initialiser
    const lieux = JSON.parse(localStorage.getItem('lieux')) || [];
    const fournisseurs = JSON.parse(localStorage.getItem('fournisseurs')) || [];
    const paiements = JSON.parse(localStorage.getItem('paiements')) || [];
    const acheteurs = JSON.parse(localStorage.getItem('acheteurs')) || [];
    const transporteurs = JSON.parse(localStorage.getItem('transporteurs')) || [];

    // Fonction pour afficher les options
    const afficherOptions = () => {
        // Réinitialiser les listes
        document.getElementById('liste-lieux').innerHTML = '';
        document.getElementById('liste-fournisseurs').innerHTML = '';
        document.getElementById('liste-paiements').innerHTML = '';
        document.getElementById('liste-acteurs').innerHTML = '';
        document.getElementById('liste-transporteurs').innerHTML = '';

        // Fonction pour créer une carte d'option
        const creerCarte = (type, nom) => {
            const listItem = document.createElement('li');
            listItem.textContent = nom;

            const deleteButton = document.createElement('span');
            deleteButton.className = 'supprimer';
            deleteButton.textContent = '❌'; // Utiliser une croix rouge
            deleteButton.dataset.type = type;
            deleteButton.dataset.nom = nom;

            // Écouter le clic sur le bouton de suppression
            deleteButton.addEventListener('click', () => {
                supprimerOption(type, nom, listItem); // Passer listItem pour la suppression
            });

            listItem.appendChild(deleteButton);
            return listItem;
        };

        // Afficher les lieux
        lieux.forEach(lieu => document.getElementById('liste-lieux').appendChild(creerCarte('lieux', lieu)));
        fournisseurs.forEach(fournisseur => document.getElementById('liste-fournisseurs').appendChild(creerCarte('fournisseurs', fournisseur)));
        paiements.forEach(paiement => document.getElementById('liste-paiements').appendChild(creerCarte('paiements', paiement)));
        acheteurs.forEach(acheteur => document.getElementById('liste-acteurs').appendChild(creerCarte('acheteurs', acheteur)));
        transporteurs.forEach(transporteur => document.getElementById('liste-transporteurs').appendChild(creerCarte('transporteurs', transporteur)));
    };

    // Fonction d'ajout d'option
    const ajouterOption = (inputId, listName) => {
        const input = document.getElementById(inputId);
        const optionValue = input.value.trim();
        if (optionValue) {
            switch (listName) {
                case 'lieux':
                    lieux.push(optionValue);
                    localStorage.setItem('lieux', JSON.stringify(lieux));
                    break;
                case 'fournisseurs':
                    fournisseurs.push(optionValue);
                    localStorage.setItem('fournisseurs', JSON.stringify(fournisseurs));
                    break;
                case 'paiements':
                    paiements.push(optionValue);
                    localStorage.setItem('paiements', JSON.stringify(paiements));
                    break;
                case 'acheteurs':
                    acheteurs.push(optionValue);
                    localStorage.setItem('acheteurs', JSON.stringify(acheteurs));
                    break;
                case 'transporteurs':
                    transporteurs.push(optionValue);
                    localStorage.setItem('transporteurs', JSON.stringify(transporteurs));
                    break;
            }
            input.value = ''; // Réinitialiser le champ
            afficherOptions(); // Mettre à jour l'affichage
        }
    };

    // Fonction pour supprimer une option
    const supprimerOption = (type, nom, listItem) => {
        let updatedList;
        switch(type) {
            case 'lieux':
                updatedList = lieux.filter(lieu => lieu !== nom);
                localStorage.setItem('lieux', JSON.stringify(updatedList));
                break;
            case 'fournisseurs':
                updatedList = fournisseurs.filter(fournisseur => fournisseur !== nom);
                localStorage.setItem('fournisseurs', JSON.stringify(updatedList));
                break;
            case 'paiements':
                updatedList = paiements.filter(paiement => paiement !== nom);
                localStorage.setItem('paiements', JSON.stringify(updatedList));
                break;
            case 'acheteurs':
                updatedList = acheteurs.filter(acheteur => acheteur !== nom);
                localStorage.setItem('acheteurs', JSON.stringify(updatedList));
                break;
            case 'transporteurs':
                updatedList = transporteurs.filter(transporteur => transporteur !== nom);
                localStorage.setItem('transporteurs', JSON.stringify(updatedList));
                break;
        }
        // Retirer l'élément de la liste affichée
        listItem.remove();
    };

    // Ajouter des écouteurs d'événements
    ajouterLieuBtn.addEventListener('click', () => ajouterOption('nouveau-lieu', 'lieux'));
    ajouterFournisseurBtn.addEventListener('click', () => ajouterOption('nouveau-fournisseur', 'fournisseurs'));
    ajouterPaiementBtn.addEventListener('click', () => ajouterOption('nouveau-paiement', 'paiements'));
    ajouterAcheteurBtn.addEventListener('click', () => ajouterOption('nouveau-acteur', 'acheteurs'));
    ajouterTransporteurBtn.addEventListener('click', () => ajouterOption('nouveau-transporteur', 'transporteurs'));

    // Exportation des données existantes
    document.getElementById('export-data').addEventListener('click', () => {
        const wb = XLSX.utils.book_new();
        
        // Ajoutez ici vos données pour les achats, stocks et maintenant les nouveaux ajouts
        const achats = JSON.parse(localStorage.getItem('achats')) || [];
        const stocks = JSON.parse(localStorage.getItem('stocks')) || [];
        
        const achatsWorksheet = XLSX.utils.json_to_sheet(achats);
        XLSX.utils.book_append_sheet(wb, achatsWorksheet, 'Achats');

        const stocksWorksheet = XLSX.utils.json_to_sheet(stocks);
        XLSX.utils.book_append_sheet(wb, stocksWorksheet, 'Stocks');

        // Ajout des nouveaux choix
        const lieuxWorksheet = XLSX.utils.json_to_sheet(lieux);
        XLSX.utils.book_append_sheet(wb, lieuxWorksheet, 'Lieux');

        const fournisseursWorksheet = XLSX.utils.json_to_sheet(fournisseurs);
        XLSX.utils.book_append_sheet(wb, fournisseursWorksheet, 'Fournisseurs');

        const paiementsWorksheet = XLSX.utils.json_to_sheet(paiements);
        XLSX.utils.book_append_sheet(wb, paiementsWorksheet, 'Modes de Paiement');

        const acheteursWorksheet = XLSX.utils.json_to_sheet(acheteurs);
        XLSX.utils.book_append_sheet(wb, acheteursWorksheet, 'Acheteurs');

        const transporteursWorksheet = XLSX.utils.json_to_sheet(transporteurs);
        XLSX.utils.book_append_sheet(wb, transporteursWorksheet, 'Transporteurs');

        // Ajout de la feuille de ventes
        const ventes = JSON.parse(localStorage.getItem('ventes')) || []; // Récupérer les données de ventes
        const ventesWorksheet = XLSX.utils.json_to_sheet(ventes); // Convertir en feuille
        XLSX.utils.book_append_sheet(wb, ventesWorksheet, 'Ventes'); // Ajouter la feuille des ventes
        
        XLSX.writeFile(wb, 'données_options.xlsx');
    });

    // Afficher les options au chargement de la page
    afficherOptions();
});
