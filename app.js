const express = require('express')
const api_helper = require('./routing/API_helper');
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var scheduler = require('node-cron');
const app = express()
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
const port = 3000;

mongoose.connect('mongodb://localhost:27017/ormaedata');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
    console.log("connection succeeded");
})
var task = scheduler.schedule("*/5 * * * * *",function () {
    app.get('/getAPIResponse', (req, res) => {
        api_helper.make_API_call('https://jsonplaceholder.typicode.com/comments')
            .then(response => {
                var Result = response;
                Result.forEach((item, index) => {
                    var data = {
                        'postId': item.postTd,
                        'name': item.name,
                        'email': item.email,
                        'body': item.body,
                    }
                    db.collection('savedata').insertOne(data, function (err, collection) {
                        if (err) throw err;
                        console.log("Record inserted Successfully");
                    });
                })
                res.send('insert the data succesfully all jspn data');

            })
            .catch(error => {
                res.send(error)
            })
    })
},
    {
        scheduled: true,
        timezone:"Asia/Kolkata"
    });

app.listen(port, () => console.log(`App listening on port ${port}!`))