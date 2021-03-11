const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
import RefreshToken from "./refreshToken";
//Servidor con express
const express = require("express");
const http = require("http");
const app = express();
const servidor = http.createServer(app);
import * as cors from 'cors';
import axios from 'axios';
const qs = require('qs');
const needle = require('needle')
const config = require('dotenv').config()
const TWITTER_TOKEN = process.env.TWITTER_BEARER_TOKEN
const PORT = process.env.PORT || 5000;
const url = process.env.DATABASE_URL;

interface TweetData {
  idTweet: string;
  text: string;
  username: string
}

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("connected to db"))
  .catch((err: any) => console.log(err));

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

app.get("/prueba", async () => {
  const ver = await RefreshToken.findOne();
  console.log('see', ver);
  console.log('see3', ver.token);
})

app.get('/refresh_token', async function (req: any, res: any) {

  // valor válido previamente cargado en la base de datos
  const rt = await RefreshToken.findOne();
  const rToken: string = rt.token;

  const data = {
    grant_type: 'authorization_code',
    client_id: process.env.APP_ID, // APP_ID
    client_secret: process.env.SECRET_KEY, // SECRET_KEY
    code: rToken, // SERVER_GENERATED_AUTHORIZATION_CODE
    redirect_uri: process.env.REDIRECT_URI
  }

  const bodyData = qs.stringify(data);

  axios.post('https://api.mercadolibre.com/oauth/token', bodyData, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then(response => {
      console.log(response);
      const access_token = response.data.access_token;
      const refresh_token = response.data.refresh_token;
      //console.log('ACCESS TOKEN', access_token);
      //console.log('REFRESH TOKEN', refresh_token);
      RefreshToken.deleteMany({}, () => {
        const rToken: any = new RefreshToken({ token: refresh_token });
        rToken.save();
      });
      res.json({ atML: access_token });
      console.log('ok');
    })
    .catch((error) => {
      console.log(error);
    });
});

// Para administrador
app.get("/addRefreshToken/:string", async (req: any, res: { send: (arg0: any) => void; }) => {
  // añadir token válido
  const rtML : string = req.params.string;
  await RefreshToken.deleteMany({});

  const rToken: any = new RefreshToken({ token: rtML });
  rToken.save()
    .then((result: any) => { res.send(result) })
    .catch((error: any) => {
      console.log(error);
    });
})

//Inicializción socketio
const socketio = require("socket.io");
const io = socketio(servidor, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET"],
    credentials: true
  }
});

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?expansions=author_id&user.fields=profile_image_url'

const rules = [{ value: '#TESTmrcrdz -is:retweet' }]

// Get stream rules
async function getRules() {
  const response = await needle('get', rulesURL, {
    headers: {
      Authorization: `Bearer ${TWITTER_TOKEN}`,
    },
  })
  return response.body
}

// Set stream rules
async function setRules() {
  const data = {
    add: rules,
  }
  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${TWITTER_TOKEN}`,
    },
  })
  return response.body
}

// Delete stream rules
async function deleteRules(rules: { data: any[]; }) {
  if (!Array.isArray(rules.data)) {
    return null
  }
  const ids = rules.data.map((rule: { id: any; }) => rule.id)
  const data = {
    delete: {
      ids: ids,
    },
  }
  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${TWITTER_TOKEN}`,
    },
  })
  return response.body
}

function streamTweets(socket: { emit: (arg0: string, arg1: TweetData) => void; }) {

  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${TWITTER_TOKEN}`,
    },
  })

  stream.on('data', (data: string) => {
    console.log('check');
    try {
      const twData = JSON.parse(data);
      const tweetData: TweetData = {
        idTweet: twData.data.id,
        text: twData.data.text,
        username: twData.includes.users[0].username
      }
      socket.emit('tweet', tweetData)
    } catch (error) { }
  })

  return stream
}

//Funcionalidad de socket.io en el servidor
io.on("connection", async (socket: { id: any; on: (arg0: string, arg1: () => Promise<void>) => void; }) => {

  let currentRules
  let filteredStream: any = null;

  try {
    //   Get all stream rules
    currentRules = await getRules()
    console.log(currentRules);
    // Delete all stream rules
    await deleteRules(currentRules)
    // Set rules based on array above
    await setRules()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }

  socket.on("arrancar", async () => {
    filteredStream = streamTweets(io)
    let timeout = 0
    filteredStream.on('timeout', () => {
      // Reconnect on error
      console.warn('A connection error occurred. Reconnecting…')
      setTimeout(() => {
        timeout++
        streamTweets(io)
      }, 2 ** timeout)
      streamTweets(io)
    });
  });

  socket.on("detener", async () => {
    console.log("stop");
    if (filteredStream != null)
      filteredStream.request.abort();
  });

});

servidor.listen(PORT, () => console.log("Servidor inicializado"));