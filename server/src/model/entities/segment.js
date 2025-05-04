import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    picture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Picture',
    },
    coords: {
        type: { x: Number, y: Number },
        required: true,
    },
    /*page: {
        type: Number,
        required: true,
    },*/
});

const Segment = mongoose.model('Segment', segmentSchema);

export default Segment;