// src/controllers/settingController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    
    // Convert array of key-value into a neat object
    const settingsMap = {};
    settings.forEach(s => {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch (e) {
        settingsMap[s.key] = s.value; // string backup
      }
    });

    // Provide fallbacks if seed wasn't executed
    const fallbackSettings = {
      working_days: settingsMap.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      working_hours: settingsMap.working_hours || { start: '09:00', end: '18:00' },
      time_interval: settingsMap.time_interval || '60',
      active_payments: settingsMap.active_payments || { cash: true, transfer: true, mercadopago: true, credit: true, debit: true },
      blocked_slots: settingsMap.blocked_slots || [{ type: 'recurring_daily', start: '12:00', end: '13:00', reason: 'Almuerzo' }],
      blocked_dates: settingsMap.blocked_dates || []
    };

    res.json(fallbackSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Error al obtener la configuración.' });
  }
};

// Update a setting
exports.updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'La clave de configuración (key) es requerida.' });
    }

    const valueString = typeof value === 'string' ? value : JSON.stringify(value);

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: valueString },
      create: { key, value: valueString }
    });

    let parsedVal = setting.value;
    try {
      parsedVal = JSON.parse(setting.value);
    } catch (_) {}

    res.json({
      key: setting.key,
      value: parsedVal
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Error al actualizar la configuración.' });
  }
};

// Update batch settings
exports.updateBatchSettings = async (req, res) => {
  try {
    const settingsObject = req.body; // e.g. { working_days: [...], time_interval: '30' }
    
    const results = {};
    for (const [key, value] of Object.entries(settingsObject)) {
      const valueString = typeof value === 'string' ? value : JSON.stringify(value);
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value: valueString },
        create: { key, value: valueString }
      });
      
      try {
        results[setting.key] = JSON.parse(setting.value);
      } catch (_) {
        results[setting.key] = setting.value;
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error updating batch settings:', error);
    res.status(500).json({ error: 'Error al actualizar las configuraciones.' });
  }
};
