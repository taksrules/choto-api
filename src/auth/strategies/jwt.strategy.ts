import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "../token-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    private authService: AuthService;

    constructor(
        authService: AuthService,
        configService: ConfigService,
    ){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => request.cookies?.Authentication
            ]),    
            secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET')
        });
        this.authService = authService;
    }

    async validate(payload: TokenPayload){        
        return this.authService.getUserById(Number(payload.userId));
    }
}
