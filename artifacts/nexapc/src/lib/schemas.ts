import { z } from 'zod';

/** Shared Zod schemas — every form in NexaPC validates through these. */
const email = z.string().trim().min(1, 'Enter your email address').email('Enter an email address like name@example.com');

export const PASSWORD_RULES = [
  { id: 'len', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { id: 'num', label: 'One number', test: (v: string) => /\d/.test(v) },
] as const;

const newPassword = z
  .string()
  .min(1, 'Create a password')
  .refine((v) => PASSWORD_RULES.every((r) => r.test(v)), 'Password does not meet all requirements');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const forgotSchema = z.object({ email });
export type ForgotValues = z.infer<typeof forgotSchema>;

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name'),
    email,
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    terms: z.boolean().refine((v) => v, 'Accept the Terms and Conditions to continue'),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
export type SignupValues = z.infer<typeof signupSchema>;

export const GOVERNORATES = ['Al Asimah (Capital)', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra'] as const;

/** Kuwait mobile/landline: 8 digits starting 2, 4, 5, 6 or 9, optional +965 / 00965. */
export const kuwaitPhone = z
  .string()
  .trim()
  .min(1, 'Enter your phone number')
  .transform((v) => v.replace(/[\s-]/g, ''))
  .refine((v) => /^(?:\+965|00965)?[24569]\d{7}$/.test(v), 'Enter an 8-digit Kuwait number, for example 5XXXXXXX');

export const addressFields = {
  governorate: z.string().min(1, 'Choose a governorate'),
  city: z.string().trim().min(2, 'Enter your area or city'),
  block: z.string().trim().min(1, 'Enter the block'),
  street: z.string().trim().min(1, 'Enter the street'),
  building: z.string().trim().min(1, 'Enter the building or house number'),
};

export const deliverySchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the recipient name'),
  email,
  phone: kuwaitPhone,
  ...addressFields,
  notes: z.string().max(300, 'Keep notes under 300 characters').optional().or(z.literal('')),
});
export type DeliveryValues = z.input<typeof deliverySchema>;

export const addressSchema = z.object({
  label: z.string().trim().min(1, 'Name this address, for example Home'),
  fullName: z.string().trim().min(2, 'Enter the recipient name'),
  phone: kuwaitPhone,
  ...addressFields,
});
export type AddressValues = z.input<typeof addressSchema>;

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  email,
  phone: kuwaitPhone.or(z.literal('')),
});
export type ProfileValues = z.input<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const priceRangeSchema = z
  .object({ min: z.number().int().nonnegative().nullable(), max: z.number().int().nonnegative().nullable() })
  .refine((d) => d.min == null || d.max == null || d.min <= d.max, { path: ['max'], message: 'Maximum must be greater than minimum' });
