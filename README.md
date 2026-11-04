
TP 01 - Premier Workflow

#tp #fondamentaux #module1 #niveau1

Objectifs

À la fin de ce TP, vous saurez :

Créer un dépôt GitHub et y placer un workflow
Déclencher un workflow manuellement et sur push
Lire les logs d'exécution dans l'interface GitHub
Passer une valeur d'une step à une autre avec GITHUB_OUTPUT
Enchaîner deux jobs avec needs: et des conditions
Contexte entreprise

Vous rejoignez DevCorp, une startup qui développe une API REST en Node.js. L'équipe travaille encore sans CI. Votre mission : mettre en place les premiers workflows pour valider le code à chaque push.
Exercice 1 - Hello World Workflow

1.1 Créer le dépôt

Créez un nouveau dépôt GitHub public : devcorp-api
Initialisez-le avec un README.md
Clonez-le en local
1.2 Créer le workflow

Créez le fichier .github/workflows/hello.yml :

name: Hello World

on:
push:
branches: [main]
workflow_dispatch: # Permet le lancement manuel

jobs:
greet:
runs-on: ubuntu-latest
steps:
- name: Afficher un message
run: echo "Bonjour depuis GitHub Actions !"

      - name: Informations sur le runner
        run: |
          echo "OS : ${{ runner.os }}"
          echo "Dépôt : ${{ github.repository }}"
          echo "Branche : ${{ github.ref_name }}"
          echo "Déclenché par : ${{ github.actor }}"
          echo "SHA du commit : ${{ github.sha }}"

      - name: Date et heure
        run: date
1.3 Pousser et observer

git add .github/
git commit -m "feat: add hello world workflow"
git push origin main
Actions à faire dans GitHub :

Aller dans l'onglet Actions du dépôt
Cliquer sur le workflow Hello World
Observer les logs de chaque step
Relancer manuellement via le bouton Run workflow
Questions
Où voit-on le nom de chaque step dans l'interface ?
Quel est le SHA affiché ? Correspond-il à votre commit ? -->SHA du commit : e564895d5b10edeb86736257c0628aa99bd94655
Combien de temps a pris l'exécution ?
Exercice 2 - Workflow avec conditions et outputs

2.1 Application Node.js simple

Créez une application minimaliste :

package.json

{
"name": "devcorp-api",
"version": "1.0.0",
"scripts": {
"test": "node test.js",
"lint": "echo 'Lint OK (simulé)'"
}
}
app.js

function add(a, b) {
return a + b;
}

function greet(name) {
return `Hello, ${name}!`;
}

module.exports = { add, greet };
test.js

const { add, greet } = require("./app");

let passed = 0;
let failed = 0;

function assert(condition, message) {
if (condition) {
console.log(`✓ ${message}`);
passed++;
} else {
console.error(`✗ ${message}`);
failed++;
}
}

assert(add(2, 3) === 5, "add(2, 3) doit retourner 5");
assert(add(-1, 1) === 0, "add(-1, 1) doit retourner 0");
assert(
greet("World") === "Hello, World!",
"greet doit retourner la bonne chaîne",
);

console.log(`\nRésultats: ${passed} passés, ${failed} échoués`);
if (failed > 0) process.exit(1);
2.2 Workflow CI avec conditions

Créez .github/workflows/ci.yml :

name: CI

on:
push:
branches: [main, "feature/**"]
pull_request:
branches: [main]

jobs:
validate:
name: Validation du code
runs-on: ubuntu-latest

    steps:
      - name: Checkout du code
        uses: actions/checkout@v4

      - name: Lire la version du package
        id: package-version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "version=$VERSION" >> $GITHUB_OUTPUT

      - name: Lint
        run: npm run lint

      - name: Tests
        run: npm test

      - name: Résumé
        run: |
          echo "## Résultats CI" >> $GITHUB_STEP_SUMMARY
          echo "Lint et tests réussis pour la version **${{ steps.package-version.outputs.version }}**" >> $GITHUB_STEP_SUMMARY

notify:
name: Notification
runs-on: ubuntu-latest
needs: validate
if: always() # Toujours exécuter, même si validate a échoué

    steps:
      - name: Succès
        if: needs.validate.result == 'success'
        run: echo "Tous les checks sont passés !"

      - name: Échec
        if: needs.validate.result == 'failure'
        run: |
          echo "Le pipeline a échoué"
          exit 1
