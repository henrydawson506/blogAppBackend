const mongoose=require('mongoose')
const {Schema,model}=mongoose;
const PostSchmea=new Schema({
    title:String,
    summary:String,
    content:String,
   cover:String,
   author:{
    type:Schema.Types.ObjectId,
    ref:'User'

   }
},{
    timestamps:true,

})
const PostModel=model('Post',PostSchmea)
module.exports=PostModel;
