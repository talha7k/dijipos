export const shortPosReportA4 = `<html>
<style>p { margin: 0; } h1, h2, h3, h4, h5, h6 { margin: 0; }</style>
<body style="font-family: sans-serif; margin: 20px;">
    <h1 style="font-size: 24px; text-align: center; margin-bottom: 20px;">{{title}}</h1>

    <h2>Generated: {{generationTime}}</h2>
    <h2>From: {{fromDate}}</h2>
    <h2>To: {{toDate}}</h2>

    <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Summary</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tbody>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Subtotal</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{totalSubtotal}}</td></tr>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total VAT</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{totalTax}}</td></tr>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Total Sales</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right; font-weight: bold;">{{totalSales}}</td></tr>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total Commission</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{totalCommission}}</td></tr>
      </tbody>
    </table>

    <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Total by Payment Type</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead><tr><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Amount</th></tr></thead>
      <tbody>
        {{#each salesByPaymentType}}
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-transform: capitalize;">{{@key}}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{this}}</td></tr>
        {{/each}}
      </tbody>
    </table>

    <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Total by Order Type</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead><tr><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Amount</th></tr></thead>
      <tbody>
        {{#each salesByOrderType}}
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-transform: capitalize;">{{@key}}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{this}}</td></tr>
        {{/each}}
      </tbody>
    </table>
</body>
</html>`;