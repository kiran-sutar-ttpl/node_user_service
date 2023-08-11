/* eslint-disable no-use-before-define */
const AWS = require('aws-sdk')
const moment = require('moment')
const favouriteResource = require('../../src/favouriteResource')

AWS.config.update({ region: process.env.REGION })

const saveFavouriteResourceIdInUserProfileRequest = require('../jsons/saveFavouriteResourceIdInUserProfileReqInt.json')
const removeFavouriteResourceIdFromUserProfileRequest = require('../jsons/removeFavouriteResourceIdFromUserProfileReqInt.json')

beforeAll(async () => {
    await createSupplier()
    await createUser()
    await createResource()
    await createClient()
})

afterAll(async () => {
    await deleteSupplier()
    await deleteUser()
    await deleteResource()
    await deleteClient()
})

const USER_ID = 'userc00-cd4f-11ec-9d64-0242ac120002'
const CLIENT_ID = 'clientb140-af22-45e5-b1f9-4210bf523b45'
const USER_EMAIL = 'integration.test.thinkitive@getnada.com'
const PILOT_TAG = 'thinkitive 2'
const CLIENT_EMAIL = 'integration.test.client.thinkitive@getnada.com'

const SUPPLIER_ID = '694651b1-abcc-42b6-aefc-6239324464f6'
const STATUS = 'Complete'
const TRANSACTION_TOTAL = 0
const LATE_TRANSACTION = 0
const FINANCE_EMAIL = 'integration_test_finance@supplier.com'
const PRIMARY_CONTACT_EMAIL = 'integration.test.thinkitive@getnada.com'
const COMPANY_NAME = 'thinkitive Integration Supplier'
const ACCOUNT_PAYABLE_EMAIL = 'integration_test_accounts@supplier.com'
const PRIMARY_CONTACT_PHONE = '9922338899'

const RESOURCE_ID = 'act_gks990zdppzo764va9el4bbprilyn8s'
const PRODUCT_ID = 'pro_11f740d0-4f40-11eb-9e5b-1d32f2339a4'
const PRICE_DESC = 'STONE - Silk Sleep Eye Mask'
const TITLE = 'Test - Eucalyptus Silk Sleep Eye Mask'

it('should be able to save favourite resource id in user profile', async () => {
    const result = await favouriteResource.handler(saveFavouriteResourceIdInUserProfileRequest)
    expect(result).toHaveProperty('Attributes')
    expect(result.Attributes).toHaveProperty('favouriteResources')
})

it('should be able to remove favourite resource id from user profile', async () => {
    const result = await favouriteResource.handler(removeFavouriteResourceIdFromUserProfileRequest)
    expect(result).toEqual({})
})

const createSupplier = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const createSupplier = {
        TableName: process.env.SUPPLIERS_TABLE_NAME,
        Item: {
            __typename: 'Supplier',
            supplierId: SUPPLIER_ID,
            isVoucherSupplier: true,
            isProductSupplier: true,
            status: STATUS,
            transactionsTotal: TRANSACTION_TOTAL,
            lateTransactions: LATE_TRANSACTION,
            financeEmail: FINANCE_EMAIL,
            primaryContactEmail: PRIMARY_CONTACT_EMAIL,
            companyName: COMPANY_NAME,
            updatedAt: moment(new Date()).format(),
            createdAt: moment().format(),
            accountsPayableEmail: ACCOUNT_PAYABLE_EMAIL,
            address: [
                {
                    secondLine: 'Int Ave Test',
                    country: 'United Kingdom',
                    postCode: 'EC2A 4BX',
                    city: 'Elms',
                    firstLine: '100 Main St',
                },
            ],
            primaryContactPhone: PRIMARY_CONTACT_PHONE,
            vouchers: [
                {
                    monthlyUsage: 0,
                    price: 8796,
                    priceDesc: 'Yearly',
                    productId: 'vouchers-fda3-4cb7-a64e-2130bc8fd82c',
                    resourceId: 'vouchers-8802-482d-85a4-de6a6cf50f73',
                    resourceTitle: 'Perlego',
                    totalReceived: 1,
                    totalUsed: 0,
                },
            ],
        },
    }

    await documentClient.put(createSupplier)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}

