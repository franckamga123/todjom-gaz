class Contracts {
  static String getContract(String role) {
    switch (role) {
      case 'delivery':
        return deliveryContract;
      case 'distributor':
        return distributorContract;
      case 'supplier':
        return supplierContract;
      default:
        return '';
    }
  }

  static const String deliveryContract = """
# CONTRAT DE PARTENARIAT DE LIVRAISON TODJOM GAZ
**Version 1.0 - 2024**

## Article 1 : Objet du Partenariat
Le présent contrat définit les termes et conditions dans lesquels le Prestataire de Livraison ("Le Livreur") assure le transport et la remise des bouteilles de gaz butane depuis les points de vente certifiés jusqu'aux domiciles des clients via la plateforme TODJOM GAZ.

## Article 2 : Conditions Financières
- **Commission Livreur** : Le Livreur perçoit une rémunération fixe de 75% du montant des frais de livraison facturés (soit 1125 F sur 1500 F).
- **Frais de Service** : 25% (375 F) sont retenus par TODJOM pour la maintenance de l'infrastructure numérique et les frais de mise en relation.
- **Paiement** : Les gains sont cumulés sur le portefeuille virtuel du Livreur et peuvent être retirés chaque fin de semaine.

## Article 3 : Obligations de Sécurité et Qualité
3.1. **Sécurité Publique** : Le transport des bouteilles de gaz doit impérativement respecter les consignes de sécurité (bouteilles en position verticale, attachées, interdiction de fumer à proximité).
3.2. **Disponibilité** : Le Livreur s'engage à maintenir l'application active et sa position GPS activée durant ses heures de service déclarées.
3.3. **Vérification** : Le Livreur doit vérifier le scellé de la bouteille lors de la récupération au point de vente.

## Article 4 : Responsabilités
Le Livreur est seul responsable des infractions au code de la route et des dommages causés à des tiers lors de ses missions. Toute négligence grave entraînera la suspension immédiate du compte.
""";

  static const String distributorContract = """
# CONTRAT DE POINT DE VENTE CERTIFIÉ (PVC) TODJOM GAZ
**Protocole de Collaboration Commerciale**

## Article 1 : Agrément et Standardisation
La Boutique certifiée ("Le Partenaire") accepte d'intégrer le réseau TODJOM GAZ pour la distribution de bouteilles de gaz butane. Elle s'engage à utiliser l'outil numérique pour la gestion de ses transactions.

## Article 2 : Respect de la Réglementation des Prix
Le Partenaire s'engage formellement à respecter les prix de vente officiels fixés par les autorités (ex: 3750 F pour 12.5kg). **Toute pratique de surfacturation ("prix noir") constitue une clause de résiliation immédiate de cet agrément sans préavis.**

## Article 3 : Gestion Obligatoire des Stocks
Pour la fiabilité du service, le Partenaire doit mettre à jour son stock sur l'application dès réception de nouvelles livraisons ou lors de ventes directes hors application.

## Article 4 : Audit et Sécurité du Stockage
Le lieu de vente doit être conforme aux normes de sécurité en vigueur au Niger (extincteur fonctionnel, aération optimale, stockage hors zones inflammables). TODJOM se réserve le droit d'effectuer des visites surprises de conformité.
""";

  static const String supplierContract = """
# CONTRAT CADRE FOURNISSEUR / IMPORTATEUR TODJOM GAZ
**Accord Digital de Distribution**

## Article 1 : Digitalisation du Réseau
Le Fournisseur charge TODJOM GAZ de la digitalisation de son réseau de distribution, permettant un suivi granulaire des stocks et des volumes de vente par point de vente (PVC).

## Article 2 : Qualité et Traçabilité
Le Fournisseur garantit que toutes les bouteilles injectées dans le système sont conformes, scellées et n'ont subi aucune altération de poids.

## Article 3 : Flux Financiers et Transparence
Toutes les transactions effectuées par les distributeurs affiliés au fournisseur sont visibles sur le portail fournisseur dédié. Les commissions de service TODJOM sont calculées sur la base des transactions numériques validées.

## Article 4 : Propriété des Données
Les données stratégiques liées à la distribution restent confidentielles et ne sont exploitées que dans le but d'optimiser la chaîne logistique du Fournisseur.
""";
}
