const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getChannelConfig, updateChannelConfig } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit-reactions')
        .setDescription('Edit specific settings without resetting the whole configuration')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addRoleOption(option => option.setName('role').setDescription('Update the required role').setRequired(false))
        .addStringOption(option => option.setName('media').setDescription('Update media emojis').setRequired(false))
        .addStringOption(option => option.setName('link').setDescription('Update link emojis').setRequired(false))
        .addStringOption(option => option.setName('text').setDescription('Update text emojis').setRequired(false))
        .addBooleanOption(option => option.setName('enabled').setDescription('Enable/Disable reactions').setRequired(false))
        .addBooleanOption(option => option.setName('ordered').setDescription('Should emojis be added in order?').setRequired(false)),

    async execute(interaction) {
        const currentConfig = await getChannelConfig(interaction.channelId);
        
        if (!currentConfig) {
            return interaction.reply({ content: 'No configuration found for this channel. Please use `/setup-reactions` first.', ephemeral: true });
        }

        const updates = {
            channel_id: interaction.channelId,
            guild_id: interaction.guildId,
            role_id: interaction.options.getRole('role')?.id ?? currentConfig.role_id,
            media_emojis: interaction.options.getString('media') ?? currentConfig.media_emojis,
            link_emojis: interaction.options.getString('link') ?? currentConfig.link_emojis,
            text_emojis: interaction.options.getString('text') ?? currentConfig.text_emojis,
            enabled: interaction.options.getBoolean('enabled') !== null ? (interaction.options.getBoolean('enabled') ? 1 : 0) : currentConfig.enabled,
            order_matter: interaction.options.getBoolean('ordered') !== null ? (interaction.options.getBoolean('ordered') ? 1 : 0) : currentConfig.order_matter
        };

        await updateChannelConfig(updates);

        const embed = new EmbedBuilder()
            .setTitle('Configuration Updated')
            .setColor('#f1c40f')
            .setDescription(`Settings for <#${interaction.channelId}> have been updated.`)
            .addFields(
                { name: 'Status', value: updates.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                { name: 'Role Required', value: updates.role_id ? `<@&${updates.role_id}>` : 'None', inline: true },
                { name: 'Media', value: updates.media_emojis || 'Not set', inline: false },
                { name: 'Link', value: updates.link_emojis || 'Not set', inline: false },
                { name: 'Text', value: updates.text_emojis || 'Not set', inline: false },
                { name: 'Order Matters', value: updates.order_matter ? 'Yes' : 'No', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
