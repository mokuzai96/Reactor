const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getChannelConfig } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status-reactions')
        .setDescription('View current auto reaction settings for this channel'),

    async execute(interaction) {
        const config = await getChannelConfig(interaction.channelId);
        if (!config) {
            return interaction.reply({ content: 'No configuration found for this channel. Use `/setup-reactions` first.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Auto Reaction Status')
            .setColor(config.enabled ? '#2ecc71' : '#e74c3c')
            .setDescription(`Settings for <#${interaction.channelId}>`)
            .addFields(
                { name: 'Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                { name: 'Role Required', value: config.role_id ? `<@&${config.role_id}>` : 'None', inline: true },
                { name: 'Media', value: config.media_emojis || 'Not set', inline: false },
                { name: 'Link', value: config.link_emojis || 'Not set', inline: false },
                { name: 'Text', value: config.text_emojis || 'Not set', inline: false },
                { name: 'Order Matters', value: config.order_matter ? 'Yes' : 'No', inline: true }
            )
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    },
};
