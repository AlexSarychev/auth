import {Router} from "express";
import {UserDTO} from "../../dto/UserDTO";
import {useAuth} from "../../services/AuthService";
import {validate} from "class-validator";
import {respondWithBadValidation, respondWithError} from "../../helpers/api";

const router = Router();
router.post('/register', async (req, res) => {
    const dto = new UserDTO();
    Object.assign(dto, req.body);
    const defaultErrorMsg = "Unable to register user";
    const errors = await validate(dto);
    if (errors.length > 0) {
        return respondWithBadValidation(res, defaultErrorMsg, errors);
    }

    const auth = useAuth();
    const user = await auth.createUser(dto.fullName, dto.email, dto.password);
    if (!user) {
        return respondWithBadValidation(res, defaultErrorMsg, auth.getErrors());
    }
    let jwt = await auth.login(dto.email, dto.password);
    if (!jwt) {
        return respondWithError(res, "Couldn't login");
    }
    //@todo: probably we don't need to send the user, it's the Auth service, not the user service. It will require to apply fixes to frontend types.
    res.json({user, jwt});
});

router.post('/login', async (req, res) => {
    const dto = new UserDTO();
    Object.assign(dto, req.body);
    const defaultErrorMsg = "Unable to register login";
    const errors = await validate(dto, {skipMissingProperties: true});
    if (errors.length > 0) {
        return respondWithBadValidation(res, defaultErrorMsg, errors);
    }

    const auth = useAuth();
    let jwt = await auth.login(dto.email, dto.password);
    if (!jwt) {
        return respondWithBadValidation(res, defaultErrorMsg, auth.getErrors());

    }
    //@todo: probably we don't need to send the user, it's the Auth service, not the user service. It will require to apply fixes to frontend types.
    let user = auth.findByEmail(dto.email);
    res.json({user, jwt});
});

export default router;
