import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        fullname: v.string(),
        email: v.string(),
        phoneNumber: v.number(),
        clerkId: v.string(),    
    })
    .index("by_clerk_id", ["clerkId"]),

    applications: defineTable({
        userId: v.id("users"),
        applicationType: v.string(),
        jobCategory: v.string(),
        position: v.string(),
        organization: v.string(),
        gender: v.string(),
        birthDate: v.number(),
        civilStatus: v.string()
    })
    .index("by_user", ["userId"]),
    
    requirements : defineTable ({
        applicationId: v.id("applications"),
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
    .index("by_application", ["applicationId"]),

    payments: defineTable({
        applicationId: v.id("applications"),
        amount: v.number(),
        serviceFee: v.number(),
        netAmount: v.number(),
        method: v.union(
            v.literal("Gcash"),
            v.literal("Maya"),
            v.literal("BaranggayHall"),
            v.literal("CityHall")
        ),
        //manual receipt upload pang baranggay hall or city hall 
        receiptId: v.optional(v.id("_storage")),

        status: v.union(
            v.literal("Pending"),
            v.literal("Complete"),
            v.literal("Failed")
        )
    })
    .index("by_application", ["applicationId"]),

    applicationForms: defineTable ({
        userId: v.id("users"),
        applicationId: v.id("applications"),
        status: v.string(),
        approvedAt: v.number(),
        remarks: v.optional(v.string()),
    })
    .index("by_user", ["userId"])
    .index("by_application", ["applicationId"])
    
})