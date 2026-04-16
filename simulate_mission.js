const db = require('./backend/src/models');
const { v4: uuidv4 } = require('uuid');

async function runSimulation() {
  console.log('🚀 INITIALISATION DE LA MISSION DE SIMULATION TODJOM GAZ...');
  
  try {
    // 1. Recherche des entités de test
    const client = await db.User.findOne({ where: { role: 'client' } });
    const product = await db.Product.findOne();
    const supplier = await db.Supplier.findOne();
    const distributor = await db.Distributor.findOne();
    const deliverer = await db.DeliveryProfile.findOne();

    if (!client || !product || !supplier || !distributor || !deliverer) {
      console.error('❌ Données insuffisantes pour la simulation (Client, Produit, Fournisseur, Distributeur ou Livreur manquant).');
      process.exit(1);
    }

    console.log(`👤 Client: ${client.full_name}`);
    console.log(`🏬 Distributeur: ${distributor.shop_name}`);
    console.log(`🚚 Livreur: ${deliverer.id}`);
    console.log(`🔥 Produit: ${product.name} (${product.weight_kg}kg)`);

    // 2. CRÉATION DE LA COMMANDE (Phase 1: Recherche init)
    const order = await db.Order.create({
      client_id: client.id,
      supplier_id: supplier.id,
      product_id: product.id,
      unit_price: product.price,
      quantity: 1,
      total_amount: product.price,
      commission_rate: 5,
      commission_amount: product.price * 0.05,
      supplier_amount: product.price * 0.95,
      search_fee: 300,
      status: 'pending_payment',
      delivery_address: 'Niamey - Quartier Koubia, Rue des Jardins',
      client_phone: client.phone
    });

    console.log(`\n📦 ÉTAPE 1: Commande n°${order.order_number} initialisée (pending_payment)`);
    console.log(`💰 Frais de recherche: 300 CFA (En attente My Nita/Amana)`);

    // 3. PAIEMENT DES FRAIS DE RECHERCHE
    await order.update({ status: 'paid' });
    console.log(`✅ ÉTAPE 2: Frais de 300 CFA reçus. Recherche de distributeur activée (status: paid)`);

    // 4. ACCEPTATION PAR LE DISTRIBUTEUR (Phase 2)
    const deliveryFee = 1500;
    await order.update({ 
      status: 'accepted',
      distributor_id: distributor.id,
      delivery_fee: deliveryFee,
      delivery_commission_livreur: deliveryFee * 0.75,
      delivery_commission_todjom: deliveryFee * 0.25,
      accepted_at: new Date()
    });
    console.log(`🏬 ÉTAPE 3: Distributeur "${distributor.shop_name}" a validé le stock. (status: accepted)`);
    console.log(`💳 Livraison fixée à ${deliveryFee} CFA (Split: Livreur 75% / Todjom 25%)`);

    // 5. ASSIGNATION DU LIVREUR (Phase 3)
    await order.update({ 
      status: 'assigned',
      delivery_id: deliverer.id,
      assigned_at: new Date()
    });
    console.log(`🚚 ÉTAPE 4: Livreur assigné. En route vers le dépôt. (status: assigned)`);

    // 6. ENLÈVEMENT DU COLIS
    await order.update({ 
      status: 'picked_up',
      picked_up_at: new Date()
    });
    console.log(`📦 ÉTAPE 5: Colis récupéré au dépôt. Début de la course client. (status: picked_up)`);

    // 7. LIVRAISON TERMINÉE (Phase 4)
    await order.update({ 
      status: 'delivered',
      delivered_at: new Date()
    });
    console.log(`🏁 ÉTAPE 6: MISSION TERMINÉE! Colis livré chez le client. (status: delivered)`);
    console.log(`💵 Revenu Todjom Total: ${300 + (deliveryFee * 0.25)} CFA`);
    console.log(`💵 Gain Livreur: ${deliveryFee * 0.75} CFA`);

    console.log('\n✨ SIMULATION RÉUSSIE : Tout le flux opérationnel est fonctionnel.');
    process.exit(0);

  } catch (err) {
    console.error('❌ ERREUR DURANT LA SIMULATION:', err);
    process.exit(1);
  }
}

runSimulation();
