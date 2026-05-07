const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize tables
const initDb = async () => {
    try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS channel_configs (
            channel_id TEXT PRIMARY KEY,
            guild_id TEXT NOT NULL,
            enabled INTEGER DEFAULT 1,
            media_emojis TEXT,
            text_emojis TEXT,
            link_emojis TEXT,
            role_id TEXT,
            order_matter INTEGER DEFAULT 1
          )
        `);
        console.log('PostgreSQL Database initialized successfully.');
    } catch (e) {
        console.error('Database initialization error: ', e);
    }
};

const getChannelConfig = async (channelId) => {
    try {
        const res = await pool.query('SELECT * FROM channel_configs WHERE channel_id = $1', [channelId]);
        return res.rows[0];
    } catch (e) {
        console.error('Error fetching channel config:', e);
        return null;
    }
};

const getAllConfigs = async (guildId) => {
    try {
        if (guildId) {
            const res = await pool.query('SELECT * FROM channel_configs WHERE guild_id = $1', [guildId]);
            return res.rows;
        }
        const res = await pool.query('SELECT * FROM channel_configs');
        return res.rows;
    } catch (e) {
        console.error('Error fetching all configs:', e);
        return [];
    }
};

const updateChannelConfig = async (config) => {
  const { channel_id, guild_id, enabled, media_emojis, text_emojis, link_emojis, role_id, order_matter } = config;
  
  const query = {
    text: `
        INSERT INTO channel_configs (channel_id, guild_id, enabled, media_emojis, text_emojis, link_emojis, role_id, order_matter)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT(channel_id) DO UPDATE SET
        enabled = EXCLUDED.enabled,
        media_emojis = EXCLUDED.media_emojis,
        text_emojis = EXCLUDED.text_emojis,
        link_emojis = EXCLUDED.link_emojis,
        role_id = EXCLUDED.role_id,
        order_matter = EXCLUDED.order_matter
    `,
    values: [channel_id, guild_id, (enabled ? 1 : 0), media_emojis, text_emojis, link_emojis, role_id, (order_matter ? 1 : 0)]
  };
  
  try {
      return await pool.query(query);
  } catch (e) {
      console.error('Error updating channel config:', e);
      throw e;
  }
};

const toggleChannel = async (channelId, enabled) => {
    try {
        return await pool.query('UPDATE channel_configs SET enabled = $1 WHERE channel_id = $2', [enabled ? 1 : 0, channelId]);
    } catch (e) {
        console.error('Error toggling channel:', e);
        throw e;
    }
};

// Start initialization
initDb();

module.exports = {
  getChannelConfig,
  updateChannelConfig,
  toggleChannel,
  getAllConfigs,
  pool
};
