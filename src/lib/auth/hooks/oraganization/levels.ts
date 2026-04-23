export type WFGLevel = "ta" | "a" | "md" | "smd" | "emd" | "ceo" | "evc" | "sevc";

// Lower number = lower rank (1 is lowest)
export const WFG_LEVELS: Record<WFGLevel, number> = {
    ta: 1,
    a: 2,
    md: 3,
    smd: 4,
    emd: 5,
    ceo: 6,
    evc: 7,
    sevc: 8,
};



export const WFG_LEVEL_META: Record<WFGLevel, { label: string; abbreviation: string; description: string }> = {
    ta: {
        label: "Training Associate",
        abbreviation: "TA",
        description: "Training Associate",
    },
    a: {
        label: "Associate",
        abbreviation: "A",
        description: "Associate",
    },
    md: {
        label: "Marketing Director",
        abbreviation: "MD",
        description: "Marketing Director",
    },
    smd: {
        label: "Senior Marketing Director",
        abbreviation: "SMD",
        description: "Senior Marketing Director",
    },
    emd: {
        label: "Executive Marketing Director",
        abbreviation: "EMD",
        description: "Executive Marketing Director",
    },
    ceo: {
        label: "Chief Executive Officer",
        abbreviation: "CEO",
        description: "Chief Executive Officer",
    },
    evc: {
        label: "Executive Vice Chairman",
        abbreviation: "EVC",
        description: "Executive Vice Chairman",
    },
    sevc: {
        label: "Senior Executive Vice Chairman",
        abbreviation: "SEVC",
        description: "Senior Executive Vice Chairman",
    },
};