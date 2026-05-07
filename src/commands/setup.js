const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { updateChannelConfig } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-reactions')
        .setDescription('Configure auto reactions for this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addRoleOption(option => option.setName('role').setDescription('Role that triggers the reaction (if any)').setRequired(false))
        .addStringOption(option => option.setName('media').setDescription('Emojis for media (e.g. 🔥,❤️) - space or comma separated').setRequired(false))
        .addStringOption(option => option.setName('link').setDescription('Emojis for links (e.g. 🔗,👀)').setRequired(false))
        .addStringOption(option => option.setName('text').setDescription('Emojis for text messages (e.g. 👍,✅)').setRequired(false))
        .addBooleanOption(option => option.setName('enabled').setDescription('Enable or disable auto reactions').setRequired(false))
        .addBooleanOption(option => option.setName('ordered').setDescription('Should emojis be added in the specified order?').setRequired(false)),
    
    async execute(interaction) {
        const roleId = interaction.options.getRole('role')?.id || null;
        const media = interaction.options.getString('media') || null;
        const link = interaction.options.getString('link') || null;
        const text = interaction.options.getString('text') || null;
        const enabled = interaction.options.getBoolean('enabled') ?? true;
        const ordered = interaction.options.getBoolean('ordered') ?? true;

        await updateChannelConfig({
            channel_id: interaction.channelId,
            guild_id: interaction.guildId,
            enabled: enabled ? 1 : 0,
            media_emojis: media,
            text_emojis: text,
            link_emojis: link,
            role_id: roleId,
            order_matter: ordered ? 1 : 0
        });

        const embed = new EmbedBuilder()
            .setTitle('Auto Reactions Configured')
            .setColor('#3498db')
            .setDescription(`Settings updated for <#${interaction.channelId}>`)
            .addFields(
                { name: 'Status', value: enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                { name: 'Role Required', value: roleId ? `<@&${roleId}>` : 'No specific role', inline: true },
                { name: 'Media Emojis', value: media || 'None', inline: false },
                { name: 'Link Emojis', value: link || 'None', inline: false },
                { name: 'Text Emojis', value: text || 'None', inline: false },
                { name: 'Order Matters', value: ordered ? 'Yes' : 'No', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
