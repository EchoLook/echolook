import mongoose from 'mongoose';

const searchSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    picture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Picture',
    },
    segments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Segment',
        },
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
});

const Search = mongoose.model('Search', searchSchema);

export default Search;