import {data as cs} from "../events/channelsync.js";

export const data = {
    name: 'forcechannelsync',
    usage: 'forcechannelsync',
    async execute({client}){
        await cs.execute({client})
        return console.log("\x1b[32m%s\x1b[0m", "Channel sync forced");
    }
};