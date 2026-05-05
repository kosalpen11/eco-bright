export function buildSupportMessage(shopName: string, supportTarget?: string | null) {
  return supportTarget
    ? `Need help with ${shopName}? Open the sales chat at @${supportTarget.replace(/^@/, "")} and send your question or product link.`
    : `Need help with ${shopName}? Reply here and our support team will assist you.`;
}
