const cors = require('cors');
const express = require('express');
// TODO: add a stripe
//
const stripe = require("stripe")("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")

const app = express();
const uuid = require('uuid')
uuid.v4()

//middlewares
app.use(express.json());
app.use(cors());

//routes

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.post("/payment", (req, res) => {
    const { product, token } = req.body
    console.log('product', product)
    console.log('price ', product.price)
    const idempotencyKey = uuid()

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer => {
        stripe.charges.create({
            amount: product.price * 100,
            currency: 'inr',
            customer: customer.id,
            reciept_email: token.email,
            description: "purchase for product.name",
            shipping: {
                name: token.card.name,
                address: {
                    country: token.card.address_country

                }
            }
        }, { idempotencyKey })
    }).then(result => res.status(200).json(result))
        .catch(err => res.status(500).json(err))
})

//listen
app.listen(process.env.PORT || 5000, () => console.log('server is running'));