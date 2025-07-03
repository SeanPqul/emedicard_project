import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

    //Users
    users: defineTable({
        fullname: v.string(),
        email: v.string(),
        gender: v.string(),
        birthDate: v.number(),
        phoneNumber: v.number(),
        clerkId: v.string(),    
    })
    .index("by_clerk_id", ["clerkId"]),

    //Healthcards type
    jobCategory: defineTable({
        name: v.string(),
        colorCode: v.string(),
        requireOrientation: v.string()
    }),

    //User form
    forms: defineTable({
        userId: v.id("users"),
        applicationType: v.union(
            v.literal("New"), 
            v.literal("Renew")
        ),
        jobCategory: v.id("jobCategory"),
        position: v.string(),
        organization: v.string(),
        civilStatus: v.string()
    })
    .index("by_user", ["userId"]),
    
    //Requirements
    requirements : defineTable ({
        formId: v.id("forms"),
        validId: v.id("_storage"),
        picture: v.id("_storage"),
        chestXrayId: v.id("_storage"),
        urinalysisId: v.id("_storage"),
        stoolId: v.id("_storage"),
        cedulaId: v.id("_storage"),

        //additional for security guard
        neuroExamId: v.optional(v.id("_storage")),
        drugTestId: v.optional(v.id("_storage"))
    })
    .index("by_form", ["formId"]),

    //Payments
    payments: defineTable({
        formId: v.id("forms"),
        amount: v.number(), //50
        serviceFee: v.number(), //10
        netAmount: v.number(), //60
        method: v.union(
            v.literal("Gcash"),
            v.literal("Maya"),
            v.literal("BaranggayHall"),
            v.literal("CityHall")
        ),
        referenceNumber: v.string(),

        //manual receipt upload pag baranggay hall or city hall 
        receiptId: v.optional(v.id("_storage")),
        status: v.union(
            v.literal("Pending"),
            v.literal("Complete"),
            v.literal("Failed")
        )
    })
    .index("by_form", ["formId"]),

    //Application forms of applicants
    applicationForms: defineTable ({
        userId: v.id("users"),
        formId: v.id("forms"),
        status: v.union(
            v.literal("Submitted"),
            v.literal("Under Review"),
            v.literal("Approved"),
            v.literal("Rejected")          
        ),
        approvedAt: v.number(),
        remarks: v.optional(v.string()),
    })
    .index("by_user", ["userId"])
    .index("by_form", ["formId"]),
    
    //Orientation for yellow (food)
    orientations: defineTable({
        formId: v.id("forms"),
        scheudleAt: v.number(),
        qrCodeUrl: v.string(), // session QR to scan
        checkInTime: v.number(), //inspector to scan for time in
        checkOutTime: v.number() //inspector to scan for time out
    })
    .index("by_form", ["formId"]),

    //Healthcard issuance/releasing
    healthCards: defineTable({
        formId: v.id("forms"),
        cardUrl: v.string(),
        issuedAt: v.number(),
        expiresAt: v.number(),
        verificationToken: v.string() //unguessable token for QR
    })
    .index("by_form", ["formId"])
    .index("by_verificationToken", ["verificationToken"]),

    //Notification
    notifications: defineTable({
        userId: v.id("users"),
        formsId: v.optional(v.id("forms")),
        //custom notifcations
        type: v.union(
            v.literal("MissingDoc"),
            v.literal("PaymentReceived"),
            v.literal("FormApproved"),
            v.literal("OrientationScheduled"),
            v.literal("CardIssue")
        ),
        messag: v.string(),
        read: v.boolean(),
    })
    .index("by_user", ["userId"]),

    //Verification logs for QR scan 
    verificationLogs: defineTable({
        healthCardId: v.id("healthCards"),
        scannedAt: v.number(),
        userAgent: v.optional(v.string()),  //device info
        ipAddress: v.optional(v.string())   
    })
    .index("by_healthcard", ["healthCardId"])
}) 