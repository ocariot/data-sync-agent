import Mongoose from 'mongoose'

interface IFitbitAuthDataModel extends Mongoose.Document {
}

const fitbitAuthDataSchema = new Mongoose.Schema({
        access_token: { type: String },
        expires_in: { type: Number },
        refresh_token: { type: String },
        scope: { type: String },
        user_id: { type: Mongoose.Schema.Types.ObjectId },
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

export const FitbitAuthDataRepoModel = Mongoose.model<IFitbitAuthDataModel>(
    'FitbitAuthData', fitbitAuthDataSchema
)
