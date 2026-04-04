const getSupabaseErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return maybeError.message || maybeError.details || maybeError.hint || maybeError.code || JSON.stringify(error);
  }

  return String(error ?? "");
};

export const getFeatureSetupErrorMessage = (error: unknown, featureName: string) => {
  const message = getSupabaseErrorMessage(error);
  const normalized = message.toLowerCase();

  if (
    normalized.includes("relation") ||
    normalized.includes("does not exist") ||
    normalized.includes("schema cache")
  ) {
    return `${featureName} nuk funksionon ende sepse mungon setup-i i Supabase. Ekzekuto manual_setup.sql.`;
  }

  if (normalized.includes("row-level security") || normalized.includes("policy")) {
    return `${featureName} po bllokohet nga policy-t e Supabase.`;
  }

  return message;
};