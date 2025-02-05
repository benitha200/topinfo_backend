import { agreementService } from '../services/agreement.service.js';

export const agreementController = {
    async createAgreement(req, res, next) {
        try {
            const {
                userId,
                nationalId,
                agreementDate,
                userDetails
            } = req.body;

            // Validate national ID format
            if (!/^\d{16}$/.test(nationalId)) {
                return res.status(400).json({
                    message: 'Invalid National ID format. Must be 16 digits.'
                });
            }

            const agreement = await agreementService.createAgreement({
                userId,
                nationalId,
                agreementDate,
                userDetails,
                status: 'SIGNED',
                signedAt: new Date()
            });

            res.status(201).json({
                message: 'Agreement signed successfully',
                agreement
            });
        } catch (error) {
            next(error);
        }
    },

    async getUserAgreement(req, res, next) {
        try {
            const { userId } = req.params;
            const agreement = await agreementService.getUserAgreement(userId);
            
            if (!agreement) {
                return res.status(404).json({
                    message: 'No agreement found for this user'
                });
            }

            res.json(agreement);
        } catch (error) {
            next(error);
        }
    }
};