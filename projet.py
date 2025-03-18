from random import *

import sqlite3

connexion = sqlite3.connect('voiture.db')
garage = []

            
def ajouter(garage, connexion):
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
    curseur = connexion.cursor()
    curseur.execute("""INSERT INTO voiture (marque, modele, annee, kilometrage, puissance, poids, couleur, etat, prix, type, critair, coffre, hauteur, longueur, largeur)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", (marque, modele, annee, kilometrage, puissance, poids, couleur, etat, prix, type, critair, coffre, hauteur, longueur, largeur))

def aficher(connexion):
    curse = connexion.cursor()
    curse.execute("SELECT * FROM voiture")
    r = curse.fetchall()
    for ligne in r:
        print(f"ID: {ligne[0]}, marque: {ligne[1]}, modele: {ligne[2]}, annee: {ligne[3]}, kilometrage: {ligne[4]}, puissance: {ligne[5]}, poids: {ligne[6]}, couleur: {ligne[7]}, etat: {ligne[8]}, prix: {ligne[9]}, type: {ligne[10]}, critair: {ligne[11]}, coffre: {ligne[12]}, hauteur: {ligne[13]}, longueur: {ligne[14]}, largeur: {ligne[15]}")

def rechercher(n, connexion):
    liste = []
    m = {}
    curseur = connexion.cursor()
    curseur.execute("SELECT * FROM voiture")
    for l in curseur:
        for i in range(len(n)):
            if i == l:
                compt += 1
                liste.append(compt)
    for i in range(len(liste)):
        m[i] = liste[i]
    return m
        

def creer_graphe(connexion):
    graphe = {}
    
    pass
        
ajouter(garage, connexion)    
aficher(connexion)

connexion.close()