const createUser = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const createUser = {
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
        Item: {
            active: true,
            announceNewFeature: true,
            assessmentState: false,
            assessmentUpdateState: 'NTNU',
            budget: 14905,
            clientId: CLIENT_ID,
            companyBudget: 10000,
            department: 'IT',
            email: USER_EMAIL,
            familyName: 'fe2',
            givenName: 'test',
            locale: {
                currency: 'GBP',
            },
            personalBudget: 0,
            pilotTag: PILOT_TAG,
            privacyPolicyRead: false,
            profileCreationDate: moment().toISOString(),
            role: 'Manager',
            tags: [],
            userId: USER_ID,
        },
    }

    await documentClient.put(createUser)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}

const createResource = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const createResource = {
        TableName: process.env.DIRECTORY_TABLE_NAME,
        Item: {
            activeInclude: true,
            addressConverted: false,
            age: [
                'all',
            ],
            algorithmTags: [

            ],
            automationType: 'Product',
            autoPayed: false,
            availability: [

            ],
            availabilityDescription: ' ',
            thinkitiveEvent: false,
            bookingTags: [

            ],
            commitmentsTags: [
                'Create a great sleep environment',
            ],
            companyBenefit: ' ',
            confirmationTextFree: '',
            confirmationTextPaidDigital: '',
            confirmationTextPaidProduct: '',
            ctaAndroid: ' ',
            ctaInstructions: ' ',
            ctaIos: ' ',
            ctaWeb: 'https://www.test.co.in/products/eucalyptus-eye-mask',
            dateOfLastUpdate: '2022-04-05T11:07:30+00:00',
            deliveryEstimatedDuration: 10,
            deliveryMethod: [
                'Post',
            ],
            description: "TAKE ADVANTAGE OF TEST's EXCEPTIONAL SPRING DISCOUNTS!\n\nWoven from ultra-soft, 100% Eucalyptus thread, which feels like a cool caress against your eyelids.\n\nMade from 100% cooling and soft Eucalyptus Silk (Lyocell), with 300 ply thread count - meaning it's super soft.\n\nOur fabrics are Oeko-Tex certified to ensure they are free from any harmful chemicals or toxins making it kind on your skin.\n\nYou protect 1000-square-feet of Amazonian rainforest when you buy this sleep eyemask.",
            digital: false,
            disabilityTags: [

            ],
            downloadAndroid: '',
            downloadiOS: '',
            emailText: ' ',
            eventsDateAndTime: ' ',
            featuredForClients: [

            ],
            filterTags: [
                'Product',
            ],
            filterTagsByPillar: [
                'S_PRODUCT',
            ],
            free: false,
            gender: [

            ],
            goalTags: [
                'SL_ENERGISED',
                'SL_ENVIRONMENT',
                'SL_BRIGHT',
            ],
            howToBuy: ' ',
            icon: 'https://cdn.shopify.com/s/files/1/0056/6735/6775/products/Eye_Maskcopy_1000x.progressive.jpg?v=1608743260',
            iconAlt: ' ',
            iconOriginal: 'https://thinkitive-resized-images.s3.ap-south-1.amazonaws.com/medias/images/MelaSleepMask/iconOriginal_d4070b10-5ca6-11eb-9f41-b545808677f8.jpg',
            image: 'https://images-airtable-public.s3.ap-south-1.amazonaws.com/MELA-15.6.207346.jpg',
            imageAlt: ' ',
            imageHero: 'https://thinkitive-resized-images.s3.ap-south-1.amazonaws.com/medias/images/MelaSleepMask/imageHero-1024-576.jpg',
            imageOriginal: 'https://thinkitive-resized-images.s3.ap-south-1.amazonaws.com/medias/images/MelaSleepMask/imageOriginal.jpg',
            imagesConverted: true,
            imageThumbL: 'https://thinkitive-resized-images.s3.ap-south-1.amazonaws.com/medias/images/MelaSleepMask/imageThumbL-480-270.jpg',
            imageThumbS: 'https://thinkitive-resized-images.s3.ap-south-1.amazonaws.com/medias/images/MelaSleepMask/imageThumbS-250-250_d3f0c3f0-5ca6-11eb-9f41-b545808677f8.jpg',
            liveForPilots: [
                'thinkitive 2',
            ],
            nearToYourOffice: [

            ],
            needsAddress: true,
            newToPilots: [

            ],
            notes: ' ',
            oneliner: 'Gently blocks out light for a deeper sleep',
            otherTags: [

            ],
            pillars: [
                'Sleep',
            ],
            problemsTags: [

            ],
            products: [
                {
                    invitable: false,
                    price: {
                        description: 'Stone',
                        discount: 450,
                        discountedBy: 'n/a',
                        discountedValue: 2549,
                        value: 2999,
                    },
                    productVATRate: ' ',
                    retailer: 'n/a',
                },
            ],
            productsV2: [
                {
                    discountPercentage: 30,
                    hidePrice: false,
                    invitable: false,
                    outOfStock: true,
                    priceAfterDiscount: 1330,
                    priceDesc: PRICE_DESC,
                    priceDiscountedShipping: 0,
                    priceDiscountedTotal: 1330,
                    priceDiscountedUnit: 1330,
                    priceFinal: 1330,
                    priceOriginal: 1900,
                    priceOriginalShipping: 0,
                    priceOriginalTotal: 1900,
                    priceOriginalUnit: 1900,
                    productId: PRODUCT_ID,
                    productVATOption: 'STD: 20%',
                    productVATRate: 20,
                    sku: 'n/a',
                    supplierDiscountPercentage: 30,
                },
            ],
            qaProcess: 'Pass',
            ratings: {
                averageRating: 4.666666666666667,
                fiveStar: 2,
                fourStar: 1,
                oneStar: 0,
                threeStar: 0,
                totalPoints: 14,
                totalRatingsNumber: 3,
                twoStar: 0,
            },
            resourceId: RESOURCE_ID,
            resourceSupplierId: SUPPLIER_ID,
            retailer: 'n/a',
            showToPilots: [
                'thinkitive 2',
            ],
            solutionLevel: 'Medium',
            supplierIdAirtable: 'recFV4blCSbRliOuR',
            supplierInfo: [
                {
                    address: {
                        city: ' ',
                        country: ' ',
                        countryCode: ' ',
                        county: ' ',
                        formatted: ' ',
                        latitude: null,
                        longitude: null,
                        phone: ' ',
                        postcode: ' ',
                        state: ' ',
                        stateCode: ' ',
                        streetName: ' ',
                        streetNumber: ' ',
                    },
                    email: 'support@test.co.in',
                },
            ],
            supplierPrivacyPolicy: [
                'https://www.test.co.in/policies/privacy-policy',
            ],
            supplierRefundPolicy: [

            ],
            supplierTermsAndConditions: [
                'https://www.test.co.in/pages/shipping-returns',
            ],
            supplierVATCode: '332432436',
            title: TITLE,
            type: 'Product',
            typeOfEngagement: [
                '0',
            ],
            visibleWebsite: 'https://www.test.co.in/products/eucalyptus-eye-mask',
            website: 'https://www.test.co.in/products/eucalyptus-eye-mask',
            websiteOther: ' ',
            websiteSchedule: ' ',
        },
    }

    await documentClient.put(createResource)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}

