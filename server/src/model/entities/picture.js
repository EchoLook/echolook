import mongoose from 'mongoose';

const pictureSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    search: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Search',
    },
    segment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Segment',
    },
});

const Picture = mongoose.model('Picture', pictureSchema);

export default Picture;