import mongoose, {Mongoose} from "mongoose";

export  interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: "user" |"partner" | "admin";
    isEmailVerified?:boolean;
    isPartnerVerified?: boolean;
    otp?:string;
    otpExpires?: Date;
    partnerOnboardingSteps:number;
    partnerStatus: "none" | "pending" | "approved" | "rejected"
    partnerRejectionReason?: string
    createdAt: Date;
    updatedAt: Date;

}

const userSchema = new mongoose.Schema <IUser>({
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
    },
    role:{
        type:String,
        default: "user",
        enum:["user","partner","admin"]
    },
    isEmailVerified:{
        type:Boolean,
        default:false,
    },
    isPartnerVerified:{
        type:Boolean,
        default:false,
    },
    partnerOnboardingSteps:{
        type:Number,
        min:0,
        max:8,
        default:0,
    },

    partnerStatus:{
        type:String,
        enum :["none", "pending", 'approved', "rejected"],
        default:"none",
    },
    partnerRejectionReason:{
        type:String,
        default:"",
    },
    otp:{
        type:String,
    },
    otpExpires:{
        type:Date,
    },
    
},{timestamps:true})

const User =mongoose.models.User ||  mongoose.model("User",userSchema);

export default User;