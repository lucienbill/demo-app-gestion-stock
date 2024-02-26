# Gestionnaire de stock et de commande
Le logiciel **turbostock** permet de gérer un hangar :
- gestion du stock
- gestion des commandes prises par les livreur·ses

## Exigences

### S01 - Supervision niveau 1

Une personne avec le rôle **Supervision 1** doit pouvoir voir l'état des stocks de chaque référence.
Accès aux données : 
- Uniquement le stock, en lecture seule

### S02 - Supervision niveau 2

Même chose que **Supervision 1**, mais doit aussi pouvoir voir les commandes

### C01 - Commandes : commanditaire

Une personne avec le rôle **Commanditaire** doit pouvoir gérer des commandes.
Elle doit pouvoir : 
- Les créer (état de la commande : "En cours de préparation")
- Gérer le contenu des commandes (voir spec C02)
- Passer la commande à l'état "Préparée" : il n'est alors plus possible d'en modifier le contenu
- Repasser une commande de "Préparée" à "En cours de préparation"
- Annuler une commande

### C02 - Commandes : contenu
Une personne avec le rôle **Commanditaire** doit pouvoir ajouter, modifier, supprimer le contenu des commandes dont l'état "En cours de préparation".

- Quand un objet est ajouté à la commande, la quantité est transférée du stock vers la commande.
- Quand un objet est retiré de la commande, la quantité est transférée de la commande vers le stock.
- Quand une commande est annulée, les objets retournent dans le stock

### C03 - Commandes : états
Une commande peut avoir ces états : 
- En cours de préparation
- Préparée
- Annulée
- Expédiée

### C04 - Commandes : transitions d'états
Les transitions suivantes sont possibles : 
- (En cours de préparation, Préparée) ➡️ Annulée
- En cours de préparation ➡️ Préparée
- Préparée ➡️ En cours de préparation 
- Préparée ➡️ Expédiée 

### E01 - Livreur·se
Une personne ayant le rôle de **Livreur·se** peut passer une commande de l'état "Préparée" à "Expédiée".

### G01 - Gestionnaire
Une personne ayant le rôle de **Gestionnaire** peut gérer le stock :
- ajouter, désactiver ou supprimer des références
  - il n'est possible que de supprimer des références liées à aucune commande (sauf lié à des commande annulées)
- modifier le nombre d'objets en stock pour chaque référence
- lire les commandes

### R01 - Références

Une référence a un de ces états : 

- active : il est possible de passer des commandes contenant cette référence
- désactivée : il n'est pas possible de passer de commande contenant cette référence. Seul le gestionnaire peut vider le stock

### R02 - Références et stock
Chaque référence est associée son état, à un nombre d'objets en stock et à une description.
Exemple : (id de la référence, état, description, stock) =  (001, active, chaussures de plage rose taille 42, 25)