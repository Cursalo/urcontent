import { describe, it, expect, vi } from 'vitest'
import {
  phoneRegex,
  cuitRegex,
  instagramHandleRegex,
  emailSchema,
  phoneSchema,
  passwordSchema,
  businessStep2Schema,
  creatorStep2Schema,
  validateStep,
  validateCuit,
  verifyInstagramHandle,
} from '../validation'

describe('Validation Library', () => {
  describe('Regular Expressions', () => {
    describe('phoneRegex', () => {
      it('validates Argentina phone numbers correctly', () => {
        const validPhones = [
          '+54 11 1234-5678',
          '+54 11 12345678',
          '11 1234 5678',
          '11 1234-5678',
          '011 1234-5678',
          '1234-5678',
        ]

        const invalidPhones = [
          '123',
          '+1 555 123-4567',
          '123-45-678',
          'not-a-phone',
        ]

        validPhones.forEach(phone => {
          expect(phoneRegex.test(phone)).toBe(true)
        })

        invalidPhones.forEach(phone => {
          expect(phoneRegex.test(phone)).toBe(false)
        })
      })
    })

    describe('cuitRegex', () => {
      it('validates CUIT format correctly', () => {
        const validCuits = [
          '20-12345678-9',
          '27-98765432-1',
          '30-11111111-1',
        ]

        const invalidCuits = [
          '20123456789',
          '20-123456789',
          '20-1234567-89',
          'invalid-cuit',
        ]

        validCuits.forEach(cuit => {
          expect(cuitRegex.test(cuit)).toBe(true)
        })

        invalidCuits.forEach(cuit => {
          expect(cuitRegex.test(cuit)).toBe(false)
        })
      })
    })

    describe('instagramHandleRegex', () => {
      it('validates Instagram handles correctly', () => {
        const validHandles = [
          'username',
          'user.name',
          'user_name',
          'user123',
          'a',
          '123456789012345678901234567890', // 30 chars
        ]

        const invalidHandles = [
          '',
          'user-name',
          'user name',
          'user@name',
          '1234567890123456789012345678901', // 31 chars
        ]

        validHandles.forEach(handle => {
          expect(instagramHandleRegex.test(handle)).toBe(true)
        })

        invalidHandles.forEach(handle => {
          expect(instagramHandleRegex.test(handle)).toBe(false)
        })
      })
    })
  })

  describe('Zod Schemas', () => {
    describe('emailSchema', () => {
      it('validates correct email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
        ]

        validEmails.forEach(email => {
          expect(() => emailSchema.parse(email)).not.toThrow()
        })
      })

      it('rejects invalid email addresses', () => {
        const invalidEmails = [
          '',
          'invalid-email',
          '@example.com',
          'test@',
          'test.example.com',
        ]

        invalidEmails.forEach(email => {
          expect(() => emailSchema.parse(email)).toThrow()
        })
      })
    })

    describe('phoneSchema', () => {
      it('validates correct phone numbers', () => {
        const validPhones = [
          '+54 11 1234-5678',
          '11 1234 5678',
        ]

        validPhones.forEach(phone => {
          expect(() => phoneSchema.parse(phone)).not.toThrow()
        })
      })

      it('rejects invalid phone numbers', () => {
        const invalidPhones = [
          '',
          '123',
          'not-a-phone',
        ]

        invalidPhones.forEach(phone => {
          expect(() => phoneSchema.parse(phone)).toThrow()
        })
      })
    })

    describe('passwordSchema', () => {
      it('validates strong passwords', () => {
        const validPasswords = [
          'Password123',
          'SecurePass1',
          'MyStr0ngP@ssw0rd',
        ]

        validPasswords.forEach(password => {
          expect(() => passwordSchema.parse(password)).not.toThrow()
        })
      })

      it('rejects weak passwords', () => {
        const invalidPasswords = [
          '',
          'short',
          'password', // no uppercase, no number
          'PASSWORD123', // no lowercase
          'Password', // no number
          'password123', // no uppercase
        ]

        invalidPasswords.forEach(password => {
          expect(() => passwordSchema.parse(password)).toThrow()
        })
      })
    })

    describe('businessStep2Schema', () => {
      it('validates correct business step 2 data', () => {
        const validData = {
          companyName: 'Test Company',
          cuit: '20-12345678-9',
          industry: 'Technology',
          companySize: '10-50',
        }

        expect(() => businessStep2Schema.parse(validData)).not.toThrow()
      })

      it('rejects invalid business step 2 data', () => {
        const invalidData = [
          { companyName: 'T', cuit: '20-12345678-9', industry: 'Tech', companySize: '10-50' }, // Name too short
          { companyName: 'Test Company', cuit: 'invalid', industry: 'Tech', companySize: '10-50' }, // Invalid CUIT
          { companyName: 'Test Company', cuit: '20-12345678-9', industry: '', companySize: '10-50' }, // Empty industry
          { companyName: 'Test Company', cuit: '20-12345678-9', industry: 'Tech', companySize: '' }, // Empty company size
        ]

        invalidData.forEach(data => {
          expect(() => businessStep2Schema.parse(data)).toThrow()
        })
      })
    })

    describe('creatorStep2Schema', () => {
      it('validates correct creator step 2 data', () => {
        const validData = {
          fullName: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          phone: '+54 11 1234-5678',
        }

        expect(() => creatorStep2Schema.parse(validData)).not.toThrow()
      })

      it('rejects invalid creator step 2 data', () => {
        const invalidData = [
          { fullName: 'J', username: 'johndoe', email: 'john@example.com', phone: '+54 11 1234-5678' }, // Name too short
          { fullName: 'John Doe', username: 'jo', email: 'john@example.com', phone: '+54 11 1234-5678' }, // Username too short
          { fullName: 'John Doe', username: 'john-doe', email: 'john@example.com', phone: '+54 11 1234-5678' }, // Invalid username
          { fullName: 'John Doe', username: 'johndoe', email: 'invalid', phone: '+54 11 1234-5678' }, // Invalid email
          { fullName: 'John Doe', username: 'johndoe', email: 'john@example.com', phone: 'invalid' }, // Invalid phone
        ]

        invalidData.forEach(data => {
          expect(() => creatorStep2Schema.parse(data)).toThrow()
        })
      })
    })
  })

  describe('validateStep helper', () => {
    it('returns success for valid data', () => {
      const result = validateStep(emailSchema, 'test@example.com')
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('test@example.com')
      expect(result.errors).toBeUndefined()
    })

    it('returns errors for invalid data', () => {
      const result = validateStep(emailSchema, 'invalid-email')
      
      expect(result.success).toBe(false)
      expect(result.data).toBeUndefined()
      expect(result.errors).toBeDefined()
      expect(result.errors).toHaveProperty('', expect.stringContaining('email'))
    })

    it('handles complex object validation errors', () => {
      const invalidData = {
        companyName: 'T', // Too short
        cuit: 'invalid', // Invalid format
        industry: '', // Required
        companySize: '10-50',
      }

      const result = validateStep(businessStep2Schema, invalidData)
      
      expect(result.success).toBe(false)
      expect(result.errors).toHaveProperty('companyName')
      expect(result.errors).toHaveProperty('cuit')
      expect(result.errors).toHaveProperty('industry')
    })
  })

  describe('validateCuit function', () => {
    it('validates correct CUIT numbers', () => {
      // These are test CUITs with valid check digits calculated properly
      const validCuits = [
        '20-12345678-6', // Valid CUIT
        '27-12345678-0', // Valid CUIT
        '30-12345678-1', // Valid CUIT
      ]

      validCuits.forEach(cuit => {
        expect(validateCuit(cuit)).toBe(true)
      })
    })

    it('rejects invalid CUIT numbers', () => {
      const invalidCuits = [
        '20-12345674-9', // Wrong check digit
        '12345674', // Too short
        '20-1234567-89', // Wrong format
        'invalid-cuit',
      ]

      invalidCuits.forEach(cuit => {
        expect(validateCuit(cuit)).toBe(false)
      })
    })

    it('handles CUIT numbers with different formatting', () => {
      expect(validateCuit('20 12345678 6')).toBe(true)
      expect(validateCuit('2012345678-6')).toBe(true)
      expect(validateCuit('20123456786')).toBe(true)
    })
  })

  describe('verifyInstagramHandle function', () => {
    it('returns success for valid handles', async () => {
      const result = await verifyInstagramHandle('@validhandle')
      
      expect(result.exists).toBe(true)
      expect(result.followers).toBeGreaterThan(0)
      expect(typeof result.verified).toBe('boolean')
    })

    it('returns failure for invalid handles', async () => {
      const result = await verifyInstagramHandle('ab') // Too short
      
      expect(result.exists).toBe(false)
      expect(result.followers).toBeUndefined()
      expect(result.verified).toBeUndefined()
    })

    it('handles handles with and without @ symbol', async () => {
      const resultWithAt = await verifyInstagramHandle('@testhandle')
      const resultWithoutAt = await verifyInstagramHandle('testhandle')
      
      expect(resultWithAt.exists).toBe(true)
      expect(resultWithoutAt.exists).toBe(true)
    })

    it('simulates API delay', async () => {
      const startTime = Date.now()
      await verifyInstagramHandle('@testhandle')
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(1500)
    })
  })

  describe('Integration Tests', () => {
    it('validates complete business onboarding flow', () => {
      const businessData = {
        step1: { welcomeComplete: true },
        step2: {
          companyName: 'Tech Solutions Inc',
          cuit: '30-12345674-7',
          industry: 'Technology',
          companySize: '10-50',
        },
        step3: {
          email: 'contact@techsolutions.com',
          phone: '+54 11 1234-5678',
          address: '123 Tech Street, Buenos Aires',
          contactPerson: 'John Smith',
        },
      }

      expect(() => businessStep2Schema.parse(businessData.step2)).not.toThrow()
    })

    it('validates complete creator onboarding flow', () => {
      const creatorData = {
        step1: { welcomeComplete: true },
        step2: {
          fullName: 'Content Creator',
          username: 'creator123',
          email: 'creator@example.com',
          phone: '+54 11 9876-5432',
        },
      }

      expect(() => creatorStep2Schema.parse(creatorData.step2)).not.toThrow()
    })
  })
})