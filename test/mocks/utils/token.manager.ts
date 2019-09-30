import jwt from 'jsonwebtoken'
export class TokenManager {
    public static generateToken(payload: any): string {
        return jwt.sign(payload, 't3st')
    }

}
