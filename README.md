# Tech Élevage - Dashboard de Surveillance du Stress Thermique

Application web professionnelle pour le suivi du stress thermique des vaches laitières et son impact sur la reproduction.

## 🎯 Objectif

Cette application permet de surveiller l'indice de température-humidité (THI - Temperature-Humidity Index) des vaches laitières et d'analyser son impact sur leur capacité de reproduction. Un THI supérieur à 68 est considéré comme critique et peut affecter négativement la reproduction.

## 🚀 Technologies

- **React 19** - Framework UI moderne
- **Vite** - Build tool ultra-rapide
- **TypeScript** - Typage statique
- **TailwindCSS** - Framework CSS utility-first
- **React Router** - Navigation
- **Recharts** - Visualisations de données interactives
- **date-fns** - Manipulation de dates

## 📊 Fonctionnalités

### 1. Vue d'ensemble (Overview)
- **KPIs principaux** :
  - Nombre total de vaches surveillées
  - THI moyen du troupeau
  - Nombre de vaches en stress thermique
  - Taux d'impact sur la reproduction
  - Taux de gestation
  - Moyenne de jours en stress par vache

- **Graphiques interactifs** :
  - Série temporelle de l'évolution du THI
  - Distribution des plages THI (barres groupées)
  - Répartition des niveaux de stress (graphique circulaire)
  - Statuts de reproduction du troupeau

### 2. Filtres avancés
- **Période** : 7j, 30j, 90j, ou toutes les données
- **Plage THI** : Tous, THI > 68, THI > 72
- **Niveau de stress** : Aucun, Léger, Modéré, Sévère
- **Sélection de vaches** : Filtrage par vache individuelle

### 3. Tableau détaillé
- Vue tabulaire de toutes les mesures THI
- Tri par date, vache, THI, niveau de stress
- Pagination (50 mesures par page)
- Indicateurs visuels pour les valeurs critiques
- Export possible des données filtrées

### 4. Profils vaches
- **Liste des vaches** avec carte résumé :
  - Statistiques individuelles
  - THI moyen, pourcentage de stress
  - Impact reproduction
  - Recherche par nom, ID ou race

- **Vue détaillée individuelle** :
  - Informations générales (race, âge, statut)
  - Historique des mesures THI (30 derniers jours)
  - Distribution des niveaux de stress
  - Graphiques température/humidité
  - Événements de reproduction
  - Alertes en cas de stress prolongé

## 🏗️ Architecture

```
src/
├── components/          # Composants réutilisables
│   ├── Layout.tsx      # Layout principal avec navigation
│   └── Filters.tsx     # Composant de filtrage
├── pages/              # Pages de l'application
│   ├── Overview.tsx    # Dashboard principal
│   ├── DataTable.tsx   # Table détaillée
│   ├── CowList.tsx     # Liste des vaches
│   └── CowProfile.tsx  # Profil individuel
├── data/               # Données et générateurs
│   └── mockData.ts     # Générateur de données simulées
├── types/              # Types TypeScript
│   └── index.ts        # Définitions des interfaces
├── utils/              # Utilitaires
│   └── dataContext.tsx # Context React pour la gestion des données
└── App.tsx             # Point d'entrée avec routing
```

## 📈 Calcul du THI

Le THI (Temperature-Humidity Index) est calculé avec la formule :

```
THI = T - (0.55 - 0.0055 × RH) × (T - 58)
```

Où :
- T = Température en Fahrenheit
- RH = Humidité relative en pourcentage

### Niveaux de stress :
- **THI < 68** : Aucun stress
- **68 ≤ THI < 72** : Stress léger
- **72 ≤ THI < 80** : Stress modéré
- **THI ≥ 80** : Stress sévère

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone https://github.com/SantiagoPidji/tech-elevage.git
cd tech-elevage

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build pour production

```bash
# Créer un build optimisé
npm run build

# Prévisualiser le build
npm run preview
```

## 🧪 Données de test

L'application génère automatiquement des données simulées pour 50 vaches sur 90 jours :
- Mesures THI quotidiennes avec variation saisonnière
- Événements de reproduction aléatoires
- Différents statuts de reproduction (gestante, inséminée, vide, tarie)
- Races variées (Holstein, Jersey, Montbéliarde, Normande, Simmental)

## 🎨 Personnalisation

### Modifier les seuils THI
Éditez `src/data/mockData.ts` pour ajuster la fonction `getStressLevel()`.

### Ajouter de nouvelles races
Modifiez le tableau `breeds` dans `src/data/mockData.ts`.

### Changer les couleurs
Personnalisez les couleurs dans `tailwind.config.js` ou utilisez directement les classes Tailwind.

## 📝 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Crée un build de production
- `npm run preview` - Prévisualise le build de production
- `npm run lint` - Vérifie le code avec ESLint

## 🔮 Évolutions futures possibles

- Connexion à une API backend réelle
- Export des données en CSV/Excel
- Notifications push pour alertes critiques
- Comparaison multi-vaches
- Prédictions ML pour anticiper les problèmes
- Intégration avec des capteurs IoT
- Rapports PDF générés automatiquement
- Mode hors-ligne avec synchronisation

## 📄 Licence

MIT

## 👨‍💻 Auteur

Développé pour la surveillance professionnelle du bien-être animal et l'optimisation de la reproduction bovine.
