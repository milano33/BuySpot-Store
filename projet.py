import sqlite3
from tabulate import tabulate
import networkx as nx
import matplotlib.pyplot as plt

connexion = sqlite3.connect('voiture.db')
            
def ajouter(connexion):
    print("Ajouter un véhicule")
    marque = input("Marque : ")
    modele = input("Modele : ")
    annee = int(input("Annee : "))
    kilometrage = int(input("kilometrage : "))
    puissance = int(input("Puissance : "))
    poids = int(input("Poids : "))
    couleur = input("Couleur : ")
    etat = input("Etat : ")
    prix = int(input("Prix : "))
    type = input("Type : ")
    critair = int(input("Crit'air : "))
    coffre = int(input("Coffre : "))
    hauteur = float(input("Hauteur : "))
    longueur = float(input("Longueur : "))
    largeur = float(input("Largeur : "))
    curseur = connexion.cursor()
    curseur.execute('''INSERT INTO voiture (marque, modele, annee, kilometrage, puissance, poids, couleur, etat, prix, type, critair, coffre, hauteur, longueur, largeur)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', (marque, modele, annee, kilometrage, puissance, poids, couleur, etat, prix, type, critair, coffre, hauteur, longueur, largeur))
    connexion.commit()

def supprimer():
    pass
def afficher(connexion):
    curse = connexion.cursor()
    curse.execute("SELECT * FROM voiture")
    imprimer(curse)
                
def rechercher(connexion):
    print("Rechercher par : ")
    print("1. Marque")
    print("2. Modele")
    print("3. Kilometrage")
    print("4. Puissance")
    print("5. Poids")
    print("6. Couleur")
    print("7. Etat")
    print("8. Prix")
    print("9. Type")
    print("10 Crit'air")
    print("11. Coffre")
    
    try:
        i = int(input("Choix : "))
        curse = connexion.cursor()

        if i == 1:
            marque = input("Marque : ")
            curse.execute("SELECT * FROM voiture WHERE marque = ?", (marque,))
        elif i == 2:
            modele = input("Modele : ")
            curse.execute("SELECT * FROM voiture WHERE modele = ?", (modele,))
        elif i == 3:
            kilometrage = int(input("Kilometrage : "))
            curse.execute("SELECT * FROM voiture WHERE kilometrage < ?", (kilometrage,))
        elif i == 4:
            puissance = int(input("Puissance : "))
            curse.execute("SELECT * FROM voiture WHERE puissance > ?", (puissance,))
        elif i == 5:
            poids = int(input("Poids : "))
            curse.execute("SELECT * FROM voiture WHERE poids < ?", (poids,))
        elif i == 6:
            couleur = input("Couleur : ")
            curse.execute("SELECT * FROM voiture WHERE couleur = ?", (couleur,))
        elif i == 7:
            etat = input("Etat : ")
            curse.execute("SELECT * FROM voiture WHERE etat = ?", (etat,))
        elif i == 8:
            prix = int(input("Prix : "))
            curse.execute("SELECT * FROM voiture WHERE prix < ?", (prix,))
        elif i == 9:
            type_voiture = input("Type : ")
            curse.execute("SELECT * FROM voiture WHERE type = ?", (type_voiture,))
        elif i == 10:
            critair = int(input("Crit'air : "))
            curse.execute("SELECT * FROM voiture WHERE critair < ?", (critair,))
        elif i == 11:
            coffre = int(input("Coffre : "))
            curse.execute("SELECT * FROM voiture WHERE coffre > ?", (coffre,))
        else:
            print("Choix invalide.")
            curse.close()
            return

        imprimer(curse)

    except Exception as e:
        print(f"Une erreur est survenue : {e}")

    finally:
        curse.close()

def creer_graphe(connexion):
    graphe = nx.Graph()
    curseur = connexion.cursor()
    curseur.execute("SELECT * FROM voiture")  
    for row in curseur:
        car_id = row[0]
        owner_id = row[1]
        graphe.add_node(car_id, label="car")
        graphe.add_node(owner_id, label="owner")
        graphe.add_edge(car_id, owner_id)
    curseur.close()
    
    # Dessiner le graphe
    nx.draw(graphe, with_labels=True, node_size=500, node_color='lightblue', font_size=10, font_weight='bold')
    plt.savefig("graphe.png")  # Sauvegarde du graphe sous forme d'image
    plt.close()

def critere_utilisateur():
    print("Veuillez indiquer vos critères.")
    marque = input("Marque : ")
    modele = input("Modele : ")
    annee = int(input("Annee : "))
    kilometrage = int(input("kilometrage : "))
    puissance = int(input("Puissance : "))
    poids = int(input("Poids : "))
    couleur = input("Couleur : ")
    etat = input("Etat : ")
    prix = int(input("Prix : "))
    type = input("Type : ")
    critair = int(input("Crit'air : "))
    coffre = int(input("Coffre : "))
    hauteur = float(input("Hauteur : "))
    longueur = float(input("Longueur : "))
    largeur = float(input("Largeur : "))
    pass #A COMPLETER PAR MOI PAS TOI

def imprimer(curse):
    resultats = curse.fetchall()
    if not resultats:
        print("Aucun résultat trouvé.")
    else:
        print("Résultats :")
        headers = ["Marque", "Modele", "Annee", "Kilometrage", "Puissance", "Poids", "Couleur", "Etat", "Prix", "Type", "Crit'air", "Coffre", "Hauteur", "Longueur", "Largeur"]
        print(tabulate(resultats, headers=headers, tablefmt="grid", stralign='center', numalign='center'))

while True :
    print("1. Ajouter les criteres")
    print("2. Ajouter un vehicule")
    print("3. Afficher les vehicules")
    print("4. Rechercher un vehicule")
    print("5. Quitter")
    choix = int(input("Choix : "))
    if choix == 2:
        ajouter(connexion)
    elif choix == 3:
        afficher(connexion)
    elif choix == 4:
        rechercher(connexion)
    elif choix == 5:
        break
    else:
        print("Choix invalide")

creer_graphe(connexion)

connexion.close()