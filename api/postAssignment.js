const router = require("express").Router();
const request = require('request');
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
        // res.setHeader('Access-Control-Allow-Origin', '*');

        // // Request methods you wish to allow
        // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // // Request headers you wish to allow
        // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // // Set to true if you need the website to include cookies in the requests sent
        // // to the API (e.g. in case you use sessions)
        // res.setHeader('Access-Control-Allow-Credentials', true);
        const timeStamp = Date.now();
        const storage = await storageRef.upload(req.file.path, {
            public: true,
            destination: `assignments/${timeStamp}-${req.file.originalname.replace(/[%'+$!?=]/g, "")}`
        });


        res.send(`${timeStamp}-${req.file.originalname.replace(/[%'+$!?=]/g, "")}`);
    } catch (err) {
        console.log(err);
    }
});

router.delete('/', async (req, res) => {
    // Employee.findByIdAndDelete(req.query.fileName)
    try {
        // res.setHeader('Access-Control-Allow-Origin', '*');

        // // Request methods you wish to allow
        // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // // Request headers you wish to allow
        // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // // Set to true if you need the website to include cookies in the requests sent
        // // to the API (e.g. in case you use sessions)
        // res.setHeader('Access-Control-Allow-Credentials', true);
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
        // res.setHeader('Access-Control-Allow-Origin', '*');
        // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        // res.setHeader('Access-Control-Allow-Credentials', true);


        storageRef.file("assignments/" + req.query.fileName).getSignedUrl(urlOptions).then((value) => {
            file_name = req.query.fileName
            user_name = req.query.user
            const [exclude, ...rest] = file_name.split('-')
            file_name = rest.join('-')
            const formData = {
                'file_url': value,
                'fileName': file_name,
                'user_name': user_name
            }
            const options = {
                uri: req.get('origin') + '/portal/process/excludes/curl/set.php',
                method: 'POST',
                formData: formData,
                headers: { 'user-agent': 'node.js' }
            }
            request(options, (error, response, body) => {
                if (error) {
                    console.error(error.message);
                    return res.status(400).json({ errors: error })
                }
                if (response.statusCode !== 200) {
                    return res.status(404).json({ msg: 'error in request' })
                }
                res.json(JSON.parse(body));
            })
        }).catch((error) => {
            console.log(error);
            return res.status(500).json();
        });
    } catch (err) {
        console.log(err);
    }
})

router.post('/download_all', async (req, res) => {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // res.setHeader('Access-Control-Allow-Credentials', true);
    try {
        let files_detail = [];
        let user_name = req.body.user
        let order_title = req.body.order_title
        const urlOptions = {
            version: "v4",
            action: "read",
            expires: Date.now() + 1000 * 60 * 2, // 2 minutes
        }
        let totalCountFiles = req.body.download_files.length;
        await req.body.download_files.forEach((fileName, key) => {

            storageRef.file("assignments/" + fileName).getSignedUrl(urlOptions).then((value) => {
                file_name = fileName
                const [exclude, ...rest] = file_name.split('-')
                file_name = rest.join('-')
                files_detail.push({
                    url: value,
                    file_name
                })
                totalCountFiles--;
                if (totalCountFiles == 0) {
                    const formData = {
                        'files_detail': JSON.stringify(files_detail),
                        'user_name': user_name,
                        'order_title': order_title
                    }
                    const options = {
                        uri: req.get('origin') + '/portal/process/excludes/curl/set.php',
                        method: 'POST',
                        formData: formData,
                        headers: { 'user-agent': 'node.js' }
                    }
                    request(options, (error, response, body) => {
                        if (error) {
                            console.error(error.message);
                            return res.status(400).json({ errors: error })
                        }
                        if (response.statusCode !== 200) {
                            return res.status(404).json({ msg: 'error in request' })
                        }
                        res.json(JSON.parse(body));
                    })
                }
            }).catch((error) => {
                return res.status(500).json();
            });
        })

    } catch (err) {
        console.log(err);
    }

})

module.exports = router;