import { RatioCard } from "./RatioCard";

const ratioSections = [
  {
    title: "Liquidity Ratios",
    ratios: [
      { name: "Current Ratio", value: "2.4", change: 5.2, definition: "Current Assets / Current Liabilities" },
      { name: "Quick Ratio", value: "1.8", change: 3.1, definition: "(Current Assets - Inventory) / Current Liabilities" },
      { name: "Cash Ratio", value: "0.9", change: -2.3, definition: "Cash / Current Liabilities" },
    ],
  },
  {
    title: "Profitability Ratios",
    ratios: [
      { name: "Gross Margin %", value: "42.5%", change: 2.8, definition: "(Revenue - COGS) / Revenue" },
      { name: "Net Profit Margin %", value: "18.2%", change: 4.5, definition: "Net Profit / Revenue" },
      { name: "Return on Assets", value: "12.4%", change: 1.9, definition: "Net Income / Total Assets" },
      { name: "Return on Equity", value: "22.1%", change: 6.2, definition: "Net Income / Shareholders Equity" },
    ],
  },
  {
    title: "Leverage Ratios",
    ratios: [
      { name: "Debt-to-Equity", value: "0.45", change: -1.5, definition: "Total Debt / Total Equity" },
      { name: "Interest Coverage", value: "8.2", change: 12.3, definition: "EBIT / Interest Expense" },
      { name: "Debt Ratio", value: "0.31", change: -2.1, definition: "Total Debt / Total Assets" },
    ],
  },
  {
    title: "Efficiency Ratios",
    ratios: [
      { name: "Inventory Turnover", value: "6.4", change: 8.7, definition: "COGS / Average Inventory" },
      { name: "Receivables Days", value: "42", change: -5.2, definition: "(Accounts Receivable / Revenue) × 365" },
      { name: "Payables Days", value: "38", change: 2.8, definition: "(Accounts Payable / COGS) × 365" },
    ],
  },
];

export const RatioSections = () => {
  return (
    <div className="space-y-6">
      {ratioSections.map((section, index) => (
        <div key={index} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.ratios.map((ratio, ratioIndex) => (
              <RatioCard key={ratioIndex} {...ratio} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
