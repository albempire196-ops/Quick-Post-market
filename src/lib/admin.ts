const ADMIN_EMAILS = ["albempire196@gmail.com"];

export const ADMIN_REPORT_EMAIL = ADMIN_EMAILS[0];

export const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

const buildComposeBody = (lines: string[]) => lines.join("\n");

export const buildOutlookComposeUrl = ({
  subject,
  body,
}: {
  subject: string;
  body: string;
}) => {
  const params = new URLSearchParams({
    to: ADMIN_REPORT_EMAIL,
    subject,
    body,
  });

  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
};

export const buildReportEmailBody = ({
  productTitle,
  productId,
  sellerName,
  sellerId,
  reporterName,
  reporterEmail,
  reason,
  details,
}: {
  productTitle: string;
  productId: string;
  sellerName: string;
  sellerId?: string | null;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  details?: string | null;
}) =>
  buildComposeBody([
    "New marketplace report",
    "",
    `Product: ${productTitle}`,
    `Product ID: ${productId}`,
    `Seller name: ${sellerName}`,
    `Seller ID: ${sellerId || "Unknown"}`,
    `Reported by: ${reporterName}`,
    `Reporter email: ${reporterEmail}`,
    `Reason: ${reason}`,
    `Details: ${details?.trim() || "No extra details"}`,
  ]);