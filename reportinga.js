document.addEventListener('DOMContentLoaded', () => {
    const reportingTableBody = document.querySelector('#reporting-data tbody');
    const yearSelect = document.getElementById('year');
    const popup = document.getElementById('popup'); // Sélection de la pop-up
    const popupTableBody = document.querySelector('#popup-table tbody'); // Corps du tableau dans la pop-up
    const closePopupButton = document.getElementById('close-popup'); // Bouton de fermeture de la pop-up

    // Récupérer les ventes
    let ventes = JSON.parse(localStorage.getItem('ventes')) || [];

    // Filtrer et afficher les ventes par année
    const afficherVentes = (year) => {
        reportingTableBody.innerHTML = ''; // Réinitialiser le tableau
        let totalPrixAchatAnnuel = 0;
        let totalPrixVenteAnnuel = 0;
        let totalMargeAnnuel = 0;

        // Dictionnaire pour stocker les totaux mensuels
        const monthlyTotals = Array(12).fill().map(() => ({
            totalPrixAchat: 0,
            totalPrixVente: 0,
            totalMarge: 0,
            count: 0
        }));

        ventes.forEach(vente => {
            const venteDate = new Date(vente.dateVente);
            const venteYear = venteDate.getFullYear();
            const venteMonth = venteDate.getMonth(); // Mois de 0 à 11

            if (venteYear === year && vente.paiementRecu === 'oui') {
                const marge = vente.prixVente - vente.prixAchat;

                // Accumuler les totaux mensuels
                monthlyTotals[venteMonth].totalPrixAchat += vente.prixAchat;
                monthlyTotals[venteMonth].totalPrixVente += vente.prixVente;
                monthlyTotals[venteMonth].totalMarge += marge;
                monthlyTotals[venteMonth].count++;

                // Accumuler les totaux annuels
                totalPrixAchatAnnuel += vente.prixAchat;
                totalPrixVenteAnnuel += vente.prixVente;
                totalMargeAnnuel += marge;
            }
        });

        // Afficher les totaux mensuels
        monthlyTotals.forEach((totals, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><button class="month-btn" data-month="${index}">${new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(0, index))}</button></td>
                <td>${totals.totalPrixAchat.toFixed(2)} €</td>
                <td>${totals.totalPrixVente.toFixed(2)} €</td>
                <td>${totals.totalMarge.toFixed(2)} €</td>
                <td>${totals.count ? ((totals.totalMarge / totals.totalPrixVente) * 100).toFixed(2) + ' %' : '0 %'}</td>
            `;
            reportingTableBody.appendChild(tr);
        });

        // Afficher les totaux annuels
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td><strong>Total Annuel</strong></td>
            <td><strong>${totalPrixAchatAnnuel.toFixed(2)} €</strong></td>
            <td><strong>${totalPrixVenteAnnuel.toFixed(2)} €</strong></td>
            <td><strong>${totalMargeAnnuel.toFixed(2)} €</strong></td>
            <td><strong>${totalPrixVenteAnnuel ? ((totalMargeAnnuel / totalPrixVenteAnnuel) * 100).toFixed(2) + ' %' : '0 %'}</strong></td>
        `;
        reportingTableBody.appendChild(totalRow);

        // Réafficher les boutons de mois
        const monthButtons = document.querySelectorAll('.month-btn');
        monthButtons.forEach(button => {
            button.addEventListener('click', () => {
                const selectedMonth = parseInt(button.getAttribute('data-month')); // Récupérer le mois
                afficherVentesPopup(year, selectedMonth); // Afficher les données dans la pop-up
            });
        });
    };

    // Fonction pour afficher les ventes dans la pop-up
    const afficherVentesPopup = (year, month) => {
        popupTableBody.innerHTML = ''; // Réinitialiser le tableau de la pop-up
        let totalPrixAchat = 0;
        let totalPrixVente = 0;
        let totalMarge = 0;
        let count = 0;

        ventes.forEach(vente => {
            const venteDate = new Date(vente.dateVente);
            const venteYear = venteDate.getFullYear();
            const venteMonth = venteDate.getMonth();

            if (venteYear === year && venteMonth === month && vente.paiementRecu === 'oui') {
                const tr = document.createElement('tr');
                const marge = vente.prixVente - vente.prixAchat;

                tr.innerHTML = `
                    <td>${vente.numeroStock}</td>
                    <td>${vente.modele}</td>
                    <td>${vente.reference}</td>
                    <td>${vente.acheteur}</td>
                    <td>${vente.prixAchat} €</td>
                    <td>${vente.prixVente} €</td>
                    <td>${marge.toFixed(2)} €</td>
                    <td>${(marge / vente.prixVente * 100).toFixed(2)} %</td>
                `;
                popupTableBody.appendChild(tr);

                totalPrixAchat += vente.prixAchat;
                totalPrixVente += vente.prixVente;
                totalMarge += marge;
                count++;
            }
        });

        // Afficher les totaux dans la pop-up
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td colspan="4"><strong>Total</strong></td>
            <td><strong>${totalPrixAchat.toFixed(2)} €</strong></td>
            <td><strong>${totalPrixVente.toFixed(2)} €</strong></td>
            <td><strong>${totalMarge.toFixed(2)} €</strong></td>
            <td><strong>${count ? (totalMarge / totalPrixVente * 100).toFixed(2) + ' %' : '0 %'}</strong></td>
        `;
        popupTableBody.appendChild(totalRow);

        popup.style.display = 'block'; // Afficher la pop-up
    };

    // Événement pour fermer la pop-up
    closePopupButton.addEventListener('click', () => {
        popup.style.display = 'none'; // Masquer la pop-up
    });

    // Événement pour l'année
    yearSelect.addEventListener('change', () => {
        const selectedYear = parseInt(yearSelect.value);
        afficherVentes(selectedYear);
    });

    // Initialiser l'affichage pour l'année sélectionnée par défaut
    afficherVentes(parseInt(yearSelect.value));

    // Fonction pour enregistrer en PDF
    const saveAsPDF = () => {
        const { jsPDF } = window.jspdf; // Utilisez cette ligne pour accéder à jsPDF
        const doc = new jsPDF('landscape');

        html2canvas(document.querySelector('.reporting-table')).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 297; // A4 width in mm for landscape
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            doc.save('reporting.pdf');
        });
    };

    // Événement pour le bouton d'enregistrement
    document.getElementById('save-pdf').addEventListener('click', saveAsPDF);
});
