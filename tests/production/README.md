# Tests Production

Ces fichiers permettent de tester l'API en production sur Render.
URL de base : https://backend-taxi-e2lz.onrender.com/api

## Configuration

1. Installer l'extension REST Client dans VS Code
2. Mettre à jour les variables dans chaque fichier
3. Remplacer les IDs (RESERVATION_ID, CHAUFFEUR_ID, etc.) par des valeurs réelles

## Utilisation

1. Ouvrir un fichier .rest
2. Cliquer sur "Send Request" au-dessus de chaque test
3. Vérifier la réponse dans le panneau de droite

## Fichiers

- `api.rest` : Tests basiques de l'API
- `auth.rest` : Tests d'authentification
- `payments.rest` : Tests de paiement Stripe
- `reservations.rest` : Tests des réservations
- `estimation.rest` : Tests d'estimation prix et distance

## Notes

- Les tokens d'authentification doivent être mis à jour régulièrement
- Les webhooks Stripe nécessitent une signature valide
- Certains tests nécessitent des données préexistantes en base 