const createClient = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const createClient = {
        TableName: process.env.CLIENTS_TABLE_NAME,
        Item: {
            clientId: CLIENT_ID,
            status: 'Complete',
            informationNeeded: '',
            email: CLIENT_EMAIL,
            websiteLink: 'web.com',
            launchDate: moment(new Date()).format(),
            companyName: 'thinkitive Integration Client',
            domain: 'web.com',
            invoicingContactEmails: [],
            pilotTag: PILOT_TAG,
            employeesCount: 0,
            signedUpCount: 0,
            deactivatedUsers: 0,
            minimumUsersToDisplayScores: 100,
            departments: [],
            createdAt: moment(new Date()).format(),
            stripeCustomer: {
                metadata: {
                    clientId: CLIENT_ID,
                },
                subscriptions: {
                    has_more: false,
                    data: [],
                    total_count: 0,
                    url: '/v1/customers/cus_Jt32qVbCc7s4OZ/subscriptions',
                    object: 'list',
                },
                account_balance: 0,
                livemode: false,
                sources: {
                    has_more: false,
                    data: [],
                    total_count: 0,
                    url: '/v1/customers/cus_Jt32qVbCc7s4OZ/sources',
                    object: 'list',
                },
                tax_ids: {
                    has_more: false,
                    data: [],
                    total_count: 0,
                    url: '/v1/customers/cus_Jt32qVbCc7s4OZ/tax_ids',
                    object: 'list',
                },
                next_invoice_sequence: 1,
                description: 'StrComp',
                discount: null,
                tax_info_verification: null,
                preferred_locales: [],
                balance: 0,
                shipping: null,
                delinquent: false,
                currency: null,
                id: 'cus_Jt32qVbCc7s4OZ',
                email: 'integration@developer.com',
                invoice_settings: {
                    footer: null,
                    custom_fields: null,
                    default_payment_method: null,
                },
                address: {
                    country: 'UA',
                    state: 'MyCounty',
                    postal_code: '01234',
                    city: 'MyCity',
                    line2: 'Line2',
                    line1: 'Some address',
                },
                default_source: null,
                invoice_prefix: '9A136DB9',
                tax_exempt: 'none',
                created: 1626779788,
                tax_info: null,
                phone: null,
                name: 'StrComp',
                object: 'customer',
            },
            companyNicknames: ['thinkitive Integration Client'],
            checkoutSession: {
                metadata: {},
                after_expiration: null,
                livemode: false,
                display_items: [],
                amount_total: null,
                subscription: null,
                locale: null,
                mode: 'setup',
                customer_details: null,
                consent_collection: null,
                expires_at: 1640097793,
                allow_promotion_codes: null,
                shipping: null,
                phone_number_collection: {
                    enabled: false,
                },
                client_reference_id: null,
                currency: null,
                id: 'cs_test_c1xdr39DO8pjJbreFsZFH7tWAZVW2LNWV0WraO7aHPTnB8F32oC7WESzaI',
                payment_method_options: {},
                billing_address_collection: null,
                success_url: 'https://dev-management.thinkitive.in/login#success',
                setup_intent: 'seti_1K8n53E3fe6CMvlnelUjYFfv',
                shipping_address_collection: null,
                payment_method_types: [
                    'bacs_debit',
                ],
                total_details: null,
                payment_status: 'no_payment_required',
                shipping_options: [],
                consent: null,
                url: 'https://checkout.stripe.com/pay/cs_test_c1xdr39DO8pjJbreFsZFH7tWAZVW2LNWV0WraO7aHPTnB8F32oC7WESzaI#fidkdWxOYHwnPyd1blpxYHZxWjxgbHwxVWBNaE40VFx0PHA0RmxJcmF8ZjU1UFc8Uj1fMEInKSdjd2poVmB3c2B3Jz9xd3BgKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmZqaXBoaycpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',
                recovered_from: null,
                submit_type: null,
                automatic_tax: {
                    enabled: false,
                    status: null,
                },
                shipping_rate: null,
                customer_email: null,
                payment_intent: null,
                cancel_url: 'https://dev-management.thinkitive.in/login#success',
                amount_subtotal: null,
                object: 'checkout.session',
                customer: 'cus_KoPuiO6X6UruQF',
                status: 'open',
            },
        },
    }

    await documentClient.put(createClient)
        .promise()
        .then((data) => data)
        .catch((err) => {
            console.log('Error creating client. ', err)
        })
}

const deleteSupplier = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const deleteSupplier = {
        Key: {
            supplierId: SUPPLIER_ID,
        },
        TableName: process.env.SUPPLIERS_TABLE_NAME,
    }

    await documentClient.delete(deleteSupplier)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}

const deleteUser = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const deleteUser = {
        Key: {
            userId: USER_ID,
        },
        TableName: process.env.USERS_PROFILES_TABLE_NAME,
    }

    await documentClient.delete(deleteUser)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}

const deleteResource = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const deleteResource = {
        Key: {
            resourceId: RESOURCE_ID,
        },
        TableName: process.env.DIRECTORY_TABLE_NAME,
    }

    await documentClient.delete(deleteResource)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}

const deleteClient = async () => {
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

    const deleteClient = {
        Key: {
            clientId: CLIENT_ID,
        },
        TableName: process.env.CLIENTS_TABLE_NAME,
    }

    await documentClient.delete(deleteClient)
        .promise()
        .then((data) => data)
        .catch((err) => err)
}
