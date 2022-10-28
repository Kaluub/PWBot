import { AttachmentBuilder } from "discord.js";
import StatusLogger from "../classes/statusLogger.js";

export const data = {
    id: 'channelsync',
    cronTime: '1 0 */24 * * *',
    async execute({client}) {
        StatusLogger.logStatus({type: "event-called", detail: "Channel sync event called"});
        for(const channelSyncData of client.json.channelsync) {
            const hostChannel = await client.channels.fetch(channelSyncData.master);
            if(!hostChannel) break;
            const hostChannelMessages = await hostChannel.messages.fetch();
            hostChannelMessages.sort((a, b) => a.createdAt - b.createdAt);
            for(const channelId of channelSyncData.sync) {
                const syncChannel = await client.channels.fetch(channelId);
                if(!syncChannel) break;
                const toSyncMessages = await syncChannel.messages.fetch();
                toSyncMessages.sort((a, b) => a.createdAt - b.createdAt);
                if(hostChannelMessages.size == toSyncMessages.size) {
                    let i = 0;
                    for (const [id, hostMessage] of hostChannelMessages) {
                        const syncMessage = toSyncMessages.at(i);
                        i += 1;
                        if(!hostMessage.content.length) continue;
                        await syncMessage.edit({content: hostMessage.content});
                    };
                } else {
                    for(const [id, syncMessage] of toSyncMessages) {
                        await syncMessage.delete();
                    };
                    for(const [id, hostMessage] of hostChannelMessages) {
                        let content = hostMessage.content;
                        if(!content.length) content = " "
                        let files = [];
                        if(hostMessage.attachments.size) {
                            for(const [id, attachment] of hostMessage.attachments) {
                                files.push(new AttachmentBuilder(attachment.url));
                            };
                        };
                        await syncChannel.send({content, files});
                    };
                }
            };
        };
    }
};