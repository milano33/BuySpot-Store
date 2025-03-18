from random import *
import pickle
garage = []
couleur = ["Rouge", "Bleu", "Vert", "Blanc", "Noir", "Gris"]
            
def ajouter(garage):
    print("Ajouter un véhicule")
    marque = input("Marque : ")
    modele = input("Modele : ")
    annee = float(input("Annee : "))
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
    garage.append([modele,[marque,modele,annee,kilometrage,puissance,poids,couleur,etat,prix,type,critair,coffre,hauteur,longueur,largeur]])
    return garage

def aficher(garage):
    print("Liste des véhicules")
    for elt in garage:
        print(elt[0])
        
ajouter(garage)    
ajouter(garage)
aficher(garage)
"""def enregistrer(dico):
    with open(garage.plk; "wb") as i:
        pickle.dump(garage, i)
    """