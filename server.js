if ( process.env.NODE_ENV !== 'production'){
    require('dotenv').load()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

// console.log(stripePublicKey);
const express = require('express');
const fs = require('fs');
const stripe = require('stripe')(stripeSecretKey);
const app = express()


app.set('view engine','ejs')
app.use(express.json())
app.use(express.static('public'))

app.get('/store',function(req,res){
    // console.log('Inside store');
    fs.readFile('items.json',function(error,data){
        // console.log('Inside Readfile');
        if(error){
            res.status(500).end()
        }else{
            res.render('store.ejs',{
                stripePublicKey:stripePublicKey,
                items: JSON.parse(data)
            })
        }
    })
})

app.post('/purchase', function(req,res){
    // console.log('Inside store');
    fs.readFile('items.json',async function(error,data){
        // console.log('Inside Readfile');
        if(error){
            res.status(500).end()
        }else{
            console.log("purchase");
            
            const itemsJson =  JSON.parse(data)
            const itemsArray = itemsJson.music.concat(itemsJson.merch)
            let total = 0
            req.body.items.forEach(function(item){
                const itemJson = itemsArray.find(function(i){
                    return i.id == item.id
                })
                total = total + itemJson.price * item.quantity
            })
            console.log(total);
            
            
            try {
                const charge = await stripe.charges.create({
                    amount : total,
                    source :req.body.stripeTokenId,
                    currency:'usd'
                })
                res.status(200).send({ message : 'Successfuly purchased items'})
            } catch (error) {
                res.status(500).send(error)
            }
            
            
            // stripe.charges.create({
            //     amount : total,
            //     source : req.body.stripeTokenId,
            //     currency : 'usd'
            // }).then(function(){
            //     console.log("successful");
            //     res.send({message : 'Successfuly purchased items'})
            // }).catch(function(){
            //     console.log('Charge Fail');
            //     res.status(500).send()
            // })
        }
    })
})

app.listen(3000,()=>{
    console.log("Server running on : 3000" );
})