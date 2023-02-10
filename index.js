const express = require('express');
const cors = require('cors');
const admin = require('./config/firebaseConfig');
require('dotenv').config();
const mongoose = require("mongoose");
const userModel = require('./models/userModel');
const db = process.env.MONGO_URI
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO ERROR!!!!")
        console.log(err)
    })
const port = process.env.PORT || 5000
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type,Authorization, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
  });
app.get('/',(req,res)=>{
    res.send('hello')
})
app.post('/api/signIn', async(req,res)=>{
    const {token} = req.body;
    const decodeToken = await admin.auth().verifyIdToken(token);
    if(decodeToken){
        try {
          const existingUser = await userModel.findOne({uid:decodeToken.uid});
        if(!existingUser){
            const newUser = await userModel.create({
                uid:decodeToken.uid,
                userProvider:decodeToken.firebase.sign_in_provider
            });
            res.status(200).json(newUser)
        };
        res.status(200).json(existingUser)  
        } catch (error) {
          console.log(error) ;
          res.status(500) 
        }
    }
  
})
const protect = async (req,res,next)=>{
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            token = req.headers.authorization.split(' ')[1];
            const decodeToken = await admin.auth().verifyIdToken(token);
            req.user = await userModel.findOne({uid:decodeToken.uid})
            console.log(req.user)
            next()
        }catch(err){
            console.log(err)
            res.status(401);
            throw new Error("not authorised")
        }
    }
    if(!token){
        res.status(401);
        throw new Error("not authorised,no token")
    }
};
app.use(protect);
app.get('/api/getlist',async(req,res)=>{
    res.status(200).send(req.user.list)
})
app.put('/api/updatelist',async(req,res)=>{
    const{list}=req.body;
    try {
        const updatedList = await userModel.findOneAndUpdate({uid:req.user.uid},{
            list:list
        });
        res.status(200).send('list updated')
    } catch (error) {
        res.status(400).send(error.message)
    }
   
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
