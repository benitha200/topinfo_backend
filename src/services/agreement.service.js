import prisma from "./prisma.service.js";

export const agreementService = {
    async createAgreement(agreementData) {
        // Check if user already has an agreement
        const existingAgreement = await prisma.agreement.findFirst({
            where: { userId: agreementData.userId }
        });

        if (existingAgreement) {
            throw new Error('User already has a signed agreement');
        }

        // Create new agreement
        const agreement = await prisma.agreement.create({
            data: {
                userId: agreementData.userId,
                nationalId: agreementData.nationalId,
                agreementDate: agreementData.agreementDate,
                userDetails: agreementData.userDetails,
                status: agreementData.status,
                signedAt: agreementData.signedAt
            }
        });

        // Update user's agreement status
        await prisma.user.update({
            where: { id: agreementData.userId },
            data: { hasSignedAgreement: true }
        });

        return agreement;
    },

    async getUserAgreement(userId) {
        // Convert userId to integer
        const id = parseInt(userId);
        
        // Validate userId
        if (isNaN(id)) {
            throw new Error('Invalid user ID');
        }

        return await prisma.agreement.findFirst({
            where: { userId: id }  // Using the converted integer userId
        });
    }
};