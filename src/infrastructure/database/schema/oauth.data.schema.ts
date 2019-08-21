import Mongoose from 'mongoose'

interface IOAuthDataModel extends Mongoose.Document {
}

const oauthDataSchema = new Mongoose.Schema({
        type: { type: String },
        user_id: { type: Mongoose.Schema.Types.ObjectId },
        access_token: { type: String }, // OAuth parameters
        expires_in: { type: Number },
        refresh_token: { type: String },
        scope: { type: String },
        token_type: { type: String }
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

export const OAuthDataRepoModel = Mongoose.model<IOAuthDataModel>('OAuthData', oauthDataSchema)
