
require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const bodyPerser = require('body-parser');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const request = require('request');
const https = require('https')


let voices = [];
let speakingRate = 1;
let voiceDataIndex = 0;



const projectId = process.env.PROJECT_ID;
const keyFilename = process.env.KEY_FILENAME;
let text = " "; 

const app = express();
app.set('view engine', 'ejs');
app.use(bodyPerser.urlencoded({extended: true}));
app.use(express.static('public'));


const client = new textToSpeech.TextToSpeechClient({projectId, keyFilename});
async function getVoices(){
  const [result] = await client.listVoices({});
  const voices = result.voices;
  return voices;
}


  async function toSpeech(callBack) {
 
    const request = {
      input: {text: text},
      // Select the language and SSML voice gender (optional)
      voice:{languageCode: voices[voiceDataIndex].languageCodes[0],
      name: voices[voiceDataIndex].name,
      ssmlGender: voices[voiceDataIndex].ssmlGender
    } ,
      // select the type of audio encoding
      audioConfig: {
        audioEncoding: 'MP3',
        "speakingRate": speakingRate

    
        },
    };

    const [response] = await client.synthesizeSpeech(request);
    
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('/tmp/SpeechifyOutput.mp3', response.audioContent, 'binary');
    console.log('Audio content written to file: output.mp3');
    return callBack();
  }
app.get('/', async function(req, res){
  voices = await getVoices();
  res.render('home', {voices : voices});
    
    
})
app.post('/', function(req, res){
    text = req.body.text;
    speakingRate = (req.body.voiceSpeed/100)
    let voiceCode = req.body.voiceType;
    
    voices.forEach(function (voice, index){
      if(voice.name === voiceCode){ 
        voiceDataIndex = index;
      }
    });

    toSpeech(function(){
        res.download('/tmp/SpeechifyOutput.mp3')
    });
})

app.listen( process.env.PORT || 3000, function(){
    console.log("server started");
})