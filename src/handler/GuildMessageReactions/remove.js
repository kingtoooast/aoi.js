const Interpreter = require("../../core/interpreter.js");
const { MessageReaction } = require("discord.js");
/**
 * @param  {MessageReaction} oldReaction
 * @param  {User} user
 * @param  {import('../../classes/AoiClient.js')} client
 */
module.exports = async (oldReaction, user, client) => {
    const cmds = client.cmd?.reactionRemove.V();
    const data = {
        message: oldReaction.message,
        channel: oldReaction.message.channel,
        client: client,
        guild: oldReaction.message.guild,
        author: user
    };
    for (const cmd of cmds) {
        let guildChannel;
        if (cmd.channel?.includes("$")) {
            const id = await Interpreter(client, data, [], { name: "ChannelParser", code: cmd.channel }, client.db, true);
            guildChannel = client.channels?.cache.get(id?.code);
        } else {
            guildChannel = client.channels.cache.get(cmd.channel);
        }
        await Interpreter(client, data, [], cmd, client.db, false, guildChannel?.id, { reactionData: oldReaction }, guildChannel);
    }
};
