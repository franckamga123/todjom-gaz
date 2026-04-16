// ============================================
// TODJOM GAZ - Service de Livraison & Proximité
// ============================================

/**
 * Calcule la distance entre deux points GPS (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

/**
 * Calcule le prix de la livraison basé sur la distance
 * Règle: 2 km = 500 CFA, 4 km = 1000 CFA (Linéaire: 250 CFA / km)
 */
const calculateDeliveryPrice = (distance) => {
    const pricePerKm = 250;
    let price = Math.round(distance * pricePerKm);
    // Prix minimum de 500 CFA
    return Math.max(500, Math.ceil(price / 100) * 100);
};

/**
 * Calcule la répartition des gains
 */
const calculateEarningsSplit = (deliveryPrice) => {
    const todjomCommissionRate = 0.35; // 35%
    const todjomCommission = Math.round(deliveryPrice * todjomCommissionRate);
    const deliveryEarning = deliveryPrice - todjomCommission;
    
    return {
        total: deliveryPrice,
        todjom: todjomCommission,
        delivery: deliveryEarning
    };
};

module.exports = {
    calculateDistance,
    calculateDeliveryPrice,
    calculateEarningsSplit
};
