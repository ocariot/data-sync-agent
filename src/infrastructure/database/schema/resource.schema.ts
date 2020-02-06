import Mongoose from 'mongoose'

interface IResourceSchemaModel extends Mongoose.Document {
}

const resourceSchema = new Mongoose.Schema({
        user_id: String,
        type: String,
        resource: Object,
        date_sync: String,
        provider: String
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

export const ResourceRepoModel = Mongoose.model<IResourceSchemaModel>('Resource', resourceSchema)
