const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('super_admin'), userController.createUser);
router.get('/', protect, authorize('super_admin'), userController.getUsers);
router.get('/:id', protect, authorize('super_admin'), userController.getUser);
router.put('/:id', protect, authorize('super_admin'), userController.updateUser);
router.delete('/:id', protect, authorize('super_admin'), userController.deleteUser);

module.exports = router;
