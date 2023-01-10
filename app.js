import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

class App { 
    constructor(){
        this.app = express()
        this.schema = mongoose.Schema
        this.username = {
            type: String,
            minLength: [3, 'Minimal memuat 3 karakter!'],
            required: true,
            lowercase: true
        }
        this.email = { 
            type: String,
            required: true,
            lowercase: true,
            validate: {
                validator: function(value){ return /@.*.com/ig.test(value) },
                message: props => `${props.value} tidak valid!`,
            }
        }
        this.password = {
            type: String,
            required: true,
            minLength: [5, 'Minimal password memuat 5 karakter!']
        }
        this.tweet = [{
            text: String,
            like: [{ liker: String, isLike: Boolean }],
            totalLike:{ type: Number, default: 0, },
            createdDate: { type: Date }
        }]
        this.userSchema = new this.schema({ username: this.username, email: this.email, password: this.password, tweet: this.tweet })
        this.model = mongoose.model('users', this.userSchema)
        this.middleware()
        this.connection()
        this.routes()
    }
    middleware(){
        this.app.use(express.urlencoded({extended: true}))
        this.app.use(express.json())
    }   
    async connection(){
        try{
            mongoose.set('strictQuery', false)
            mongoose.connect(process.env.URL, { useNewUrlParser: true, useUnifiedTopology: true })
            this.app.listen(process.env.PORT, ()=>console.info(`Database & Server Connected!`))  
        } catch(e){ console.error(e) }
    }
    routes(){
        this.app.get('/', async(req,res)=>{
            try{
                const users = await this.model.find({})
                res.send(users)
            }catch(e){ console.error(e) }
        })
        this.app.get('/create', async(req,res)=>{
            const { username, email, password } = req.query || null
            if(!username && !email && !password) return res.send(`Belum ada data yang dibuat!`)
            try{
                await this.model.create({ username, email, password, tweet: []})
                res.send(`Data Berhasil Dibuat`)
            }catch(e){ console.error(e) }
        })
    }
}

const app = new App()