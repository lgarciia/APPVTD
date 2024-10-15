document.addEventListener('DOMContentLoaded', () => {
    let ventes = JSON.parse(localStorage.getItem('ventes')) || [];
    let achats = JSON.parse(localStorage.getItem('achats')) || [];
    let cmup = parseFloat(localStorage.getItem('cmup')) || 0;

    // Afficher les produits en cours de livraison dans l'indicateur
    const livraisonValue = document.getElementById('livraison-value');
    const tooltipContentLivraison = document.createElement('div');
    tooltipContentLivraison.id = 'tooltip-content-livraison';
    tooltipContentLivraison.classList.add('tooltip-content');
    livraisonValue.parentNode.appendChild(tooltipContentLivraison); // Ajoute le tooltip dans l'HTML

    const produitsEnCours = achats.filter(achat => achat.statut === 'en_cours');

    // Mettre à jour l'indicateur avec le nombre total de produits en cours de livraison
    livraisonValue.textContent = produitsEnCours.length;

// Mettre à jour le contenu du tooltip avec les noms des produits
if (produitsEnCours.length > 0) {
    tooltipContentLivraison.innerHTML = ''; // Réinitialiser le contenu à chaque survol
    produitsEnCours.forEach(produit => {
        const produitInfo = document.createElement('div');
        produitInfo.textContent = `${produit.modele} - ${produit.reference} - ${produit.taille}`; // Ajout de la référence et de la taille
        tooltipContentLivraison.appendChild(produitInfo);
    });
} else {
    tooltipContentLivraison.textContent = 'Aucun produit en cours de livraison.';
}

// Rendre le tooltip visible au survol de la valeur
livraisonValue.addEventListener('mouseenter', () => {
    tooltipContentLivraison.style.display = 'block';
});

// Garder le tooltip visible lorsque la souris est sur le tooltip
tooltipContentLivraison.addEventListener('mouseenter', () => {
    tooltipContentLivraison.style.display = 'block';
});

// Cacher le tooltip lorsque la souris quitte la valeur et le tooltip
livraisonValue.addEventListener('mouseleave', () => {
    tooltipContentLivraison.style.display = 'none';
});

tooltipContentLivraison.addEventListener('mouseleave', () => {
    tooltipContentLivraison.style.display = 'none';
});

    // Fonction pour calculer le chiffre d'affaires
    const calculerChiffreAffaires = () => {
        return ventes.reduce((total, vente) => {
            if (vente.paiementRecu === 'oui') {
                return total + vente.prixVente;
            }
            return total;
        }, 0);
    };

    // Afficher le chiffre d'affaires
    const afficherChiffreAffaires = () => {
        const caValue = document.getElementById('ca-value');
        const chiffreAffaires = calculerChiffreAffaires();
        caValue.textContent = chiffreAffaires.toFixed(2) + ' €';
    };

    // Fonction pour calculer le taux de marge moyen
    const calculerTauxMargeMoyen = () => {
        let totalMarge = 0;
        let totalPrixVente = 0;

        ventes.forEach(vente => {
            const prixAchat = vente.prixAchat; // Vous devez vous assurer que prixAchat est disponible dans votre vente
            const prixVente = vente.prixVente;

            if (vente.paiementRecu === 'oui' && prixVente > 0) { // On ne calcule que pour les ventes reçues
                const marge = prixVente - prixAchat; // Calcul de la marge
                totalMarge += marge;
                totalPrixVente += prixVente;
            }
        });

        return totalPrixVente > 0 ? (totalMarge / totalPrixVente) * 100 : 0; // Eviter la division par zéro
    };

    // Afficher le taux de marge moyen
    const afficherTauxMargeMoyen = () => {
        const margeValue = document.getElementById('marge-value');
        const tauxMarge = calculerTauxMargeMoyen();
        margeValue.textContent = tauxMarge.toFixed(2) + '%'; // Affichage du taux de marge moyen
    };

    // Fonction pour calculer l'investissement global
    const calculerInvestissementGlobal = () => {
        return achats.reduce((total, achat) => total + parseFloat(achat.prix), 0); // Somme des prix d'achat
    };

    // Afficher l'investissement global
    const afficherInvestissementGlobal = () => {
        const investissementValue = document.getElementById('investissement-value');
        const investissementGlobal = calculerInvestissementGlobal();
        investissementValue.textContent = investissementGlobal.toFixed(2) + ' €'; // Affichage de l'investissement global
    };

    // Fonction pour calculer le nombre de ventes
    const calculerNombreVentes = () => {
        return ventes.filter(vente => vente.paiementRecu === 'oui').length; // Compte le nombre de ventes avec paiement "oui"
    };

    // Afficher le nombre de ventes
    const afficherNombreVentes = () => {
        const venteValue = document.getElementById('vente-value');
        const nombreVentes = calculerNombreVentes();
        venteValue.textContent = nombreVentes; // Affichage du nombre de ventes
    };

    // Initialiser l'affichage du chiffre d'affaires, du taux de marge, de l'investissement global et du nombre de ventes
    afficherChiffreAffaires();
    afficherTauxMargeMoyen();
    afficherInvestissementGlobal();
    afficherNombreVentes();

    // Modal pour afficher les montants encaissés et à venir
    const modal = document.getElementById("montantModal");
    const span = document.getElementsByClassName("close")[0];

    const calculerMontants = () => {
        let montantEncaisse = 0;
        let montantAVenir = 0;

        ventes.forEach(vente => {
            if (vente.paiementRecu === 'oui') {
                montantEncaisse += vente.prixVente; // Montant encaissé
            } else if (vente.paiementRecu === 'non') {
                montantAVenir += vente.prixVente; // Montant à venir
            }
        });

        // Mettre à jour le contenu de la modale
        document.getElementById("montantEncaisseValue").textContent = montantEncaisse.toFixed(2) + " €";
        document.getElementById("montantAVenirValue").textContent = montantAVenir.toFixed(2) + " €";
    };

    // Afficher la modale lors du clic sur le montant
    const caValue = document.getElementById("ca-value");
    caValue.addEventListener("click", () => {
        calculerMontants(); // Calculer les montants avant d'afficher
        modal.style.display = "block"; // Afficher la modale
    });

    // Fermer la modale lorsqu'on clique sur (x)
    span.onclick = function() {
        modal.style.display = "none";
    };

    // Fermer la modale lorsqu'on clique en dehors d'elle
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Rendre le conteneur des cards déplaçable avec SortableJS
    const dashboardContent = document.getElementById('dashboard-content');
    new Sortable(dashboardContent, {
        animation: 150, // Animation pour le déplacement
        ghostClass: 'sortable-ghost', // Classe pour l'élément déplacé
        onEnd: saveOrder // Sauvegarder l'ordre chaque fois qu'une carte est déplacée
    });

    // Sauvegarder et restaurer l'ordre des cards
    function loadOrder() {
        const storedOrder = localStorage.getItem('dashboardOrder');
        if (storedOrder) {
            const cardOrder = JSON.parse(storedOrder);
            cardOrder.forEach(id => {
                const card = document.querySelector(`[data-id="${id}"]`);
                dashboardContent.appendChild(card); // Réorganise selon l'ordre sauvegardé
            });
        }
    }

    function saveOrder() {
        const cardOrder = Array.from(dashboardContent.children).map(card => card.getAttribute('data-id'));
        localStorage.setItem('dashboardOrder', JSON.stringify(cardOrder));
    }

    // Charger l'ordre au démarrage de la page
    loadOrder();

    // Graphiques

    // 1. Chiffre d'Affaires par Mois
    const chiffreAffairesCtx = document.getElementById('chiffreAffairesChart').getContext('2d');
    const chiffreAffairesParMois = Array(12).fill(0); // Initialiser les données pour chaque mois

    // Calculer le chiffre d'affaires par mois
    ventes.forEach(vente => {
        if (vente.paiementRecu === 'oui' && vente.dateVente) {
            const date = new Date(vente.dateVente);
            const month = date.getMonth(); // Obtenir le mois (0-11)
            chiffreAffairesParMois[month] += vente.prixVente; // Ajouter le chiffre d'affaires au mois correspondant
        }
    });

    // Créer le graphique avec les données calculées
    const chiffreAffairesChart = new Chart(chiffreAffairesCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Chiffre d\'affaires',
                data: chiffreAffairesParMois,
                backgroundColor: 'rgba(52, 152, 219, 0.8)', // Couleur bleue
                borderColor: 'rgba(52, 152, 219, 1)', // Bordure bleue
                borderWidth: 1.5,
                borderRadius: 5 // Coins arrondis
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#34495e', // Couleur des étiquettes
                        font: {
                            size: 14
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#34495e',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#34495e' // Couleur de la légende
                    }
                }
            }
        }
    });

    // 2. Ventes par Mois
    const ventesMoisCtx = document.getElementById('ventesProduitChart').getContext('2d');
    const ventesParMois = Array(12).fill(0);

    ventes.forEach(vente => {
        if (vente.paiementRecu === 'oui' && vente.dateVente) {
            const date = new Date(vente.dateVente);
            const month = date.getMonth(); 
            ventesParMois[month] += 1; 
        }
    });

    const ventesMoisChart = new Chart(ventesMoisCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Ventes par Mois',
                data: ventesParMois,
                borderColor: 'rgba(46, 204, 113, 1)', // Couleur de la ligne
                backgroundColor: 'rgba(46, 204, 113, 0.2)', // Couleur d'arrière-plan
                borderWidth: 2,
                fill: true, // Remplir sous la ligne
                tension: 0.3 // Courbure de la ligne
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)' // Grille très légère
                    }
                }
            }
        }
    });

    // 3. Stocks Disponibles par Mois
    const stockMoisCtx = document.getElementById('stockChart').getContext('2d');
    const stockParMois = Array(12).fill(0);

    achats.forEach(achat => {
        if (achat.date) {
            const date = new Date(achat.date);
            const month = date.getMonth(); 
            stockParMois[month] += 1; 
        }
    });

    const stockMoisChart = new Chart(stockMoisCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Stocks par Mois',
                data: stockParMois,
                backgroundColor: 'rgba(241, 196, 15, 0.8)', // Couleur jaune
                borderColor: 'rgba(241, 196, 15, 1)',
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)' // Grille très légère
                    }
                }
            }
        }
    });

    // 4. Investissement Total par Mois
    const investissementMoisCtx = document.getElementById('investissementChart').getContext('2d');
    const investissementsParMois = Array(12).fill(0);

    achats.forEach(achat => {
        if (achat.date) {
            const date = new Date(achat.date);
            const month = date.getMonth(); 
            investissementsParMois[month] += parseFloat(achat.prix);
        }
    });

    const investissementMoisChart = new Chart(investissementMoisCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Investissement par Mois',
                data: investissementsParMois,
                backgroundColor: 'rgba(231, 76, 60, 0.8)', // Couleur rouge
                borderColor: 'rgba(231, 76, 60, 1)',
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)' // Grille très légère
                    }
                }
            }
        }
    });

    // 5. Bénéfice Net par Mois
    const beneficeNetCtx = document.getElementById('beneficeNetChart').getContext('2d');
    const beneficeNetParMois = Array(12).fill(0); // Initialiser les données pour chaque mois

    // Calculer le bénéfice net par mois
    ventes.forEach(vente => {
        if (vente.paiementRecu === 'oui' && vente.dateVente) {
            const date = new Date(vente.dateVente);
            const month = date.getMonth(); // Obtenir le mois (0-11)
            const marge = vente.prixVente - vente.prixAchat; // Calculer la marge
            beneficeNetParMois[month] += marge; // Ajouter la marge au mois correspondant
        }
    });

    // Créer le graphique avec les données calculées
    const beneficeNetChart = new Chart(beneficeNetCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Bénéfice Net',
                data: beneficeNetParMois,
                backgroundColor: 'rgba(46, 204, 113, 0.6)', // Couleur avec opacité
                borderColor: '#2ecc71',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#000', // Couleur des étiquettes
                        font: {
                            size: 14 // Taille de la police
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#000',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
});
