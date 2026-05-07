const { Events } = require('discord.js');
const { getChannelConfig } = require('../../database');

// Content Type detection helper
const isUrl = (str) => {
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ 
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ 
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
    '(\\#[-a-z\\d_]*)?$','i');
    return !!urlPattern.test(str);
};

// Helper for parsing emojis
const parseEmojis = (emojiString) => {
    if (!emojiString) return null;
    return emojiString.split(/[\s,]+/).filter(e => e.trim().length > 0);
};

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        
        const config = await getChannelConfig(message.channelId);
        if (!config || !config.enabled) return;

        // Check Role
        if (config.role_id) {
            if (!message.member || !message.member.roles.cache.has(config.role_id)) {
                return;
            }
        }

        let emojiString = null;

        // Determine Content Type
        if (message.attachments.size > 0) {
            emojiString = config.media_emojis;
        } else if (message.content.split(/\s+/).some(word => isUrl(word))) {
            emojiString = config.link_emojis;
        } else {
            emojiString = config.text_emojis;
        }

        if (!emojiString) return;

        const emojis = parseEmojis(emojiString);
        if (!emojis || emojis.length === 0) return;

        // React in order or parallel
        try {
            if (config.order_matter) {
                for (const emoji of emojis) {
                    try {
                        await message.react(emoji.trim());
                    } catch (e) {
                        console.error(`Failed to react with ${emoji}: `, e.message);
                    }
                }
            } else {
                emojis.forEach(emoji => {
                    message.react(emoji.trim()).catch(e => console.error(`Failed to react with ${emoji}:`, e.message));
                });
            }
        } catch (e) {
            console.error('Error in reaction logic: ', e);
        }
    },
};
