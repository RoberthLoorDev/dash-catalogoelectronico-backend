export function validateFields(body: Record<string, any>, requiredFields: string[]): string[] {
     return requiredFields.filter((field) => !body[field] && body[field] !== 0 && body[field] !== false);
}
