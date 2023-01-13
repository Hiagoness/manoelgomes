require('dotenv').config();
const faceapi = require('@vladmandic/face-api');
const search = require('youtube-search');
const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');

module.exports = {
    mergeImages: async function () {
        mergeImages(['./src/media/images/teste.jpg', './src/media/images/quem.png', './mouth.png'], {
            Canvas: Canvas,
            Image: Image
          })
            .then(b64 => {
                
            });
    },
    timeTranslate: function (timeUnit) {
        try {
            timeUnit = timeUnit.toLowerCase().replace(" ", "");
            switch (timeUnit) {
                case 'milissegundo':
                case 'milissegundos':
                case 'milisegundo':
                case 'milisegundos':
                    return 'ms';
                case 'segundos':
                case 'segundo':
                case 'sec':
                case 'seg':
                case 's':
                    return 'seconds';
                case 'minutos':
                case 'minuto':
                case 'min':
                case 'm':
                    return 'minutes';
                case 'horas':
                case 'hora':
                case 'h':
                    return 'hours';
                case 'dias':
                case 'dia':
                case 'd':
                    return 'days';
                case 'semanas':
                case 'semana':
                case 'sem':
                    return 'weeks';
                case 'meses':
                case 'mes':
                case 'mês':
                    return 'months';
                case 'anos':
                case 'ano':
                    return 'years';
                default:
                    return timeUnit;
            }
        }
        catch (err) {
            return timeUnit;
        }
    },
    newGuid: function () {
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if (d > 0) {//Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },
    getYoutubeUrl: async function (text) {
        let url = text;
        await new Promise((resolve, reject) => {
            search(text, {
                maxResults: 1,
                key: process.env.GG_API_KEY,
                relevanceLanguage: 'pt',
                type: 'video'
            }, function (err, results) {
                if (err) {
                    console.error(err);
                    throw err;
                }
                resolve(results[0].link);
            });
        })
            .then(async (result) => {
                url = result;
            });

        return url;
    },
    getPessoas: async function (base64) {

        // https://github.com/vladmandic/face-api/blob/master/demo/node-simple.js

        await faceapi.nets.ssdMobilenetv1.loadFromDisk('node_modules/@vladmandic/face-api/model');
        await faceapi.nets.faceLandmark68Net.loadFromDisk('node_modules/@vladmandic/face-api/model');
        await faceapi.nets.ageGenderNet.loadFromDisk('node_modules/@vladmandic/face-api/model');
        await faceapi.nets.faceRecognitionNet.loadFromDisk('node_modules/@vladmandic/face-api/model');
        await faceapi.nets.faceExpressionNet.loadFromDisk('node_modules/@vladmandic/face-api/model');
        const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1, maxResults: 10 }); // set model options
        let buffer = Buffer.from(base64, 'base64'); // load jpg image as binary
        const decodeT = faceapi.tf.node.decodeImage(buffer, 3); // decode binary buffer to rgb tensor
        const expandT = faceapi.tf.expandDims(decodeT, 0); // add batch dimension to tensor
        const result = await faceapi.detectAllFaces(expandT, options).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors() // run detection
        faceapi.tf.dispose([decodeT, expandT]); // dispose tensors to avoid memory leaks

        return result.filter(face => face.detection.score > 0.4);

    }
}