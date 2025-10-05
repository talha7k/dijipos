export const posReportA4 = `<html>
<style>p { margin: 0; } h1, h2, h3, h4, h5, h6 { margin: 0; }</style>
<body style="font-family: sans-serif; margin: 20px;">
    <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">{{title}}</h1>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px;">
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <div style="font-weight: bold; margin-bottom: 10px;">Total Sales</div>
        <div style="font-size: 24px; font-weight: bold;">{{totalSales}}</div>
      </div>
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <div style="font-weight: bold; margin-bottom: 10px;">Total Orders</div>
        <div style="font-size: 24px; font-weight: bold;">{{totalOrders}}</div>
      </div>
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <div style="font-weight: bold; margin-bottom: 10px;">Items Sold</div>
        <div style="font-size: 24px; font-weight: bold;">{{totalItemsSold}}</div>
      </div>
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <div style="font-weight: bold; margin-bottom: 10px;">Avg. Order Value</div>
        <div style="font-size: 24px; font-weight: bold;">{{averageOrderValue}}</div>
      </div>
    </div>

    {{#if isDetailed}}
    <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Sales by Payment Type</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead><tr><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Amount</th></tr></thead>
      <tbody>
        {{#each salesByPaymentType}}
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-transform: capitalize;">{{@key}}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{this}}</td></tr>
        {{/each}}
      </tbody>
    </table>

    <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Sales by Order Type</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead><tr><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Amount</th></tr></thead>
      <tbody>
        {{#each salesByOrderType}}
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-transform: capitalize;">{{@key}}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{this}}</td></tr>
        {{/each}}
      </tbody>
    </table>

    <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Top Selling Items</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead><tr><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Total</th></tr></thead>
      <tbody>
        {{#each topSellingItems}}
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left;">{{this.name}}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{this.quantity}}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{this.total}}</td></tr>
        {{/each}}
      </tbody>
    </table>

    <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Orders by Status</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead><tr><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Count</th></tr></thead>
      <tbody>
        {{#each ordersByStatus}}
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-transform: capitalize;">{{@key}}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{this}}</td></tr>
        {{/each}}
      </tbody>
    </table>
    {{/if}}

    <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Financial Summary</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tbody>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Subtotal (before VAT)</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{totalSubtotal}}</td></tr>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total VAT Collected</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{totalTax}}</td></tr>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Total Sales</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right; font-weight: bold;">{{totalSales}}</td></tr>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total Commission</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{totalCommission}}</td></tr>
      </tbody>
    </table>
</body>
</html>`;