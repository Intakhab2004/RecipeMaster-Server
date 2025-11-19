const { z } = require("zod");

exports.personalDetailsSchema = z.object({
    firstName: z.string()
                        .min(2, "First name should be of atleast 2 characters long")
                        .max(12, "First name should not be more than 12 characters")
                        .optional()
                        .or(z.literal("")),

    lastName: z.string()
                        .min(2, {message: "Last name should be at least 2 characters"})
                        .max(12, {message: "Last name should not be more than 12 characters"})
                        .trim()
                        .optional()
                        .or(z.literal("")),

    gender: z.string().optional(),

    DOB: z.date().nullable().optional(),

    contactNumber: z.string()
                            .regex(/^\d{10}$/, { message: "Contact number must be 10 digits" })
                            .optional()
                            .or(z.literal(""))
                     
})