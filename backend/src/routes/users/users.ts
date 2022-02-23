import {Router} from 'express';
import {useUsers} from "../../services/UserService";

const router = Router();

router.get('/', async (req, res) => {
    const service = useUsers();
    const users = await service.findAll();
    res.json({users});
});


export default router;