Pas de npm install ?
Le projet n'a aucune dépendance : Node.js et npm sont déjà installés sur le runner, npm test fonctionne directement. Au module 2, le projet aura des dépendances et il faudra les installer.

La commande node -p "require('./package.json').version" lit le champ version du fichier package.json. La ligne suivante l'enregistre sous le nom version, que la step Résumé relit avec steps.package-version.outputs.version.

2.3 Pousser et tester

git add .
git commit -m "feat: add node app and CI workflow"
git push origin main
Vérifications :

Observez l'ordre des jobs : notify attend la fin de validate
Ouvrez la page du run : le résumé affiche-t-il la version 1.0.0 ?
Cassez un test (par exemple add(2, 3) === 6), poussez : quel job devient rouge ? notify s'exécute-t-il ?
Réparez le test et poussez à nouveau
Exercice 3 - Déclencher sur une Pull Request

3.1 Créer une branche feature

git checkout -b feature/add-multiply
Modifiez app.js pour ajouter une fonction :

function multiply(a, b) {
return a * b;
}

module.exports = { add, greet, multiply };
Modifiez test.js pour tester la nouvelle fonction :

const { add, greet, multiply } = require("./app");
// ... (garder les tests existants)
assert(multiply(3, 4) === 12, "multiply(3, 4) doit retourner 12");
assert(multiply(0, 5) === 0, "multiply(0, 5) doit retourner 0");
3.2 Créer la PR

git add .
git commit -m "feat: add multiply function"
git push origin feature/add-multiply
Sur GitHub, créez une Pull Request vers main
Observez que le workflow CI se déclenche automatiquement
Le statut apparaît directement dans la PR (check vert/rouge)
Fusionnez la PR quand le check est vert
3.3 Modifier le workflow pour la PR

Dans le job validate, après la step Tests, ajoutez une step qui ne s'exécute que dans une PR :

- name: Commentaire PR (uniquement en PR)
  if: github.event_name == 'pull_request'
  run: |
  echo "Ce message s'affiche uniquement dans les PR"
  echo "PR #${{ github.event.pull_request.number }}"
  echo "Auteur : ${{ github.event.pull_request.user.login }}"
  Poussez sur la branche feature/add-multiply : le workflow se relance dans la PR et la nouvelle step s'affiche. Sur un push direct sur main, elle apparaît comme sautée.

Exercice 4 - Workflow planifié et manuel

Créez .github/workflows/nightly.yml :

name: Nightly Check

on:
schedule:
- cron: "0 1 * * *" # Chaque nuit à 1h UTC
workflow_dispatch:
inputs:
target-env:
description: "Environnement cible"
type: choice
options: [development, staging, production]
default: staging

jobs:
nightly-tests:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4

      - name: Afficher la configuration
        run: |
          echo "Déclenchement : ${{ github.event_name }}"
          echo "Environnement : ${{ inputs.target-env || 'aucun (lancement programmé)' }}"

      - name: Tests
        run: npm test

      - name: Rapport final
        run: |
          echo "## Nightly Check du $(date '+%Y-%m-%d')" >> $GITHUB_STEP_SUMMARY
          echo "Déclenché par : **${{ github.event_name }}**" >> $GITHUB_STEP_SUMMARY
Lors d'un lancement programmé, aucun input n'est saisi : inputs.target-env est vide, et || affiche alors le texte de remplacement.

Planification
Un workflow schedule ne s'exécute que depuis la branche par défaut (main), et GitHub peut le retarder de quelques minutes aux heures chargées.

Test du déclenchement manuel :

Aller dans Actions → Nightly Check
Cliquer Run workflow
Choisir un environnement et retrouver la valeur dans les logs
Bilan du TP

Ce que vous avez mis en place

devcorp-api/
├── .github/
│   └── workflows/
│       ├── hello.yml        # Workflow de découverte
│       ├── ci.yml           # CI avec conditions et GITHUB_OUTPUT
│       └── nightly.yml      # Workflow planifié avec inputs manuels
├── app.js
├── test.js
└── package.json
Checklist de validation

Le workflow hello.yml s'exécute sur push et manuellement
Le workflow ci.yml affiche un résumé contenant la version du package
Le job notify s'exécute après validate grâce à needs:, même en cas d'échec
La PR déclenche le workflow CI et affiche le statut
Le workflow nightly accepte des inputs manuels
Suite : 03 - Cours - Pipeline de build et tests

Share Note
for Obsidian
🌓