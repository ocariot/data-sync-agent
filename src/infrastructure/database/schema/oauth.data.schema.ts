import Mongoose from 'mongoose'

interface IUserAuthModel extends Mongoose.Document {
}

const oauthSchema: any = {
    access_token: { type: String }, // OAuth parameters
    expires_in: { type: Number },
    refresh_token: { type: String },
    scope: { type: String },
    token_type: { type: String }
}
const userAuthSchema = new Mongoose.Schema({
        user_id: { type: Mongoose.Schema.Types.ObjectId },
        fitbit: {// Fitbit UserAuthData
            ...oauthSchema,
            user_id: { type: String },
            last_sync: { type: String },
            status: { type: String }
        }

    },
    {
        strict: false,
        timestamps: { createdAt: 'created_at', updatedAt: false },
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id
                delete ret._id
                delete ret.__v
                return ret
            }
        }
    }
)

export const UserAuthRepoModel = Mongoose.model<IUserAuthModel>('UserAuth', userAuthSchema)
