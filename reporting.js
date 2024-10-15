document.addEventListener('DOMContentLoaded', () => {
    const reportingTableBody = document.querySelector('#reporting-data tbody');
    const yearSelect = document.getElementById('year');
    const monthButtons = document.querySelectorAll('.month-btn');

    // Récupérer les ventes
    let ventes = JSON.parse(localStorage.getItem('ventes')) || [];

    // Filtrer et afficher les ventes
    const afficherVentes = (year, month) => {
        reportingTableBody.innerHTML = ''; // Réinitialiser le tableau
        let totalPrixAchat = 0;
        let totalPrixVente = 0;
        let totalMarge = 0;
        let count = 0;

        ventes.forEach(vente => {
            const venteDate = new Date(vente.dateVente);
            const venteYear = venteDate.getFullYear();
            const venteMonth = venteDate.getMonth(); // Mois de 0 à 11

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
                reportingTableBody.appendChild(tr);

                totalPrixAchat += vente.prixAchat;
                totalPrixVente += vente.prixVente;
                totalMarge += marge;
                count++;
            }
        });

        // Afficher les totaux
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td colspan="4"><strong>Total</strong></td>
            <td><strong>${totalPrixAchat.toFixed(2)} €</strong></td>
            <td><strong>${totalPrixVente.toFixed(2)} €</strong></td>
            <td><strong>${totalMarge.toFixed(2)} €</strong></td>
            <td><strong>${count ? (totalMarge / totalPrixVente * 100).toFixed(2) + ' %' : '0 %'}</strong></td>
        `;
        reportingTableBody.appendChild(totalRow);
    };

    // Événements pour les mois
    monthButtons.forEach((button, index) => {
        button.setAttribute('data-month', index); // Ajoute l'index comme valeur de mois
        button.addEventListener('click', () => {
            const selectedMonth = index; // Utilise l'index pour le mois
            const selectedYear = parseInt(yearSelect.value);
            if (selectedYear) {
                afficherVentes(selectedYear, selectedMonth);
                monthButtons.forEach(btn => btn.classList.remove('selected-month'));
                button.classList.add('selected-month'); // Mettre à jour le style du bouton sélectionné
            } else {
                alert('Veuillez sélectionner une année.');
            }
        });
    });

    // Événement pour l'année
    yearSelect.addEventListener('change', () => {
        const selectedYear = parseInt(yearSelect.value);
        const selectedMonth = Array.from(monthButtons).find(btn => btn.classList.contains('selected-month'))?.getAttribute('data-month');
        if (selectedMonth !== undefined) {
            afficherVentes(selectedYear, parseInt(selectedMonth));
        }
    });

    // Fonction pour enregistrer en PDF
    const saveAsPDF = () => {
        const doc = new jsPDF('landscape');
        const element = document.querySelector('.reporting-table');

        html2canvas(element).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 297; // A4 width in mm for landscape
            const pageHeight = 210; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            doc.save('reporting.pdf');
        });
    };

    // Événement pour le bouton d'enregistrement
    document.getElementById('save-pdf').addEventListener('click', saveAsPDF);
});
