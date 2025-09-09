const router = require('express').Router();
const { protect } = require('../middleware/auth');
const cropController = require('../controllers/cropController');

router.use(protect);

router.post('/', cropController.create);
router.get('/', cropController.list);
router.get('/:id', cropController.get);
router.put('/:id', cropController.update);
router.delete('/:id', cropController.remove);

module.exports = router;
