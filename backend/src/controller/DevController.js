const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray')
const { findConnections, sendMessage } = require('../websocket')

module.exports = {
    async index(request, response) {
        let devs = await Dev.find();
        return response.json(devs);
    },
    async store(request, response) {
        const { github_username, techs, latitude, longitude } = request.body;

        let dev = await Dev.findOne({ github_username })

        if (!dev) {
            const res_api = await axios.get(`https://api.github.com/users/${github_username}`);
        
            const { name = login, avatar_url, bio } = res_api.data;
    
            const techs_array = parseStringAsArray(techs)
    
            const location = {
                type: 'Point',
                coordinates:  [longitude, latitude]
            }   
    
            dev = await Dev.create({
                github_username, name, avatar_url, bio, location,
                techs: techs_array
            })

            const sendSocketMessageTo = findConnections(
                { latitude, longitude },
                techs_array
            )
            sendMessage(sendSocketMessageTo, 'new-dev', dev)
        }
        return response.json(dev);
    },
    async update(request, response) {

    },
    async destroy(request, response) {
        
    }
};