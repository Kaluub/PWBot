import StatusLogger from "../classes/statusLogger.js";

export const data = {
    id: 'channelsync',
    cronTime: '1 0 */24 * * *',
    async execute({client}) {
        for(const channelSyncData of client.json.channelsync) {
            StatusLogger.logStatus({type: "event-called", detail: "Channel sync event called"})
            const hostChannel = await client.channels.fetch(channelSyncData.master);
            if(!hostChannel) break;
            const hostChannelMessages = await hostChannel.messages.fetch();
            hostChannelMessages.sort((a, b) => b.createdAt > a.createdAt);
            for(const channelId of channelSyncData.sync) {
                const syncChannel = await client.channels.fetch(channelId);
                if(syncChannel) break;
                const toSyncMessages = await syncChannel.messages.fetch();
                toSyncMessages.sort((a, b) => b.createdAt > a.createdAt);
                if(hostChannelMessages.size == toSyncMessages.size) {
                    let i = 0;
                    hostChannelMessages.forEach(async (id, hostMessage) => {
                        const syncMessage = toSyncMessages.keyAt(i);
                        await syncMessage.edit({content: hostMessage.content, files: hostMessage.files});
                        i += 1;
                    });
                };
            };
        };
    }
};