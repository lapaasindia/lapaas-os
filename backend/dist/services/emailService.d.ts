export declare const sendEmail: (to: string, templateType: "verifyEmail" | "passwordReset" | "welcomeEmail", data: any) => Promise<{
    success: boolean;
    messageId: string;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    messageId?: undefined;
}>;
export declare const testEmailConnection: () => Promise<{
    success: boolean;
    error?: undefined;
} | {
    success: boolean;
    error: any;
}>;
//# sourceMappingURL=emailService.d.ts.map