const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    token: String,
}, {
    timestamps: true
});

const RefreshToken = mongoose.model('RefreshToken', schema);
export default RefreshToken;