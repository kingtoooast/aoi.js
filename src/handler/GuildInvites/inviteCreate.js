const Interpreter = require("../../core/interpreter.js");

module.exports = async (invite, client) => {
    const cmds = client.cmd?.inviteCreate.V();
    for (const cmd of cmds) {
        let guildChannel;
        const data = {
            guild: invite.guild,
            client: client,
            inviteData: invite,
            author: invite.inviter
        };
        if (cmd.channel?.includes("$")) {
            const id = await Interpreter(client, data, [], { name: "ChannelParser", code: cmd.channel }, client.db, true);
            const channel = client.channels.cache.get(id?.code);
            guildChannel = channel ?? undefined;
            data.channel = guildChannel;
        } else {
            const channel = client.channels.cache.get(cmd.channel);
            guildChannel = channel ?? undefined;
            data.channel = channel;
        }
        await Interpreter(client, data, [], cmd, client.db, false, guildChannel?.id, { newInviteData: invite }, guildChannel);
    }
};
