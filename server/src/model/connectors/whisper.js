import { createReadStream } from "fs";
import request from "request";

export const processAudio = async (image, audio) => {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: `${process.env.WHISPER_API_URL}/process`,
            headers: {},
            formData: {
                'audio_file': {
                    'value': createReadStream(audio.path),
                    'options': {
                        'filename': audio.filename,
                        'contentType': null
                    }
                },
                'image': {
                    'value': createReadStream(image.filepath),
                    'options': {
                        'filename': image.filename,
                        'contentType': null
                    }
                }
            }
        };

        request(options, function (error, response) {
            if (error) {
                reject(error); // Rechaza la promesa si hay un error
            } else {
                resolve(JSON.parse(response.body)); // Resuelve la promesa con el body de la respuesta
            }
        });
    });
};