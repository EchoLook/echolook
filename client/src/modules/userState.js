import { reactive } from 'vue';

const state = reactive({
  user: null,
  token: null,
  history: [],
  image: {
    "result": {
        "segments": [
            {
                "_id": "681627fa14caeb22b5489fa3",
                "date": "2025-05-03T14:28:10.939Z",
                "coords": {
                    "x": 320.03941306089746,
                    "y": 344.67973758012823,
                    "_id": "681627fb14caeb22b5489fa5"
                },
                "picture": "681627fa14caeb22b5489fa4",
                "__v": 0
            },
            {
                "_id": "681627fb14caeb22b5489fa9",
                "date": "2025-05-03T14:28:11.438Z",
                "coords": {
                    "x": 311.9869201725998,
                    "y": 583.1460895361381,
                    "_id": "681627fb14caeb22b5489fab"
                },
                "picture": "681627fb14caeb22b5489faa",
                "__v": 0
            }
        ],
        "_id": "681627ec14caeb22b5489f9e",
        "date": "2025-05-03T14:27:56.798Z",
        "user": "65e8369827e5e447f484af08",
        "picture": {
            "_id": "681627ec14caeb22b5489f9f",
            "url": "https://hackupc-images.s3.amazonaws.com/9c573033-e0a7-483a-8253-00d811ef232e-1746282475747.jpg",
            "__v": 0,
            "search": "681627ec14caeb22b5489f9e"
        },
        "__v": 1
    }
}
});

const setUserData = (userData) => {
  state.user = userData.user;
  state.token = userData.token;
};

const setImageData = (imageData) => {
  state.image = imageData;
};


const clearUserData = () => {
  state.user = null;
  state.token = null;
  state.history = [];
};

const setHistory = (history) => {
  state.history = history;
}

export { state, setUserData, clearUserData, setHistory, setImageData };
