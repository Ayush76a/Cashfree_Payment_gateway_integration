const express= require("express")
const cors= require("cors")
const dotenv= require("dotenv")
const crypto= require("crypto")

dotenv.config()

// payment gateway
const {cashfree, Cashfree} = require("cashfree-pg")


const app = express();


// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended : true}))


// SETTING UP CASHFREE GATEWAY
Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret= process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;     // sandBox => Testing


function generateOrderId(){
    const uniqueId = crypto.randomBytes(16).toString('hex')
    
    const hash = crypto.createHash('sha256')
    hash.update(uniqueId)

    const orderId = hash.digest('hex')

    return orderId.substr(0,12);


    // ye fucntion ek orderId ko generated krke de dega 
    // joki Hashed kr di hai using crypto so that no one can steal data 
}


app.get('/', (req, res)=>{
    res.send("Payment App")
})


app.get('/payment', async(req, res)=>{
    // res.send("Payment Page")

    try{
        let request = {
            "order_amount":1.00,
            "order_currency" : "INR",
            "order_id" : await generateOrderId(),

            "customer_details" : {
                "customer_id" : "webcodder_01",
                "customer_Phone" : "+918957272259",
                "customername" : "web Codder",
                "customer_email" : " webCodder@example.com",
            }
        }

        // ab hmko cashfree ko generated order id de do taki vo ek apni order generate krde
        Cashfree.PGCreateOrder("2023-08-01", request)
        .then(response =>{
            // console.log(response.data)
            res.json(response.data)
        })
        .catch(error => {
            console.log(error)
        })
    }
    catch(e){
        console.log(e)
    }
    // abhi tak hm sessionId ya OrderId bna chuke hai Jiske Basis par payment Hogi
})


app.post('/verify', (req, res)=>{
    try{
        let {orderId} = req.body
        Cashfree.PGOrderFetchPayments("2023-08-01", orderId)
        .then((response)=>{
            res.json(response.data)
        })
        .catch((e)=>{
            console.log(e)
        })   
    }
    catch(e){
        console.log(e)
    }
})


app.listen(8000, ()=>{
    console.log("server running on port 8000");
})