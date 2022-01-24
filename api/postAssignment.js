const router = require("express").Router();
const upload = require("../utils/multer");
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../fir-f0ab4-firebase-adminsdk-qlwf7-61a7149461.json')
const admin = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});
const storageRef = admin.storage().bucket(`gs://fir-f0ab4.appspot.com`);
router.post("/", upload.single("order_files[]"), async (req, res) => {
    try {
        // Upload the File
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        const timeStamp = Date.now();
        const storage = await storageRef.upload(req.file.path, {
            public: true,
            destination: `assignments/${timeStamp}-${req.file.originalname}`
        });


        res.send(`${timeStamp}-${req.file.originalname}`);
    } catch (err) {
        console.log(err);
    }
});

router.delete('/', async (req, res) => {
    // Employee.findByIdAndDelete(req.query.fileName)
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        const storage = await storageRef.file("assignments/" + req.query.fileName).delete();

        res.json(true);
    } catch (err) {
        console.log(err);
    }
})

router.get('/', async (req, res) => {
    try {
        let destFilename = './Downloads';
        const options = {
            // The path to which the file should be downloaded
            destination: destFilename,
        };
        const urlOptions = {
            version: "v4",
            action: "read",
            expires: Date.now() + 1000 * 60 * 2, // 2 minutes
        }
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        storageRef.file("assignments/" + req.query.fileName).getSignedUrl(urlOptions).then((value) => {
            console.log(value);
            // return res.status(200).json();
            res.redirect(value)
        }).catch((error) => {
            console.log(error);
            return res.status(500).json();
        });
    } catch (err) {
        console.log(err);
    }
})


// async function uploadFile(path, filename) {

//     // Upload the File
//     const storage = await storageRef.upload(path, {
//         public: true,
//         destination: `assignments/${filename}`
//     });


//     return storage[0].metadata.mediaLink;
// }

// (async () => {
//     const url = await uploadFile('uploads/test upload.docx', "123.docx");
//     console.log(url);
// })();
module.exports = router;