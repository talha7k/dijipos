export const shortPosReportThermal = `<html>
<body style="font-family: monospace; font-size: 10px; margin: 5px;">
    <h1 style="font-size: 12px; text-align: center; margin-bottom: 5px;">{{title}}</h1>

    <h2 style="color: #333; font-size: 11px; border-bottom: 1px solid #eee; padding-bottom: 2px; margin-top: 10px;">Generated: {{generationTime}}</h2>
    <h2 style="color: #333; font-size: 11px; border-bottom: 1px solid #eee; padding-bottom: 2px; margin-top: 10px;">From: {{fromDate}}</h2>
    <h2 style="color: #333; font-size: 11px; border-bottom: 1px solid #eee; padding-bottom: 2px; margin-top: 10px;">To: {{toDate}}</h2>

    <h2 style="color: #333; font-size: 11px; border-bottom: 1px solid #eee; padding-bottom: 2px; margin-top: 10px;">Summary</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10px;">
      <tbody>
        <tr><td style="border: none; padding: 2px; text-align: left;">Total Orders Processed</td><td style="border: none; padding: 2px; text-align: left; text-align: right;">{{totalOrders}}</td></tr>
        <tr><td style="border: none; padding: 2px; text-align: left;">Total Items Sold</td><td style="border: none; padding: 2px; text-align: left; text-align: right;">{{totalItemsSold}}</td></tr>
        <tr><td style="border: none; padding: 2px; text-align: left;">Subtotal</td><td style="border: none; padding: 2px; text-align: left; text-align: right;">{{totalSubtotal}}</td></tr>
        <tr><td style="border: none; padding: 2px; text-align: left;">Total VAT</td><td style="border: none; padding: 2px; text-align: left; text-align: right;">{{totalTax}}</td></tr>
        <tr><td style="border: none; padding: 2px; text-align: left; font-weight: bold;">Total Sales</td><td style="border: none; padding: 2px; text-align: left; text-align: right; font-weight: bold;">{{totalSales}}</td></tr>
        <tr><td style="border: none; padding: 2px; text-align: left;">Total Commission</td><td style="border: none; padding: 2px; text-align: left; text-align: right;">{{totalCommission}}</td></tr>
      </tbody>
    </table>

    <h2 style="color: #333; font-size: 11px; border-bottom: 1px solid #eee; padding-bottom: 2px; margin-top: 10px;">Total by Payment Type</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10px;">
      <tbody>
        {{#each salesByPaymentType}}
        <tr><td style="border: none; padding: 2px; text-align: left; text-transform: capitalize;">{{@key}}</td><td style="border: none; padding: 2px; text-align: left; text-align: right;">{{this}}</td></tr>
        {{/each}}
      </tbody>
    </table>

    <h2 style="color: #333; font-size: 11px; border-bottom: 1px solid #eee; padding-bottom: 2px; margin-top: 10px;">Total by Order Type</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10px;">
      <tbody>
        {{#each salesByOrderType}}
        <tr><td style="border: none; padding: 2px; text-align: left; text-transform: capitalize;">{{@key}}</td><td style="border: none; padding: 2px; text-align: left; text-align: right;">{{this}}</td></tr>
        {{/each}}
      </tbody>
    </table>
</body>
</html>`;