const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { lat, lng, media } = req.body;
    
    const alert = await Emergency.create({
      lat, lng, media_path: media
    });

    // On alerte immédiatement tous les admins
    const config = require('../config/app');
    const { sendWhatsApp } = require('../services/smsService');
    
    if (config.adminPhone) {
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const message = `🚨 *URGENCE TODJOM GAZ* 🚨\n\nUne alerte a été déclenchée !\n📍 Position : ${mapUrl}\n⏰ Heure : ${new Date().toLocaleTimeString('fr-FR')}\n\nVeuillez intervenir immédiatement sur le panel admin.`;
        await sendWhatsApp(config.adminPhone, message);
    }

    console.log(`🚨 ALERTE URGENCE REÇUE : [${lat}, ${lng}]`);

    res.status(201).json({ success: true, message: "Alerte envoyée", id: alert.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
